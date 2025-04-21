#!/bin/bash
source .env

# ==== Deploy command ====
forge script script/Deploy.s.sol:DeployScript --rpc-url swellchain_testnet --broadcast -vvvv
# forge verify-contract   --rpc-url https://swell-testnet.alt.technology   --verifier blockscout   --verifier-url 'https://swell-testnet-explorer.alt.technology:443/api/' 0x40F73724f4FDCEb4512d4f2350D71F9cb02562a6 src/dao/DAOFactory.sol:DAOFactory
# forge verify-contract   --rpc-url https://swell-testnet.alt.technology   --verifier blockscout   --verifier-url 'https://swell-testnet-explorer.alt.technology:443/api/' 0x7b5b399035db6E257D32DaCc4c0bDD01f5d3eE90   src/program/ProgramFactory.sol:ProgramFactory
# ==== Result ====
if [ $? -eq 0 ]; then
    echo "✅ Deploy success!"
else
    echo "❌ Error."
fi
