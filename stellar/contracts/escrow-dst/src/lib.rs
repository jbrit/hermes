#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Bytes, Env};
use escrow::{valid_immutables, Immutables, Stage, TimeBoundKind, DataKey};

#[contract]
pub struct EscrowDst;
#[contractimpl]
impl EscrowDst {
    pub fn __constructor(env: Env, factory: Address) {
        env.storage().instance().set(&DataKey::Factory, &factory);
    }

    pub fn withdraw(env: Env, secret: Bytes, immutables: Immutables) {
        immutables.taker.require_auth();
        if immutables.timelocks.is_stage_time(&env, Stage::DstWithdrawal, TimeBoundKind::Before) {
            panic!("too early")
        }
        if immutables.timelocks.is_stage_time(&env, Stage::DstCancellation, TimeBoundKind::After) {
            panic!("too late")
        }
        Self::_withdraw(&env, secret, immutables);
    }

    pub fn public_withdraw(env: Env, secret: Bytes, immutables: Immutables) {
        // TODO: `access_token` for resolvers
        if immutables.timelocks.is_stage_time(&env, Stage::DstPublicWithdrawal, TimeBoundKind::Before) {
            panic!("too early")
        }
        if immutables.timelocks.is_stage_time(&env, Stage::DstCancellation, TimeBoundKind::After) {
            panic!("too late")
        }
        Self::_withdraw(&env, secret, immutables);
    }


    pub fn cancel(env: Env, immutables: Immutables) {
        immutables.taker.require_auth();
        if !valid_immutables(&env, immutables.clone()) {
            panic!("invalid immutables")
        }
        if immutables.timelocks.is_stage_time(&env, Stage::DstCancellation, TimeBoundKind::Before) {
            panic!("too early")
        }
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &immutables.token);
        token_client.transfer(&contract_address, &immutables.taker, &immutables.amount);
    }
}

impl EscrowDst {
    fn _withdraw(env: &Env, secret: Bytes, immutables: Immutables) {
        if env.crypto().keccak256(&secret).to_bytes() != immutables.hashlock {
            panic!("invalid secret")
        }
        if !valid_immutables(env, immutables.clone()) {
            panic!("invalid immutables")
        } 
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(env, &immutables.token);
        token_client.transfer(&contract_address, &immutables.maker, &immutables.amount);
    }
}

mod test;
