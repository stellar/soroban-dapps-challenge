#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, vec, Env};

#[test]
fn test() {
    let env = Env::default();
    let contract_id = env.register_contract(None, HelloContract);
    let client = HelloContractClient::new(&env, &contract_id);

    client.hello(&symbol_short!("Dev"));

    assert_eq!(client.increment(&1), 1);
    assert_eq!(client.increment(&10), 11);
    assert_eq!(client.get_count(), 11);
    assert_eq!(client.get_last_increment(), 10);
    assert_eq!(
        client.get_message(),
        vec![&env, symbol_short!("Hello"), symbol_short!("Dev")]
    );
}
