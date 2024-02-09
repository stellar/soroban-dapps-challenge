#!/bin/bash

set -e

NETWORK="$1"

SOROBAN_RPC_HOST="$2"

if [[ "$SOROBAN_RPC_HOST" == "" ]]; then
  # If soroban-cli is called inside the soroban-preview docker container,
  # it can call the stellar standalone container just using its name "stellar"
  if [[ "$IS_USING_DOCKER" == "true" ]]; then
    SOROBAN_RPC_HOST="http://stellar:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  elif [[ "$NETWORK" == "futurenet" ]]; then
    SOROBAN_RPC_HOST="https://rpc-futurenet.stellar.org:443"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  elif [[ "$NETWORK" == "testnet" ]]; then
    SOROBAN_RPC_HOST="https://soroban-testnet.stellar.org:443"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  else
    # assumes standalone on quickstart, which has the soroban/rpc path
    SOROBAN_RPC_HOST="http://localhost:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST/soroban/rpc"
  fi
else
  SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
fi

case "$1" in
standalone)
  echo "Using standalone network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
  FRIENDBOT_URL="$SOROBAN_RPC_HOST/friendbot"
  ;;
futurenet)
  echo "Using Futurenet network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
  FRIENDBOT_URL="https://friendbot-futurenet.stellar.org/"
  ;;
testnet)
  echo "Using Testnet network with RPC URL: $SOROBAN_RPC_URL"
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
  FRIENDBOT_URL="https://friendbot.stellar.org/"
  ;;
*)
  echo "Usage: $0 standalone|futurenet|testnet [rpc-host]"
  exit 1
  ;;
esac

echo Add the $NETWORK network to cli client
soroban config network add \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE" "$NETWORK"

echo Add $NETWORK to .soroban for use with npm scripts
mkdir -p .soroban
mkdir -p .soroban-example-dapp
echo $NETWORK >./.soroban-example-dapp/network
echo $SOROBAN_RPC_URL >./.soroban-example-dapp/rpc-url
echo "$SOROBAN_NETWORK_PASSPHRASE" >./.soroban-example-dapp/passphrase
echo "{ \"network\": \"$NETWORK\", \"rpcUrl\": \"$SOROBAN_RPC_URL\", \"networkPassphrase\": \"$SOROBAN_NETWORK_PASSPHRASE\" }" >./src/shared/config.json

if !(soroban config identity ls | grep example-user 2>&1 >/dev/null); then
  echo Create the example-user identity
  soroban config identity generate example-user --network $NETWORK
fi

ADMIN_ADDRESS="$(soroban config identity address example-user)"
echo $ADMIN_ADDRESS >./.soroban-example-dapp/address

ADMIN_SECRET="$(soroban config identity show example-user)"
echo $ADMIN_SECRET >./.soroban-example-dapp/secret

# This will fail if the account already exists, but it'll still be fine.
echo Fund example-user account from friendbot
curl --silent -X POST "$FRIENDBOT_URL?addr=$EXAMPLE_USER_ADDRESS" >/dev/null

ARGS="--network $NETWORK --source example-user"

echo Build contracts
soroban contract build

# Deploys the contracts and stores the contract IDs in .soroban-example-dapp

# The BTC Token contract is a Soroban token that represents BTC/USD
echo Deploy the BTC TOKEN contract
BTC_TOKEN_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/btc_token.wasm
)"
echo "Contract deployed succesfully with ID: $BTC_TOKEN_ID"
echo -n "$BTC_TOKEN_ID" >.soroban-example-dapp/btc_token_id

# The donation contract is a Soroban contract that allows users to donate to a specific address
echo Deploy the DONATION contract
DONATION_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/donation_contract.wasm
)"
echo "Contract deployed succesfully with ID: $DONATION_ID"
echo -n "$DONATION_ID" >.soroban-example-dapp/donation_id

# The oracle contract is responsible for calculating the price of BTC/USD
echo Deploy the ORACLE contract
ORACLE_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/soroban_oracle_contract.wasm
)"
echo "Contract deployed succesfully with ID: $ORACLE_ID"
echo "$ORACLE_ID" >.soroban-example-dapp/oracle_id

# Initialize the contracts
echo "Initialize the BTC TOKEN contract"
soroban contract invoke \
  $ARGS \
  --id "$BTC_TOKEN_ID" \
  -- \
  initialize \
  --symbol BTC \
  --decimal 8 \
  --name Bitcoin \
  --admin "$ADMIN_ADDRESS"
echo "Done"

# Recipient is the only account that can withdraw BTC from the donation contract
# Cannot make donations
echo "Initialize the DONATION contract"
soroban contract invoke \
  $ARGS \
  --id "$DONATION_ID" \
  -- \
  initialize \
  --recipient GCSXUXZSA2VEXN5VGOWE5ODAJLC575JCMWRJ4FFRDWSTRCJYQK4ML6V3 \
  --token "$BTC_TOKEN_ID"
echo "Done"

# Relayer is the account that will be used to relay transactions to the oracle contract
echo "Initialize the ORACLE contract"
soroban contract invoke \
  $ARGS \
  --id "$ORACLE_ID" \
  -- \
  initialize \
  --caller GCSXUXZSA2VEXN5VGOWE5ODAJLC575JCMWRJ4FFRDWSTRCJYQK4ML6V3 \
  --pair_name BTC_USDT \
  --epoch_interval 600 \
  --relayer GCSXUXZSA2VEXN5VGOWE5ODAJLC575JCMWRJ4FFRDWSTRCJYQK4ML6V3
echo "Done"
