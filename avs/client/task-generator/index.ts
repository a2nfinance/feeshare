import { ethers } from "ethers";
import * as dotenv from "dotenv";
const fs = require('fs');
const path = require('path');
dotenv.config();

// Setup env variables
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.CONSUMER_PRIVATE_KEY!, provider);
/// TODO: Hack
let chainId = process.env.CHAIN_ID;
let APP_API_URL = process.env.APP_API_URL;

const avsDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../contracts/deployments/fee-share/${chainId}.json`), 'utf8'));
const feeShareServiceManagerAddress = avsDeploymentData.addresses.feeShareServiceManager;
const feeShareServiceManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../abis/FeeShareServiceManager.json'), 'utf8'));
// Initialize contract objects from ABIs
const feeshareServiceManager = new ethers.Contract(feeShareServiceManagerAddress, feeShareServiceManagerABI, wallet);

// Setup time interval - Block time is 2 seconds
const INTERVAL = parseInt(process.env.NEWTASK_INTERVAL || "10000");
const PREVIOUS_BLOCK_NUM = INTERVAL / 2000;

export interface Task {
  rewardContractAddress: string;
  appIds: number[],
  fromBlockNum: number,
  toBlockNum: number,
  taskCreatedBlock?: number
}

async function getApps() {
  const req = await fetch(`${APP_API_URL}/applications`, {
    method: "GET",
    headers: { "Content-Type": "application/context" },

  })

  const res = await req.json()

  let rewardContractAndApps: { [key: string]: number[] } = {};
  for (let i = 0; i < res.apps.length; i++) {
    let app = res.apps[i];

    if (!rewardContractAndApps[app.reward_address]) {
      rewardContractAndApps[app.reward_address] = [app.onchain_app_id]
    } else {
      rewardContractAndApps[app.reward_address] = [...rewardContractAndApps[app.reward_address], app.onchain_app_id]
    }
  }

  return rewardContractAndApps;

}
async function createNewTask() {
  try {
    console.log(`=======================================`)
    console.log("New task by AVS consumer address:", wallet.address);
    console.log("Step 1: Retrieve all whitelisted application information")
    const currentBlock = await provider.getBlockNumber()
    const apps: { [key: string]: number[] } = await getApps();
    
    console.log("Step 2: Construct tasks")
    const tasks: Task[] = Object.keys(apps).map((key) => {
      return {
        rewardContractAddress: key,
        appIds: apps[key],
        fromBlockNum: currentBlock - PREVIOUS_BLOCK_NUM,
        toBlockNum: currentBlock
      }
    })

    if (!tasks || tasks.length === 0) {
      console.log("No task was constructed. No whitelisted app found!")
      console.log(`=======================================`)
      return;
    }
   
    // Send a transaction to the createNewTask function
    console.log("Step 3: Trigger new tasks on the Service Manager contract")
    for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      let tx = await feeshareServiceManager.createNewTask(
        task.rewardContractAddress,
        task.appIds,
        task.fromBlockNum,
        task.toBlockNum
      );

      // Wait for the transaction to be mined
      let receipt = await tx.wait();

      console.log(`Transaction successful with hash: ${receipt.hash}`);
    }

    console.log(`=======================================`)
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}

// Creates new tasks on a regular interval
function startCreatingTasks() {
  setInterval(() => {
    createNewTask();
  }, INTERVAL);
}

// Start the process
startCreatingTasks();