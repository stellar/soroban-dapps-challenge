#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

const MESSAGE: Symbol = symbol_short!("MESSAGE");
const COUNT: Symbol = symbol_short!("COUNT");
const LAST_INCR: Symbol = symbol_short!("LAST_INCR");

// (attribute macro) Marks a type as being the type that contract functions are attached for.
#[contract]
pub struct HelloContract;

// (attribute macro) Exports the publicly accessible functions to the Soroban environment.
#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        // Define the message.
        let message = vec![&env, symbol_short!("Hello"), to];

        // Save the message.
        env.storage().instance().set(&MESSAGE, &message);

        // Emit an event.
        env.events()
            .publish((MESSAGE, symbol_short!("hello")), message.clone());

        // Return the message to the caller.
        message
    }

    pub fn get_message(env: Env) -> Vec<Symbol> {
        // Get the message.
        env.storage().instance().get(&MESSAGE).unwrap_or(vec![&env])
    }

    pub fn increment(env: Env, incr: u32) -> u32 {
        // Get the current count.
        let mut count = env.storage().instance().get(&COUNT).unwrap_or(0);

        // Increment the count.
        count += incr;

        // Save the count.
        env.storage().instance().set(&COUNT, &count);
        env.storage().instance().set(&LAST_INCR, &incr);

        // Emit an event.
        env.events()
            .publish((COUNT, symbol_short!("increment")), count);

        // Return the count to the caller.
        count
    }

    pub fn extend_ttl(env: Env, threshold: u32, extend_to: u32) {
        // Extend the TTL of the contract instance.
        env.storage().instance().extend_ttl(threshold, extend_to);
    }

    pub fn get_last_increment(env: Env) -> u32 {
        // Get the last increment.
        env.storage().instance().get(&LAST_INCR).unwrap_or(0)
    }

    pub fn get_count(env: Env) -> u32 {
        // Get the current count.
        env.storage().instance().get(&COUNT).unwrap_or(0)
    }
}

mod test;
