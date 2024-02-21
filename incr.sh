EXAMPLE_USER_SECRET="$(soroban config identity show example-user)"
NETWORK="$(cat ./.soroban-example-dapp/network)"
CONTRACT_ID="$(cat ./.soroban/hello_world_id)"

soroban contract invoke \
    --network $NETWORK \
    --source $EXAMPLE_USER_SECRET \
    --id $CONTRACT_ID \
    -- \
    increment \
    --incr 9
