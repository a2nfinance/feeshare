"use client"

import { formatEther } from "viem"
import { useReadContract } from "wagmi"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

export const RewardDisplay = ({rewardContractAddress, abi, onchainAppId}: {rewardContractAddress: `0x${string}`, abi: any, onchainAppId: number}) => {
    const { data: reward, isLoading }: {data: any, isLoading: boolean} = useReadContract({
      address: rewardContractAddress,
      abi: abi,
      functionName: 'rewardApp',
      args: [onchainAppId],
    })
  
    if (isLoading) return <Button className=""><Loader2 className='animate-spin' /></Button>
  
    return <>
    <Badge className="bg-green-500 w-full">Reward: { formatEther(reward ?? BigInt(0))} ETH</Badge>
    <Button size={"sm"} disabled={formatEther(reward ?? BigInt(0)) === "0"} className="w-full mt-2">Claim Reward</Button>
    </>
  }