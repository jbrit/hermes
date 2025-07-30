#![no_std]
use soroban_sdk::{contracttype, xdr::ToXdr, Address, BytesN, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Factory,
    EscrowSrcHash,
    EscrowDstHash,
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
    pub fn get_stage_time(&self, stage: Stage) -> u32 {
        match stage {
            Stage::SrcWithdrawal => self.deployed_at + self.src_withdrawal,
            Stage::SrcPublicWithdrawal => self.deployed_at + self.src_public_withdrawal,
            Stage::SrcCancellation => self.deployed_at + self.src_cancellation,
            Stage::SrcPublicCancellation => self.deployed_at + self.src_public_cancellation,
            Stage::DstWithdrawal => self.deployed_at + self.dst_withdrawal,
            Stage::DstPublicWithdrawal => self.deployed_at + self.dst_public_withdrawal,
            Stage::DstCancellation => self.deployed_at + self.dst_cancellation,
        }
    }

    pub fn is_stage_time(&self, env: &Env, stage: Stage, time_bound_kind: TimeBoundKind) -> bool {
        let time_bound_timestamp = self.get_stage_time(stage) as u64;
        let ledger_timestamp = env.ledger().timestamp();
        match time_bound_kind {
            TimeBoundKind::Before => ledger_timestamp < time_bound_timestamp,
            TimeBoundKind::After => ledger_timestamp >= time_bound_timestamp,
        }
    }

    pub fn set_deployed_at(mut self, timestamp: u32) {
        self.deployed_at = timestamp;
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

pub fn valid_immutables(env: &Env, immutables: Immutables) -> bool {
    let factory = env
        .storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::Factory).unwrap();
    env.deployer().with_address(factory, immutables.hash(env)).deployed_address() == env.current_contract_address()
}