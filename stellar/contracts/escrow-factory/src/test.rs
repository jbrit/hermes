#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _},
    Env
};
use token::Client as TokenClient;
use token::StellarAssetClient as TokenAdminClient;
use escrow::{Immutables, Timelocks, Stage};

mod escrow_src_contract {
    soroban_sdk::contractimport!(
        file =
            "../../target/wasm32v1-none/release/escrow_src.wasm"
    );
}
mod escrow_dst_contract {
    soroban_sdk::contractimport!(
        file =
            "../../target/wasm32v1-none/release/escrow_dst.wasm"
    );
}

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let sac = e.register_stellar_asset_contract_v2(admin.clone());
    (
        token::Client::new(e, &sac.address()),
        token::StellarAssetClient::new(e, &sac.address()),
    )
}

fn create_test_immutables(env: &Env, maker: Address, taker: Address, token: Address, amount: i128) -> Immutables {
    let order_hash = env.crypto().sha256(&soroban_sdk::Bytes::from_slice(env, b"test_order")).to_bytes();
    let hashlock = env.crypto().sha256(&soroban_sdk::Bytes::from_slice(env, b"test_secret")).to_bytes();
    
    // Create timelocks with reasonable values (in seconds)
    let timelocks = Timelocks {
        src_withdrawal: 300,  // 5 minutes
        src_public_withdrawal: 600,  // 10 minutes
        src_cancellation: 900,  // 15 minutes
        src_public_cancellation: 1200,  // 20 minutes
        dst_withdrawal: 300,  // 5 minutes
        dst_public_withdrawal: 600,  // 10 minutes
        dst_cancellation: 900,  // 15 minutes
        deployed_at: env.ledger().timestamp() as u32,  // Will be set when deployed
    };
    
    Immutables {
        order_hash,
        hashlock,
        maker,
        taker,
        token,
        amount,
        safety_deposit: 0,
        timelocks,
    }
}

#[test]
fn test() {
    let env = Env::default();
    let src_wasm_hash = env.deployer().upload_contract_wasm(escrow_src_contract::WASM);
    let dst_wasm_hash = env.deployer().upload_contract_wasm(escrow_dst_contract::WASM);
    let factory_contract_id = env.register(EscrowFactory, (src_wasm_hash, dst_wasm_hash));
    let client = EscrowFactoryClient::new(&env, &factory_contract_id);

    let token_admin = Address::generate(&env);
    let maker = Address::generate(&env);
    let taker = Address::generate(&env);

    env.mock_all_auths();
    let src_amount = 1000;
    let (src_token, src_token_admin_client) = create_token_contract(&env, &token_admin);
    src_token_admin_client.mint(&maker, &10000);
    src_token.approve(&maker, &factory_contract_id, &i128::MAX, &100);
    let src_immutables = create_test_immutables(&env, maker.clone(), taker.clone(), src_token.address, src_amount);
    let src_deployed_address = client.create_src_escrow(&src_immutables);
    assert!(src_deployed_address == env.deployer().with_address(factory_contract_id.clone(), src_immutables.clone().hash(&env)).deployed_address());
    
    let dst_amount = 5000;
    let (dst_token, dst_token_admin_client) = create_token_contract(&env, &token_admin);
    dst_token_admin_client.mint(&taker, &10000);
    dst_token.approve(&taker, &factory_contract_id, &i128::MAX, &100);
    let dst_immutables = create_test_immutables(&env, maker.clone(), taker.clone(), dst_token.address, dst_amount);
    let dst_deployed_address = client.create_dst_escrow(&dst_immutables, &src_immutables.timelocks.get_stage_time(Stage::SrcCancellation));
    assert!(dst_deployed_address == env.deployer().with_address(factory_contract_id.clone(), dst_immutables.hash(&env)).deployed_address());
}
