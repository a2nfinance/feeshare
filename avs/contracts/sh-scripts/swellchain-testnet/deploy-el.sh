#!/usr/bin/env bash

set -e



# cd to the directory of this script so that this can be run from anywhere
parent_path=$(
    cd "$(dirname "${BASH_SOURCE[0]}")"
    pwd -P
)
cd "$parent_path"

cd ../../
source .env
forge script script/DeployEigenLayerCore.s.sol --rpc-url $RPC_URL --broadcast
