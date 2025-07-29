#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Bytes, BytesN, Env};
use escrow::{valid_immutables, Immutables, Stage, TimeBoundKind, DataKey};

#[contract]
pub struct EscrowSrc;


#[contractimpl]
impl EscrowSrc {
    pub fn __constructor(env: Env, immutables: Immutables) {
        immutables.maker.require_auth();  // needed only if contract has some permission to manage user funds...?
        if env.storage().instance().get::<DataKey, BytesN<32>>(&DataKey::ImmutablesHash).is_some() {
            panic!("contract already initialized")
        }
        env.storage().instance().set(&DataKey::ImmutablesHash, &immutables.clone().hash(&env));
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &immutables.token);
        token_client.transfer(&immutables.maker, &contract_address, &immutables.amount);
    }
    
    pub fn withdraw(env: Env, secret: Bytes, immutables: Immutables) {
        immutables.taker.require_auth();
        if immutables.timelocks.is_stage_time(&env, Stage::SrcWithdrawal, TimeBoundKind::Before) {
            panic!("too early")
        }
        if immutables.timelocks.is_stage_time(&env, Stage::SrcCancellation, TimeBoundKind::After) {
            panic!("too late")
        }
        Self::_withdraw_to(&env, secret, immutables.taker.clone(), immutables);
    }
    
    pub fn withdraw_to(env: Env, secret: Bytes, target: Address, immutables: Immutables) {
        immutables.taker.require_auth();
        if immutables.timelocks.is_stage_time(&env, Stage::SrcWithdrawal, TimeBoundKind::Before) {
            panic!("too early")
        }
        if immutables.timelocks.is_stage_time(&env, Stage::SrcCancellation, TimeBoundKind::After) {
            panic!("too late")
        }
        Self::_withdraw_to(&env, secret, target, immutables);
    }
    
    pub fn public_withdraw(env: Env, secret: Bytes, immutables: Immutables) {
        // TODO: `access_token` for resolvers
        if immutables.timelocks.is_stage_time(&env, Stage::SrcPublicWithdrawal, TimeBoundKind::Before) {
            panic!("too early")
        }
        if immutables.timelocks.is_stage_time(&env, Stage::SrcCancellation, TimeBoundKind::After) {
            panic!("too late")
        }
        Self::_withdraw_to(&env, secret, immutables.taker.clone(), immutables);
    }
    
    pub fn cancel(env: Env, immutables: Immutables) {
        immutables.taker.require_auth();
        if immutables.timelocks.is_stage_time(&env, Stage::SrcCancellation, TimeBoundKind::Before) {
            panic!("too early")
        }
        Self::_cancel(&env, immutables);
    }
    
    pub fn public_cancel(env: Env, immutables: Immutables) {
        // TODO: `access_token` for resolvers
        if immutables.timelocks.is_stage_time(&env, Stage::SrcPublicCancellation, TimeBoundKind::Before) {
            panic!("too early")
        }
        Self::_cancel(&env, immutables);
    }
    
}

impl EscrowSrc {
    fn _withdraw_to(env: &Env, secret: Bytes, target: Address, immutables: Immutables) {
        if env.crypto().keccak256(&secret).to_bytes() != immutables.hashlock {
            panic!("invalid secret")
        }
        if !valid_immutables(env, immutables.clone()) {
            panic!("invalid immutables")
        } 
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &immutables.token);
        token_client.transfer(&contract_address, &target, &immutables.amount);
        // TODO: safety deposit transfer
    }
    
    fn _cancel(env: &Env, immutables: Immutables) {
        if !valid_immutables(&env, immutables.clone()) {
            panic!("invalid immutables")
        }
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &immutables.token);
        token_client.transfer(&contract_address, &immutables.maker, &immutables.amount);
        // TODO: look into msg.sender... vs user defining claim address
    }
}

mod test;