#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};
use std::println;

#[test]
fn test_mint_and_get_nfts() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NftContract);
    let client = NftContractClient::new(&env, &contract_id);

    let uri = String::from_bytes(&env, b"https://example.com/nft/1");
    let owner_address = Address::generate(&env);

    client.mint(&uri, &owner_address);

    let uri2 = String::from_bytes(&env, b"https://example.com/nft/2");
    client.mint(&uri2.clone(), &owner_address); 

    let nfts: Vec<NftData> = client.get_nfts();

    // for nft in nfts.iter() {
    //     println!("NFT ID: {}, Owner: {:?}, URI: {:?}", nft.id, nft.owner, nft.uri);
    // }

    println!("{:?}", nfts);
    
    assert_eq!(nfts.len(), 2);
}
