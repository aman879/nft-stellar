#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct NftData {
    id: i64,
    owner: Address,
    uri: String,
}


#[contracttype]
pub enum DataKey {
    ItemCount,
    NftData(i64),
}

#[contract]
pub struct NftContract;

#[contractimpl]
impl NftContract {
    pub fn mint(env: Env, uri: String, receiver: Address) {
        let owner: Address = receiver;

        let item_counter: i64 = env.storage().instance().get::<_, i64>(&DataKey::ItemCount).unwrap_or(0);
        
        let nft_data = NftData {
            id: item_counter,
            owner: owner.clone(),
            uri: uri.clone(),
        };
        
        env.storage().instance().set(&DataKey::NftData(item_counter), &nft_data);
        let new_id = item_counter + 1;
        env.storage().instance().set(&DataKey::ItemCount, &new_id);
    }

    pub fn get_nfts(env: Env) -> Vec<NftData> {
        let item_count: i64 = env.storage().instance().get::<_, i64>(&DataKey::ItemCount).unwrap_or(0); 

        let mut all_nfts = Vec::new(&env);
        for i in 0..item_count {
            if let Some(nft_data) = env.storage().instance().get::<_, NftData>(&DataKey::NftData(i)) {
                all_nfts.push_front(nft_data);
            }
        }
        all_nfts
    }
}

mod test;