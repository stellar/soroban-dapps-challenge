#![cfg(test)]
extern crate std;

use crate::{token, VaultClient};

use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    Address, BytesN, Env, IntoVal,
};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> token::Client<'a> {
    token::Client::new(e, &e.register_stellar_asset_contract(admin.clone()))
}

fn create_vault_contract<'a>(
    e: &Env,
    token_wasm_hash: &BytesN<32>,
    token: &Address,
) -> VaultClient<'a> {
    let vault = VaultClient::new(e, &e.register_contract(None, crate::Vault {}));
    vault.initialize(token_wasm_hash, token);
    vault
}

fn install_token_wasm(e: &Env) -> BytesN<32> {
    soroban_sdk::contractimport!(
        file = "token/soroban_token_contract.wasm"
    );
    e.deployer().upload_contract_wasm(WASM)
}

#[test]
fn test() {
    let e = Env::default();
    e.mock_all_auths();

    let admin1 = Address::random(&e);

    let token = create_token_contract(&e, &admin1);

    let user1 = Address::random(&e);

    let vault = create_vault_contract(&e, &install_token_wasm(&e), &token.address);

    let contract_share = token::Client::new(&e, &vault.share_id());

    let token_share = token::Client::new(&e, &contract_share.address);

    token.mint(&user1, &200);
    assert_eq!(token.balance(&user1), 200);
    token.mint(&vault.address, &100);
    assert_eq!(token.balance(&vault.address), 100);

    vault.deposit(&user1, &100);
    assert_eq!(
        e.auths(),
        std::vec![(
            user1.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    vault.address.clone(),
                    symbol_short!("deposit"),
                    (&user1, 100_i128).into_val(&e)
                )),
                sub_invocations: std::vec![AuthorizedInvocation {
                    function: AuthorizedFunction::Contract((
                        token.address.clone(),
                        symbol_short!("transfer"),
                        (&user1, &vault.address, 100_i128).into_val(&e)
                    )),
                    sub_invocations: std::vec![]
                }]
            }
        )]
    );

    assert_eq!(token_share.balance(&user1), 100);
    assert_eq!(token_share.balance(&vault.address), 0);
    assert_eq!(token.balance(&user1), 100);
    assert_eq!(token.balance(&vault.address), 200);

    e.budget().reset_unlimited();
    vault.withdraw(&user1, &100);
    assert_eq!(
        e.auths(),
        std::vec![(
            user1.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    vault.address.clone(),
                    symbol_short!("withdraw"),
                    (&user1, 100_i128).into_val(&e)
                )),
                sub_invocations: std::vec![AuthorizedInvocation {
                    function: AuthorizedFunction::Contract((
                        token_share.address.clone(),
                        symbol_short!("transfer"),
                        (&user1, &vault.address, 100_i128).into_val(&e)
                    )),
                    sub_invocations: std::vec![]
                }]
            }
        )]
    );
    assert_eq!(token.balance(&user1), 201);
    assert_eq!(token_share.balance(&user1), 0);
    assert_eq!(token.balance(&vault.address), 99);
    assert_eq!(token_share.balance(&vault.address), 0);
}
