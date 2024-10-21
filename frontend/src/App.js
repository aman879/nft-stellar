import { useEffect, useState } from "react";
import "./App.css";
import Mint from "./component/Mint/Mint";
import Home from "./component/Home/Home";
import Navbar from "./component/Navbar/Navbar";
import { setAllowed, getAddress } from "@stellar/freighter-api";
import jws from "./contract/key.json";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PinataSDK } from "pinata-web3";
import {
  Address,
  BASE_FEE,
  Contract,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative
} from "stellar-sdk";
import {
  isConnected,
  signTransaction,
} from "@stellar/freighter-api";
import Explore from "./component/Explore/Explore";

const pinata = new PinataSDK({
  pinataJwt: jws.jws,
  pinataGateway: "beige-sophisticated-baboon-74.mypinata.cloud",
});

const CONTRACT_ID = "CCCRVPLY4SLPYSSFD7C4CYK5PJQEFTCYQD7X2WF2MJRZQUP5UH4TTRIQ";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const SOROBAN_URL = "https://soroban-testnet.stellar.org";

const App = () => {
  const [route, setRoute] = useState("home");
  const [address, setAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [shouldFetchNfts, setShouldFetchNfts] = useState(false);
  const [nfts, setNfts] = useState([]);
  let server;
  let contract;

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const connected = await isConnected();
        setConnected(connected.isConnected);
        if (connected) {
          const addressData = await getAddress();
          setAddress(addressData.address);
        }
      } catch (error) {
        console.error("Error fetching wallet data: ", error);
      }
    };

    fetchWalletData();
  }, []);

  useEffect(() => {
    server = new SorobanRpc.Server(SOROBAN_URL);
    contract = new Contract(CONTRACT_ID);
    async function getAllNFTs() {
      if (server && address) { 
        try {
          setIsLoading(true);
          const account = await server.getAccount(address); 
          const tx = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
          })
            .addOperation(contract.call('get_nfts'))
            .setTimeout(30)
            .build();

          let res;

          const response = await server.simulateTransaction(tx);
          if(
            SorobanRpc.Api.isSimulationSuccess(response) &&
            response.result !== undefined
          ) {
            res = scValToNative(response.result.retval);
          }

          const nfts = [];
          if (res) {
            res.map(async (nft) => {
              const response = await fetch(`https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${nft.uri}`);
              
              if (!response.ok) {
                throw new Error(`Failed to fetch URI data for NFT with ID: ${nft.id}`);
              }
              
              const uriData = await response.json();
              
              const mergedNFTData = {
                ...nft,
                ...uriData, 
              };
              nfts.push(mergedNFTData);
            })
          }
          setNfts(nfts)
          setShouldFetchNfts(false);
          setIsLoading(false);
        } catch (error) {
            console.error('Error fetching NFTs:', error);
            toast.error("Error fetching NFTs", {
              position: "top-center"
            })
          }
        }
      }
      getAllNFTs();
  }, [shouldFetchNfts, address]);

  const onRouteChange = (route) => {
    setRoute(route);
  };

  const onConnect = async () => {
    try {
      await setAllowed();
      const addressData = await getAddress();

      setAddress(addressData.address);
    } catch (error) {
      console.error("Error connecting wallet: ", error);
    }
  };

  const uploadToPinata = async (file, name, description) => {
    if (!file) {
      throw new Error("File is required");
    }

    try {
      toast.info("Uploading video to IPFS", {
        position:"top-center"
      })
      const uploadImage = await pinata.upload.file(file);
      const metadata = await pinata.upload.json({
        name: name,
        description: description,
        video: `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uploadImage.IpfsHash}`,
      });
      return metadata.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      toast.error("Minting NFT failed.", {
        position: "top-center"
      });
      throw new Error("Upload to Pinata failed.");
    }
  };

  const addressToScVal = (account) => {
    const address = new Address(account);
  
    return address.toScVal();
  };

  const mintNFT = async (uri) => {
    server = new SorobanRpc.Server(SOROBAN_URL);
    contract = new Contract(CONTRACT_ID);
    if (!address){
        console.error("Wallet not connected");
        return;
    }

    if (typeof uri !== 'string') {
        console.error("Invalid URI provided:", uri);
        return;
    }

    try {
        const account = await server.getAccount(address);
        
        const tx = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(contract.call('mint', nativeToScVal(uri), addressToScVal(address)))
            .setTimeout(30)
            .build();

        const preparedTx = await server.prepareTransaction(tx);
        const signedXdr = await signTransaction(preparedTx.toXDR(), {
            networkPassphrase: NETWORK_PASSPHRASE,
        });
        console.log(signedXdr)

        const signedTx = TransactionBuilder.fromXDR(signedXdr.signedTxXdr, NETWORK_PASSPHRASE);
        console.log(signedTx)
        const txResult = await server.sendTransaction(signedTx);


        if (txResult.status !== 'PENDING') {
            throw new Error('Something went wrong');
        }

        const hash = txResult.hash;
        let getResponse = await server.getTransaction(hash);

        while (getResponse.status === 'NOT_FOUND') {
            console.log('Waiting for transaction confirmation...');
            getResponse = await server.getTransaction(hash);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (getResponse.status === 'SUCCESS') {
            console.log('NFT minted successfully!');
            toast.success("NFT minted successfully", {
                position: "top-center"
            });
            setShouldFetchNfts(true);
            onRouteChange("home");
        } else {
            throw `Transaction failed: ${getResponse.resultXdr}`;
        }
    } catch (error) {
        console.error('Error minting NFT:', error);
        toast.error('Error minting NFT:', {
            position: "top-center"
        });
      }  
  }


  return (
    <div>
      <ToastContainer />
      <div className="App min-h-screen">
        <div className="gradient-bg-welcome h-screen w-screen">
          <Navbar onRouteChange={onRouteChange} onConnect={onConnect} address={address} />
          {
            route === "home" ? (
              <Home onRouteChange={onRouteChange}/>
            ) : route === "explore" ? (
              <Explore nfts={nfts} isConnected={connected} isLoading={isLoading}/>
            ) : route === "mint" ? (
              <Mint uploadToPinata={uploadToPinata} mintNFT={mintNFT} />
            ) : (
              <>Cannot find page</>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default App;
