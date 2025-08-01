#!/bin/bash

# Exit if any command fails
set -e

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo ".env file not found."
  exit 1
fi

# Required env vars
REQUIRED_VARS=("ETH_PRIVATE_KEY" "ETHERSCAN_API_KEY" "SEPOLIA_RPC" "ACCESS_TOKEN")

for var in "${REQUIRED_VARS[@]}"
do
  if [ -z "${!var}" ]; then
    echo "Missing required env var: $var"
    exit 1
  fi
done

# Deployment args
RESCUE_DELAY_SRC=3600
RESCUE_DELAY_DST=3600

echo "Deploying contract to Sepolia..."

cd evm

# Deploy and verify
forge create contracts/EscrowFactory.sol:EscrowFactory \
  --rpc-url $SEPOLIA_RPC \
  --constructor-args $ACCESS_TOKEN $RESCUE_DELAY_SRC $RESCUE_DELAY_DST \
  --private-key $ETH_PRIVATE_KEY \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --chain 11155111
