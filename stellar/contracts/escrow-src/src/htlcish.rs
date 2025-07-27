use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env
};

#[contract]
pub struct MyContract;

#[contracttype]
pub enum DataKey {
    Token,
}

#[contractimpl]
impl MyContract {
    
    // METHOD 1: Direct Transfer (requires sender authorization)
    pub fn direct_transfer(
        env: Env,
        token_address: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) {
        // The 'from' address must have authorized this transaction
        from.require_auth();
        
        // Get token client
        let token_client = token::Client::new(&env, &token_address);
        
        // Execute transfer
        token_client.transfer(&from, &to, &amount);
    }

    // METHOD 2: Transfer From (allowance-based transfer)
    pub fn transfer_from_allowance(
        env: Env,
        token_address: Address,
        spender: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) {
        // The spender must be authorized to call this function
        spender.require_auth();
        
        let token_client = token::Client::new(&env, &token_address);
        
        // This will check allowance and deduct from it
        token_client.transfer_from(&spender, &from, &to, &amount);
    }

    // METHOD 3: Contract as intermediary (contract holds tokens)
    pub fn contract_mediated_transfer(
        env: Env,
        token_address: Address,
        to: Address,
        amount: i128,
    ) {
        // No external authorization needed since contract owns the tokens
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &token_address);
        
        // Transfer from contract's own balance
        token_client.transfer(&contract_address, &to, &amount);
    }

    // METHOD 4: Deposit to contract (user transfers to contract)
    pub fn deposit_to_contract(
        env: Env,
        token_address: Address,
        from: Address,
        amount: i128,
    ) {
        // User must authorize sending tokens to the contract
        from.require_auth();
        
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &token_address);
        
        // Transfer from user to contract
        token_client.transfer(&from, &contract_address, &amount);
    }

    // METHOD 5: Batch transfers
    pub fn batch_transfer(
        env: Env,
        token_address: Address,
        from: Address,
        transfers: soroban_sdk::Vec<(Address, i128)>,
    ) {
        // From address must authorize all transfers
        from.require_auth();
        
        let token_client = token::Client::new(&env, &token_address);
        
        // Execute multiple transfers
        for transfer in transfers.iter() {
            let (to, amount) = transfer;
            token_client.transfer(&from, &to, &amount);
        }
    }

    // METHOD 6: Conditional transfer with validation
    pub fn conditional_transfer(
        env: Env,
        token_address: Address,
        from: Address,
        to: Address,
        amount: i128,
        min_balance: i128,
    ) {
        from.require_auth();
        
        let token_client = token::Client::new(&env, &token_address);
        
        // Check sender has minimum balance after transfer
        let current_balance = token_client.balance(&from);
        if current_balance - amount < min_balance {
            panic!("Insufficient balance for safe transfer");
        }
        
        token_client.transfer(&from, &to, &amount);
    }

    // METHOD 7: Using Stellar Asset Contract (SAC) for native assets
    pub fn transfer_stellar_asset(
        env: Env,
        asset_contract: Address,  // SAC address
        from: Address,
        to: Address,
        amount: i128,
    ) {
        from.require_auth();
        
        // SAC implements the same token interface
        let sac_client = token::Client::new(&env, &asset_contract);
        sac_client.transfer(&from, &to, &amount);
    }

    // HELPER: Set up allowance for transfer_from
    pub fn approve_transfer(
        env: Env,
        token_address: Address,
        owner: Address,
        spender: Address,
        amount: i128,
        expiration_ledger: u32,
    ) {
        owner.require_auth();
        
        let token_client = token::Client::new(&env, &token_address);
        token_client.approve(&owner, &spender, &amount, &expiration_ledger);
    }

    // HELPER: Check token balance
    pub fn get_balance(env: Env, token_address: Address, address: Address) -> i128 {
        let token_client = token::Client::new(&env, &token_address);
        token_client.balance(&address)
    }

    // HELPER: Check allowance
    pub fn get_allowance(
        env: Env,
        token_address: Address,
        owner: Address,
        spender: Address,
    ) -> token::AllowanceValue {
        let token_client = token::Client::new(&env, &token_address);
        token_client.allowance(&owner, &spender)
    }
}

// EXAMPLE: HTLC-style contract using transfers
#[contractimpl]
impl MyContract {
    pub fn htlc_deposit(
        env: Env,
        token_address: Address,
        sender: Address,
        amount: i128,
        hashlock: soroban_sdk::BytesN<32>,
    ) {
        sender.require_auth();
        
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &token_address);
        
        // Transfer tokens to contract
        token_client.transfer(&sender, &contract_address, &amount);
        
        // Store HTLC details
        // ... storage logic here
    }

    pub fn htlc_claim(
        env: Env,
        token_address: Address,
        recipient: Address,
        amount: i128,
        preimage: soroban_sdk::Bytes,
    ) {
        // Verify preimage matches hashlock
        // ... verification logic here
        
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &token_address);
        
        // Release tokens to recipient
        token_client.transfer(&contract_address, &recipient, &amount);
    }
}