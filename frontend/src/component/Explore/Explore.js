import React from "react";
import CardList from "../CardList/CardList";

const Explore = ({ nfts, isConnected, isLoading }) => {
  
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {isConnected ? (
        isLoading ? (
          <p className="text-white text-xl">Loading...</p>
        ) : (
          <CardList userNFTs={nfts} />
        )
      ) : (
        <div className="text-center">
          <p className="text-white text-lg">Connect your wallet</p>
        </div>
      )}
    </div>
  );
};

export default Explore;