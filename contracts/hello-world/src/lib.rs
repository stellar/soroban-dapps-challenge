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
/// Implementation of the HelloContract.
impl HelloContract {
    /// Sends a hello message to the specified recipient.
    ///
    /// # Arguments
    ///
    /// * `env` - The environment object.
    /// * `to` - The recipient of the hello message.
    ///
    /// # Returns
    ///
    /// The hello message as a vector of symbols.
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

    /// Retrieves the stored message.
    ///
    /// # Arguments
    ///
    /// * `env` - The environment object.
    ///
    /// # Returns
    ///
    /// The stored message as a vector of symbols.
    pub fn get_message(env: Env) -> Vec<Symbol> {
        // Get the message.
        env.storage().instance().get(&MESSAGE).unwrap_or(vec![&env])
    }

    /// Increments the count by the specified value.
    ///
    /// # Arguments
    ///
    /// * `env` - The environment object.
    /// * `incr` - The value to increment the count by.
    ///
    /// # Returns
    ///
    /// The updated count.
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

    /// Extends the time-to-live (TTL) of the contract instance.
    ///
    /// # Arguments
    ///
    /// * `env` - The environment object.
    /// * `threshold` - The threshold value for extending the TTL.
    /// * `extend_to` - The new TTL value to extend to.
    pub fn extend_ttl(env: Env, threshold: u32, extend_to: u32) {
        // Extend the TTL of the contract instance.
        env.storage().instance().extend_ttl(threshold, extend_to);
    }

    /// Retrieves the last increment value.
    ///
    /// # Arguments
    ///
    /// * `env` - The environment object.
    ///
    /// # Returns
    ///
    /// The last increment value.
    pub fn get_last_increment(env: Env) -> u32 {
        // Get the last increment.
        env.storage().instance().get(&LAST_INCR).unwrap_or(0)
    }

    /// Retrieves the current count.
    ///
    /// # Arguments
    ///
    /// * `env` - The environment object.
    ///
    /// # Returns
    ///
    /// The current count.
    pub fn get_count(env: Env) -> u32 {
        // Get the current count.
        env.storage().instance().get(&COUNT).unwrap_or(0)
    }
}

mod test;
