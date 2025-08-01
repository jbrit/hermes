#!/bin/bash
set -e

# Set these according to your config
NETWORK="testnet"
IDENTITY="alice"
SRC_WASM="./target/wasm32v1-none/release/escrow_src.wasm"
DST_WASM="./target/wasm32v1-none/release/escrow_dst.wasm"
FACTORY_WASM="./target/wasm32v1-none/release/escrow_factory.wasm"

cd stellar
stellar contract build --package escrow-src
stellar contract build --package escrow-dst
stellar contract build --package escrow-factory

echo "Uploading escrow_src.wasm..."
SRC_HASH=$(stellar contract upload \
  --wasm $SRC_WASM \
  --network $NETWORK \
  --source $IDENTITY)

echo "Uploading escrow_dst.wasm..."
DST_HASH=$(stellar contract upload \
  --wasm $DST_WASM \
  --network $NETWORK \
  --source $IDENTITY)

echo "Uploading factory contract..."
FACTORY_HASH=$(stellar contract upload \
  --wasm $FACTORY_WASM \
  --network $NETWORK \
  --source $IDENTITY)

echo "$SRC_HASH" "$DST_HASH"
echo "Deploying factory contract with src and dst hashes..."
FACTORY_ID=$(stellar contract deploy \
  --network $NETWORK \
  --source $IDENTITY \
  --wasm $FACTORY_WASM \
  -- --escrow_src_hash "$SRC_HASH" --escrow_dst_hash "$DST_HASH")

echo ""
echo "=== Deployment Complete ==="
echo "Escrow Src Hash: $SRC_HASH"
echo "Escrow Dst Hash: $DST_HASH"
echo "Factory Contract ID: $FACTORY_ID"
