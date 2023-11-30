#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Recipient,
    Token,
    TotalDeposits,
    User(Address),
}

fn get_recipient(e: &Env) -> Address {
    e.storage()
        .instance()
        .get::<_, Address>(&DataKey::Recipient)
        .expect("not initialized")
}

fn get_token(e: &Env) -> Address {
    e.storage()
        .instance()
        .get::<_, Address>(&DataKey::Token)
        .expect("not initialized")
}

fn get_total_deposits(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get::<_, i128>(&DataKey::TotalDeposits)
        .unwrap_or(0)
}

fn get_user_deposited(e: &Env, user: &Address) -> i128 {
    e.storage()
        .instance()
        .get::<_, i128>(&DataKey::User(user.clone()))
        .unwrap_or(0)
}

fn get_contract_balance(e: &Env, contract_id: &Address) -> i128 {
    let client = token::Client::new(e, contract_id);
    client.balance(&e.current_contract_address())
}

fn set_user_deposited(e: &Env, user: &Address, amount: &i128) {
    e.storage()
        .instance()
        .set(&DataKey::User(user.clone()), amount);
}

fn set_total_deposits(e: &Env, amount: &i128) {
    e.storage().instance().set(&DataKey::TotalDeposits, amount);
}

fn transfer(e: &Env, to: &Address, amount: &i128) {
    let token_contract_id = &get_token(e);
    let client = token::Client::new(e, token_contract_id);
    client.transfer(&e.current_contract_address(), to, amount);
}

#[contract]
struct CollectDonations;

#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl CollectDonations {
    pub fn initialize(e: Env, recipient: Address, token: Address) {
        assert!(
            !e.storage().instance().has(&DataKey::Recipient),
            "already initialized"
        );

        e.storage().instance().set(&DataKey::Recipient, &recipient);
        e.storage().instance().set(&DataKey::Token, &token);
    }

    pub fn deposit(e: Env, user: Address, amount: i128) {
        user.require_auth();
        assert!(amount > 0, "amount must be positive");

        let token_id = get_token(&e);

        let recipient = get_recipient(&e);
        assert!(user != recipient, "recipient may not deposit");

        let balance = get_user_deposited(&e, &user);
        set_user_deposited(&e, &user, &(balance + amount));

        let total_deposits = get_total_deposits(&e);
        set_total_deposits(&e, &(total_deposits + amount));

        let client = token::Client::new(&e, &token_id);
        client.transfer(&user, &e.current_contract_address(), &amount);
    }

    pub fn withdraw(e: Env, caller: Address) {
        caller.require_auth();
        let recipient = get_recipient(&e);
        assert!(caller == recipient, "only recipient may withdraw");
        let token = get_token(&e);
        transfer(&e, &recipient, &get_contract_balance(&e, &token));
    }

    pub fn recipient(e: Env) -> Address {
        get_recipient(&e)
    }

    pub fn token(e: Env) -> Address {
        get_token(&e)
    }

    pub fn get_contract_balance(e: Env) -> i128 {
        get_contract_balance(&e, &get_token(&e))
    }

    pub fn get_balance(e: Env) -> i128 {
        get_contract_balance(&e, &get_token(&e))
    }

    pub fn get_total_deposits(e: Env) -> i128 {
        get_total_deposits(&e)
    }

    pub fn get_user_deposited(e: Env, user: Address) -> i128 {
        get_user_deposited(&e, &user)
    }
}
