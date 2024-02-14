EXAMPLE_USER_SECRET="$(soroban config identity show example-user)"
CONTRACT_ID="$(cat ./.soroban/hello_world_id)"

soroban contract invoke \
    --network futurenet \
    --source $EXAMPLE_USER_SECRET \
    --id $CONTRACT_ID \
    -- \
    increment \
    --incr 7
