#![no_std]

mod test;
mod token;

use soroban_sdk::{
    contract, contractimpl, contractmeta, Address, BytesN, ConversionError, Env, IntoVal,
    TryFromVal, Val,
};
use token::create_contract;

#[derive(Clone, Copy)]
#[repr(u32)]
pub enum DataKey {
    Token = 0,
    TokenShare = 1,
    TotalShares = 2,
    Reserve = 3,
}

impl TryFromVal<Env, DataKey> for Val {
    type Error = ConversionError;

    fn try_from_val(_env: &Env, v: &DataKey) -> Result<Self, Self::Error> {
        Ok((*v as u32).into())
    }
}

fn get_token(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Token).unwrap()
}

fn get_token_share(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::TokenShare).unwrap()
}

fn get_total_shares(e: &Env) -> i128 {
    e.storage().instance().get(&DataKey::TotalShares).unwrap()
}

fn get_reserve(e: &Env) -> i128 {
    e.storage().instance().get(&DataKey::Reserve).unwrap()
}

fn get_balance(e: &Env, contract: Address) -> i128 {
    token::Client::new(e, &contract).balance(&e.current_contract_address())
}

fn get_token_balance(e: &Env) -> i128 {
    get_balance(e, get_token(e))
}

fn get_balance_shares(e: &Env) -> i128 {
    get_balance(e, get_token_share(e))
}

fn put_token(e: &Env, contract: Address) {
    e.storage().instance().set(&DataKey::Token, &contract);
}

fn put_token_share(e: &Env, contract: Address) {
    e.storage().instance().set(&DataKey::TokenShare, &contract);
}

fn put_total_shares(e: &Env, amount: i128) {
    e.storage().instance().set(&DataKey::TotalShares, &amount)
}

fn put_reserve(e: &Env, amount: i128) {
    e.storage().instance().set(&DataKey::Reserve, &amount)
}

fn burn_shares(e: &Env, amount: i128) {
    let total = get_total_shares(e);
    let share_contract_id = get_token_share(e);

    token::Client::new(e, &share_contract_id).burn(&e.current_contract_address(), &amount);
    put_total_shares(e, total - amount);
}

fn mint_shares(e: &Env, to: Address, amount: i128) {
    let total = get_total_shares(e);
    let share_contract_id = get_token_share(e);

    token::Client::new(e, &share_contract_id).mint(&to, &amount);

    put_total_shares(e, total + amount);
}

// Metadata that is added on to the Wasm custom section
contractmeta!(
    key = "DESCRIPTION",
    val = "A Vault with a 1% return on investment per deposit."
);

pub trait VaultTrait {
    // Sets the token contract addresses for this vault
    fn initialize(e: Env, token_wasm_hash: BytesN<32>, token: Address);

    // Returns the token contract address for the vault share token
    fn share_id(e: Env) -> Address;

    // Deposits token. Also mints vault shares for the `from` Identifier. The amount minted
    // is determined based on the difference between the reserves stored by this contract, and
    // the actual balance of token for this contract.
    fn deposit(e: Env, from: Address, amount: i128);

    // transfers `amount` of vault share tokens to this contract, burns all pools share tokens in this contracts, and sends the
    // corresponding amount of token to `to`.
    // Returns amount of token withdrawn
    fn withdraw(e: Env, to: Address, amount: i128) -> i128;

    fn get_rsrvs(e: Env) -> i128;
}
#[contract]
struct Vault;

#[contractimpl]
impl VaultTrait for Vault {
    fn initialize(e: Env, token_wasm_hash: BytesN<32>, token: Address) {
        let share_contract_id = create_contract(&e, token_wasm_hash, &token);
        token::Client::new(&e, &share_contract_id).initialize(
            &e.current_contract_address(),
            &7u32,
            &"Vault Share Token".into_val(&e),
            &"VST".into_val(&e),
        );

        put_token(&e, token);
        put_token_share(&e, share_contract_id.try_into().unwrap());
        put_total_shares(&e, 0);
        put_reserve(&e, 0);
    }

    fn share_id(e: Env) -> Address {
        get_token_share(&e)
    }

    fn deposit(e: Env, from: Address, amount: i128) {
        // Depositor needs to authorize the deposit
        from.require_auth();

        let token_client = token::Client::new(&e, &get_token(&e));

        token_client.transfer(&from, &e.current_contract_address(), &amount);

        let balance = get_token_balance(&e);

        mint_shares(&e, from, amount);
        put_reserve(&e, balance);
    }

    fn withdraw(e: Env, to: Address, amount: i128) -> i128 {
        to.require_auth();

        // First transfer the vault shares that need to be redeemed
        let share_token_client = token::Client::new(&e, &get_token_share(&e));
        share_token_client.transfer(&to, &e.current_contract_address(), &amount);

        let token_client = token::Client::new(&e, &get_token(&e));
        token_client.transfer(
            &e.current_contract_address(),
            &to,
            &(&amount + (&amount / &100)),
        );

        let balance = get_token_balance(&e);
        let balance_shares = get_balance_shares(&e);

        burn_shares(&e, balance_shares);
        put_reserve(&e, balance - amount);

        amount
    }

    fn get_rsrvs(e: Env) -> i128 {
        get_reserve(&e)
    }
}
