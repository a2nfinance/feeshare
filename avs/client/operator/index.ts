import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Task } from "../task-generator";
const fs = require('fs');
const path = require('path');
dotenv.config();

// Check if the process.env object is empty
if (!Object.keys(process.env).length) {
    throw new Error("process.env object is empty");
}

// Setup env variables
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const apiURL = `https://swell-testnet-explorer.alt.technology/api/v2/addresses`

/// TODO: Hack
let chainId = process.env.CHAIN_ID;
let APP_API_URL = process.env.APP_API_URL;

const avsDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../contracts/deployments/fee-share/${chainId}.json`), 'utf8'));
// Load core deployment data
const coreDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../contracts/deployments/core/${chainId}.json`), 'utf8'));


const delegationManagerAddress = coreDeploymentData.addresses.delegationManager; // todo: reminder to fix the naming of this contract in the deployment file, change to delegationManager
const avsDirectoryAddress = coreDeploymentData.addresses.avsDirectory;
const feeShareServiceManagerAddress = avsDeploymentData.addresses.feeShareServiceManager;
const ecdsaStakeRegistryAddress = avsDeploymentData.addresses.stakeRegistry;



// Load ABIs
const delegationManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../abis/IDelegationManager.json'), 'utf8'));
const ecdsaRegistryABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../abis/ECDSAStakeRegistry.json'), 'utf8'));
const feeShareServiceManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../abis/FeeShareServiceManager.json'), 'utf8'));
const avsDirectoryABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../abis/IAVSDirectory.json'), 'utf8'));

// Initialize contract objects from ABIs
const delegationManager = new ethers.Contract(delegationManagerAddress, delegationManagerABI, wallet);
const feeShareServiceManager = new ethers.Contract(feeShareServiceManagerAddress, feeShareServiceManagerABI, wallet);
const ecdsaRegistryContract = new ethers.Contract(ecdsaStakeRegistryAddress, ecdsaRegistryABI, wallet);
const avsDirectory = new ethers.Contract(avsDirectoryAddress, avsDirectoryABI, wallet);

const getAppsByIdsAndRewardAddress = async (ids: number[], reward_address: string) => {
    let req = await fetch(`${APP_API_URL}/filterapps`, {
        method: "POST",
        headers: {"Content-Type": "application/context"},
        body: JSON.stringify({
            reward_address: reward_address,
            onchain_ids: ids
        })
   
      })
   
      let res = await req.json()
      return res.apps;
}

const getAddressTransactions = async (address: string) => {
    let req = await fetch(`${apiURL}/${address}/transactions`);
    let res = await req.json();
    let txs = new Map<number, any>()
    for(let i=0; i < res.items.length; i++) {
        let item = res.items[i];
        txs.set(res.items[i].block_number, {
            gas_price: item.gas_price,
            gas_used: item.gas_used,
            actual_fee: item.fee.value
        })
    }
    return txs;
}

const getGeneratedGasFee = async (contractAddress: string, fromBlockNum: number, toBlockNum: number) => {
    let totalGasFee = ethers.toBigInt(0);

    let transactions = await getAddressTransactions(contractAddress);


    for (let blockNumber = fromBlockNum; blockNumber <= toBlockNum; blockNumber++) {

        let gasInfo = transactions.get(blockNumber);
        if (gasInfo) {
            totalGasFee += BigInt(gasInfo.actual_fee);
        }
    }

    console.log(`Actual generated GasFee by contract ${contractAddress} from ${fromBlockNum} to ${fromBlockNum} is:`);
    console.log(`${ethers.formatEther(totalGasFee)} ETH`);
    return totalGasFee
}


const signAndRespondToTask = async (taskIndex: number, taskobj: Task) => {

    const apps = await getAppsByIdsAndRewardAddress(taskobj.appIds, taskobj.rewardContractAddress);

    let generatedAppFee: bigint[] = [];
    
    for(let i = 0; i < apps.length; i++) {
        let app = apps[i];
        let whitelistedContracts = app.params.whitelistedAppContracts;
        let totalGasFee = ethers.toBigInt(0)
        for(let j = 0; j < whitelistedContracts.length; j++) {
            let appFee = await getGeneratedGasFee(whitelistedContracts[j], taskobj.fromBlockNum, taskobj.toBlockNum);
            totalGasFee += appFee; 
        }
        generatedAppFee.push(totalGasFee)

    }

    const abiCoder = new ethers.AbiCoder();


    const taskResponse = {
        referenceTaskIndex: taskIndex,
        appIds: taskobj.appIds,
        additionalRewards: generatedAppFee,
    };
    
    const encoded = abiCoder.encode(
        ["tuple(uint32,uint256[],uint256[])"],
        [[
            taskResponse.referenceTaskIndex,
            taskResponse.appIds,
            taskResponse.additionalRewards
        ]]
    );
    // const taskResponse = `Hello, ${taskName}`;
    const messageHash = ethers.keccak256(encoded);
    const messageBytes = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageBytes);

    console.log(`Signing and responding to task ${taskIndex}`);

    console.log(taskResponse, signature);

    const operators = [await wallet.getAddress()];
    const signatures = [signature];
    const signedTask = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "bytes[]", "uint32"],
        [operators, signatures, taskobj.taskCreatedBlock]
    );

    const tx = await feeShareServiceManager.respondToTask(
        taskobj,
        taskResponse,
        signedTask
    );
    
    await tx.wait();
    console.log(`Responded to task.`);
};

const registerOperator = async () => {

    // Registers as an Operator in EigenLayer.
    try {
        const tx1 = await delegationManager.registerAsOperator(
            "0x0000000000000000000000000000000000000000", // initDelegationApprover
            0, // allocationDelay
            "", // metadataURI
        );
        await tx1.wait();
        console.log("Operator registered to Core EigenLayer contracts");
    } catch (error) {
        console.error("Error in registering as operator:", error);
    }

    const salt = ethers.hexlify(ethers.randomBytes(32));
    const expiry = Math.floor(Date.now() / 1000) + 3600; // Example expiry, 1 hour from now

    // Define the output structure
    let operatorSignatureWithSaltAndExpiry = {
        signature: "",
        salt: salt,
        expiry: expiry
    };

    // Calculate the digest hash, which is a unique value representing the operator, avs, unique value (salt) and expiration date.
    const operatorDigestHash = await avsDirectory.calculateOperatorAVSRegistrationDigestHash(
        wallet.address,
        await feeShareServiceManager.getAddress(),
        salt,
        expiry
    );
    console.log(operatorDigestHash);

    // Sign the digest hash with the operator's private key
    console.log("Signing digest hash with operator's private key");
    const operatorSigningKey = new ethers.SigningKey(process.env.PRIVATE_KEY!);
    const operatorSignedDigestHash = operatorSigningKey.sign(operatorDigestHash);

    // Encode the signature in the required format
    operatorSignatureWithSaltAndExpiry.signature = ethers.Signature.from(operatorSignedDigestHash).serialized;

    console.log("Registering Operator to AVS Registry contract");


    // Register Operator to AVS
    // Per release here: https://github.com/Layr-Labs/eigenlayer-middleware/blob/v0.2.1-mainnet-rewards/src/unaudited/ECDSAStakeRegistry.sol#L49
    const tx2 = await ecdsaRegistryContract.registerOperatorWithSignature(
        operatorSignatureWithSaltAndExpiry,
        wallet.address
    );
    await tx2.wait();
    console.log("Operator registered on AVS successfully");
};

const monitorNewTasks = async () => {
    feeShareServiceManager.on("NewTaskCreated", async (taskIndex: number, task: any) => {
        console.log(`New task detected: `, task);
        let taskObj: Task = {
            rewardContractAddress: task[0],
            appIds: Array.from(task[1]).map((n:any) => parseInt(n)),
            fromBlockNum:  parseInt(task[2]),
            toBlockNum: parseInt(task[3]),
            taskCreatedBlock: parseInt(task[4])
        }
        console.log(`Task OBJ: `, taskObj);
        await signAndRespondToTask(taskIndex, taskObj);
    });

    console.log("Monitoring for new tasks...");
};

const main = async () => {
    // await registerOperator();
    monitorNewTasks().catch((error) => {
        console.error("Error monitoring tasks:", error);
    });
    // console.log(feeShareServiceManagerAddress)
};

main().catch((error) => {
    console.error("Error in main function:", error);
});
