#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env, IntoVal, Val, Vec};
use escrow::{DataKey, Immutables};

#[contract]
pub struct EscrowFactory;

#[contractimpl]
impl EscrowFactory {
    pub fn __constructor(env: Env, escrow_src_hash: BytesN<32>, escrow_dst_hash: BytesN<32>) {
        env.storage().instance().set(&DataKey::EscrowSrcHash, &escrow_src_hash);
        env.storage().instance().set(&DataKey::EscrowDstHash, &escrow_dst_hash);
    }

    pub fn create_src_escrow(env: Env, immutables: Immutables) -> Address {
        // TODO: receive and authenticate signed maker order here instead
        let factory = env.current_contract_address();
        let src_wasm_hash = env.storage().instance().get::<DataKey, BytesN<32>>(&DataKey::EscrowSrcHash).unwrap();
        let token_client = token::Client::new(&env, &immutables.token);
        let salt = immutables.clone().hash(&env);
        let constructor_args: Vec<Val> = (factory.clone(),).into_val(&env);
        let src_escrow_contract = Self::_deploy(&env, src_wasm_hash, salt, constructor_args);
        token_client.transfer_from(&factory, &immutables.maker, &src_escrow_contract, &immutables.amount);
        src_escrow_contract
    }
    
    pub fn create_dst_escrow(env: Env, immutables: Immutables, src_cancellation_timestamp: u32) -> Address {
        immutables.taker.require_auth();
        if immutables.timelocks.get_stage_time(escrow::Stage::DstCancellation) > src_cancellation_timestamp {
            panic!("invalid creation time");
        }
        let factory = env.current_contract_address();
        let dst_wasm_hash = env.storage().instance().get::<DataKey, BytesN<32>>(&DataKey::EscrowDstHash).unwrap();
        let salt = immutables.clone().hash(&env);
        let constructor_args: Vec<Val> = (factory,).into_val(&env);
        let dst_escrow_contract = Self::_deploy(&env, dst_wasm_hash, salt, constructor_args);
        let token_client = token::Client::new(&env, &immutables.token);
        token_client.transfer(&immutables.taker, &dst_escrow_contract, &immutables.amount);
        dst_escrow_contract
    }

}

impl EscrowFactory {
    fn _deploy(
        env: &Env,
        wasm_hash: BytesN<32>,
        salt: BytesN<32>,
        constructor_args: Vec<Val>,
    ) -> Address {
        env
            .deployer()
            .with_address(env.current_contract_address(), salt)
            .deploy_v2(wasm_hash, constructor_args)
    }
}

mod test;
