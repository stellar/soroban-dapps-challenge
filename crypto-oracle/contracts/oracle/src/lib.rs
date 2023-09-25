#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

pub(crate) const BUMP_AMOUNT: u32 = 518400;

#[derive(Clone, Debug)]
#[contracttype]
pub struct PairInfo {
    pub pair_name: String,
    pub relayer: Address,
    pub epoch_interval: u32,
    pub create_time: u64,
    pub last_epoch: u32,
}

#[derive(Clone, Debug)]
#[contracttype]
pub struct EpochData {
    pub id: u32,
    pub time: u64,
    pub value: u32,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Initialized,
    ContractOwner,

    PairInfo,
    EpochData(u32),
}

fn get_timestamp(e: &Env) -> u64 {
    e.ledger().timestamp()
}

fn get_pair_info(e: &Env) -> PairInfo {
    e.storage()
        .instance()
        .get::<_, PairInfo>(&DataKey::PairInfo)
        .expect("Contract not initialized")
}

fn get_last_data_epoch(e: &Env) -> u32 {
    let pair_info = e
        .storage()
        .instance()
        .get::<_, PairInfo>(&DataKey::PairInfo)
        .expect("Contract not initialized");
    pair_info.last_epoch
}

fn get_contract_owner(e: &Env) -> Address {
    e.storage()
        .instance()
        .get::<_, Address>(&DataKey::ContractOwner)
        .expect("Contract not initialized")
}

fn get_relayer(e: &Env) -> Address {
    let pair_info = e
        .storage()
        .instance()
        .get::<_, PairInfo>(&DataKey::PairInfo)
        .expect("Contract not initialized");
    pair_info.relayer
}

fn get_pair_data_at_epoch(e: &Env, epoch_nr: &u32) -> EpochData {
    assert!(
        epoch_nr > &0u32 && epoch_nr <= &get_last_data_epoch(&e.clone()),
        "Inexistent epoch"
    );
    e.storage()
        .instance()
        .get::<_, EpochData>(&DataKey::EpochData(epoch_nr.clone()))
        .expect("Inexistent Epoch")
}

fn set_epoch_data(e: &Env, epoch_nr: &u32, epoch_data: &EpochData) {
    e.storage()
        .instance()
        .set(&DataKey::EpochData(epoch_nr.clone()), epoch_data);
}

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {
    pub fn initialize(
        e: Env,
        caller: Address,
        relayer: Address,
        pair_name: String,
        epoch_interval: u32,
    ) {
        assert!(
            !e.storage().instance().has(&DataKey::Initialized),
            "Contract already initialized"
        );

        let pair_info = PairInfo {
            pair_name: pair_name.clone(),
            relayer: relayer.clone(),
            epoch_interval: epoch_interval.clone(),
            create_time: e.ledger().timestamp(),
            last_epoch: 0,
        };
        e.storage().instance().set(&DataKey::ContractOwner, &caller);
        e.storage().instance().set(&DataKey::PairInfo, &pair_info);
        e.storage().instance().set(&DataKey::Initialized, &true);
        e.storage().instance().bump(BUMP_AMOUNT);
    }

    pub fn update_pair_epoch_interval(e: Env, caller: Address, epoch_interval: u32) -> PairInfo {
        caller.require_auth();
        assert!(
            caller == Self::get_contract_owner(e.clone()),
            "Caller is not the contract owner"
        );

        let mut pair_info = Self::get_pair_info(e.clone());
        pair_info.epoch_interval = epoch_interval.clone();
        e.storage().instance().set(&DataKey::PairInfo, &pair_info);
        pair_info
    }

    pub fn update_relayer_address(
        e: Env,
        caller: Address,
        new_relayer_address: Address,
    ) -> PairInfo {
        caller.require_auth();
        assert!(
            caller == Self::get_contract_owner(e.clone()),
            "Caller is not the contract owner"
        );

        let mut pair_info = Self::get_pair_info(e.clone());
        pair_info.relayer = new_relayer_address.clone();
        e.storage().instance().set(&DataKey::PairInfo, &pair_info);
        pair_info
    }

    pub fn set_epoch_data(e: Env, caller: Address, value: u32) -> EpochData {
        caller.require_auth();
        assert!(
            caller == Self::get_relayer(e.clone()),
            "Only relayer can set new data"
        );

        let mut last_epoch = Self::get_last_data_epoch(e.clone());
        last_epoch += 1u32;

        let mut pair_info = Self::get_pair_info(e.clone());
        pair_info.last_epoch = last_epoch.clone();
        e.storage().instance().set(&DataKey::PairInfo, &pair_info);

        let epoch_data = EpochData {
            id: last_epoch.clone(),
            time: e.ledger().timestamp(),
            value: value.clone(),
        };
        set_epoch_data(&e, &last_epoch, &epoch_data);
        epoch_data
    }

    pub fn get_timestamp(e: Env) -> u64 {
        get_timestamp(&e)
    }

    pub fn get_contract_owner(e: Env) -> Address {
        get_contract_owner(&e)
    }

    pub fn get_relayer(e: Env) -> Address {
        get_relayer(&e)
    }

    pub fn get_pair_info(e: Env) -> PairInfo {
        get_pair_info(&e)
    }

    pub fn get_last_data_epoch(e: Env) -> u32 {
        get_last_data_epoch(&e)
    }

    pub fn get_pair_data_at_epoch(e: Env, epoch_nr: u32) -> EpochData {
        get_pair_data_at_epoch(&e, &epoch_nr)
    }
}
