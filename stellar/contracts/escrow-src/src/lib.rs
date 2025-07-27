#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, xdr::ToXdr, Address, Bytes, BytesN, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    ImmutablesHash,
}

#[derive(Clone)]
#[contracttype]
pub enum TimeBoundKind {
    Before,
    After,
}

#[derive(Clone)]
pub enum Stage {
    SrcWithdrawal,
    SrcPublicWithdrawal,
    SrcCancellation,
    SrcPublicCancellation,
    DstWithdrawal,
    DstPublicWithdrawal,
    DstCancellation,
}

#[derive(Clone)]
#[contracttype]
pub struct Timelocks {
    src_withdrawal: u32,
    src_public_withdrawal: u32,
    src_cancellation: u32,
    src_public_cancellation: u32,
    dst_withdrawal: u32,
    dst_public_withdrawal: u32,
    dst_cancellation: u32,
    deployed_at: u32,
}

impl Timelocks {
    pub fn is_stage_time(&self, env: &Env, stage: Stage, time_bound_kind: TimeBoundKind) -> bool {
        let time_bound_timestamp = match stage {
            Stage::SrcWithdrawal => self.deployed_at + self.src_withdrawal,
            Stage::SrcPublicWithdrawal => self.deployed_at + self.src_public_withdrawal,
            Stage::SrcCancellation => self.deployed_at + self.src_cancellation,
            Stage::SrcPublicCancellation => self.deployed_at + self.src_public_cancellation,
            Stage::DstWithdrawal => self.deployed_at + self.dst_withdrawal,
            Stage::DstPublicWithdrawal => self.deployed_at + self.dst_public_withdrawal,
            Stage::DstCancellation => self.deployed_at + self.dst_cancellation,
        } as u64;
        let ledger_timestamp = env.ledger().timestamp();
        match time_bound_kind {
            TimeBoundKind::Before => ledger_timestamp < time_bound_timestamp,
            TimeBoundKind::After => ledger_timestamp >= time_bound_timestamp,
        }
    }
}

#[derive(Clone)]
#[contracttype]
pub struct Immutables {
    pub order_hash: BytesN<32>,
    pub hashlock: BytesN<32>,
    pub maker: Address,
    pub taker: Address,
    pub token: Address,
    pub amount: i128,
    pub safety_deposit: i128,
    pub timelocks: Timelocks,
}
impl Immutables {
    pub fn hash(self, env: &Env) -> BytesN<32> {
        let xdr_bytes = self.to_xdr(env);
        let hash_bytes = env.crypto().sha256(&xdr_bytes);
        BytesN::from_array(env, &hash_bytes.to_array())
    }
}

#[contract]
pub struct Contract;

fn valid_immutables(env: &Env, immutables: Immutables) -> bool {
    let maybe_stored_immutables_hash = env
        .storage()
        .instance()
        .get::<DataKey, BytesN<32>>(&DataKey::ImmutablesHash);
    maybe_stored_immutables_hash.is_some() && maybe_stored_immutables_hash.unwrap() == immutables.hash(env)
}

#[contractimpl]
impl Contract {
    pub fn htlc_deposit(env: Env, immutables: Immutables) {
        immutables.maker.require_auth();
        if valid_immutables(&env, immutables.clone()) {
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

impl Contract {
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