"use client"

import { BaseError, formatEther, getAddress } from "viem"
import { useReadContract, useWriteContract } from "wagmi"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import RewardJSON from "@/lib/abi/Reward.json";
import CongratulationModal from "./CongratulationModal"
const RewardABI = RewardJSON.abi;
export const RewardDisplay = ({ rewardContractAddress, abi, onchainAppId, params }: { rewardContractAddress: `0x${string}`, abi: any, onchainAppId: number, params: any }) => {
  const [showCongrats, setShowCongrats] = useState(false);
  const [claimRewardProcessing, setClaimRewardProcessing] = useState(false)
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState("");
  const { data: reward, isLoading }: { data: any, isLoading: boolean } = useReadContract({
    address: rewardContractAddress,
    abi: abi,
    functionName: 'rewardApp',
    args: [onchainAppId],
  })

  if (isLoading) return <Button className=""><Loader2 className='animate-spin' /></Button>
  const claim = async () => {
    try {
      setClaimRewardProcessing(true)
      console.log("Start claim reward for app id:", onchainAppId);
      const tx = await writeContractAsync({
        abi: RewardABI,
        address: getAddress(rewardContractAddress),
        functionName: 'claim',
        args: [
          onchainAppId
        ],
      });

      console.log('DAO Created TX:', tx);

      // @ts-ignore
      await waitForTransactionReceipt(config.getClient(chainId), {
        hash: tx,
      });
      setTxHash("aaaaa");
      setShowCongrats(true)
    } catch (e: any) {
      if (e instanceof BaseError) {
        toast.error(`Error: ${e.shortMessage}`)
      } else {
        toast.error(`Error: ${e.message}`)
      }
    }
    setClaimRewardProcessing(false)
  }

  const calculateReward = (generatedFee: bigint) => {
    let reward = BigInt(0);
    if (params.rewardType === "fixed") {
      if (generatedFee) {
        reward = generatedFee * BigInt(params.fixedRewardPercentage) / BigInt(100);
      } 
    } else {
      for(let i=0; i < params.rewardRules.length; i++) {
        const rewardRule = params.rewardRules[i];
        if (BigInt(rewardRule.amount) <= generatedFee) {
            reward = generatedFee * BigInt(rewardRule.percentage) / BigInt(100)
        }
      }
    }
    return reward;
  }
  return <>
    <Badge className="bg-green-600 w-full text-center">Estimated Reward: <br/> {reward === BigInt(0) ? 0 : parseFloat(formatEther(calculateReward(reward))).toFixed(10)} ETH</Badge>
    <Button size={"sm"} 
    disabled={formatEther(reward ?? BigInt(0)) === "0"} 
    className="w-full mt-2" onClick={() => claim()}>
      {claimRewardProcessing && <Loader2 className='animate-spin' />}
      Claim Reward
    </Button>
    <CongratulationModal
        open={showCongrats}
        onOpenChange={setShowCongrats}
        txHash={txHash}
      />
  </>
}