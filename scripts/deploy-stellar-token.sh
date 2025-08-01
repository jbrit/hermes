#!/bin/bash
set -e

# Set these according to your config
NETWORK="testnet"
IDENTITY="alice"
IDENTITY_KEY="GBNIAEIN4Z2FZND6Q3S6VAWNZCHQPZTY5JECDTA7MFRW3CGQA4B5A4TM"
TOKEN_WASM="./target/wasm32v1-none/release/dummy_token.wasm"

cd stellar
stellar contract build --package dummy-token


echo "Deploying token contract..."
TOKEN_ID=$(stellar contract deploy \
  --network $NETWORK \
  --source $IDENTITY \
  --wasm $TOKEN_WASM \
  -- --owner "$IDENTITY_KEY" --initial_supply 0)

echo ""
echo "=== Deployment Complete ==="
echo "Escrow Src Hash: $SRC_HASH"
echo "Escrow Dst Hash: $DST_HASH"
echo "Token Contract ID: $TOKEN_ID"
