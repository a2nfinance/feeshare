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
const explorerApiURL = `https://swell-testnet-explorer.alt.technology/api`

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

const buildExplorerReq = (fromBlockNum: number, toBlockNum: number, contractAddress: string) => {
    return `${explorerApiURL}?module=account&action=txlist&address=${contractAddress}&startblock=${fromBlockNum}&endblock=${toBlockNum}&sort=asc`
}

const getAppsByIdsAndRewardAddress = async (ids: number[], reward_address: string) => {
    let req = await fetch(`${APP_API_URL}/filterapps`, {
        method: "POST",
        headers: { "Content-Type": "application/context" },
        body: JSON.stringify({
            reward_address: reward_address,
            onchain_ids: ids
        })

    })

    let res = await req.json()
    return res.apps;
}

const getAddressTransactions = async (fromBlockNum: number, toBlockNum: number, address: string) => {
    const url = buildExplorerReq(fromBlockNum, toBlockNum, address);
    const req = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const res = await req.json();
    const result = res.result;
    let txs = new Map<number, any>()
    if (!result || result.length === 0) {
        return txs;
    } else {
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            txs.set(parseInt(item.blockNumber), {
                gasFee: BigInt(item.gasPrice) * BigInt(item.gasUsed)
            })
        }
    }
    return txs;
}

const getGeneratedGasFee = async (contractAddress: string, fromBlockNum: number, toBlockNum: number) => {
    let totalGasFee = ethers.toBigInt(0);

    let transactions = await getAddressTransactions(fromBlockNum, toBlockNum, contractAddress);


    for (let blockNumber = fromBlockNum; blockNumber <= toBlockNum; blockNumber++) {

        let gasInfo = transactions.get(blockNumber);
        if (gasInfo) {
            totalGasFee += gasInfo.gasFee;
        }
    }
    console.log(`Calculating generated gas fee from block ${fromBlockNum} to block ${toBlockNum}.`);
    return totalGasFee
}


const signAndRespondToTask = async (taskIndex: number, taskobj: Task) => {
    console.log("Sign and Response Progress:")
    console.log("Step 1: Retrieve whitelisted application information based on app IDs")


    const apps = await getAppsByIdsAndRewardAddress(taskobj.appIds, taskobj.rewardContractAddress);

    let generatedAppFee: bigint[] = [];
    let totalGeneratedFee = BigInt(0)

    console.log("Step 2: Calculate generated gas fees using on-chain app IDs")
    for (let i = 0; i < apps.length; i++) {
        let app = apps[i];
        let whitelistedContracts = app.params.whitelistedAppContracts;
        let totalGasFee = ethers.toBigInt(0)
        for (let j = 0; j < whitelistedContracts.length; j++) {
            let appFee = await getGeneratedGasFee(whitelistedContracts[j], taskobj.fromBlockNum, taskobj.toBlockNum);
            totalGasFee += appFee;
        }
        generatedAppFee.push(totalGasFee);
        totalGeneratedFee += totalGasFee;

    }

    if (totalGeneratedFee === BigInt(0)) {
        console.log("Generated gas fee is zero. Process complete.")
        console.log(`=======================================`)
        return;
    }
    const abiCoder = new ethers.AbiCoder();


    const taskResponse = {
        referenceTaskIndex: taskIndex,
        appIds: taskobj.appIds,
        additionalRewards: generatedAppFee,
    };

    console.log("Task response:", taskResponse)

    const encoded = abiCoder.encode(
        ["tuple(uint32,uint256[],uint256[])"],
        [[
            taskResponse.referenceTaskIndex,
            taskResponse.appIds,
            taskResponse.additionalRewards
        ]]
    );
    console.log(`Step 3: Sign and respond to the task ${taskIndex}`);
    const messageHash = ethers.keccak256(encoded);
    const messageBytes = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageBytes);


    console.log(`Step 4: Aggregate signatures.`)
    const operators = [await wallet.getAddress()];
    const signatures = [signature];
    const signedTask = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "bytes[]", "uint32"],
        [operators, signatures, taskobj.taskCreatedBlock]
    );

    console.log(`Step 5: Submit the response and signed task to the Service Manager.`)
    const tx = await feeShareServiceManager.respondToTask(
        taskobj,
        taskResponse,
        signedTask
    );

    await tx.wait();
    console.log(`Responded to task with TX: ${tx.hash}`);
    console.log(`=======================================`)
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
    } catch (error) {
        console.error("Error in registering as operator:", error);
    }
};

const monitorNewTasks = async () => {
    feeShareServiceManager.on("NewTaskCreated", async (taskIndex: number, task: any) => {
        console.log(`=======================================`)
        console.log(`New task detected on ${new Date().toLocaleString()}: `,);
        let taskObj: Task = {
            rewardContractAddress: task[0],
            appIds: Array.from(task[1]).map((n: any) => parseInt(n)),
            fromBlockNum: parseInt(task[2]),
            toBlockNum: parseInt(task[3]),
            taskCreatedBlock: parseInt(task[4])
        }
        console.log(taskObj);
        await signAndRespondToTask(taskIndex, taskObj);
    });
    console.log(`Operator - Wallet Address: ${wallet.address}.`);
    console.log("Operator - Monitoring for new tasks...");
};

const main = async () => {
    // Register operator
    await registerOperator();
    monitorNewTasks().catch((error) => {
        console.error("Error monitoring tasks:", error);
    });
};

main().catch((error) => {
    console.error("Error in main function:", error);
});
