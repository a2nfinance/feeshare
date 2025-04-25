"use client"

import RewardContractJSON from "@/lib/abi/Reward.json";
import { formatEther, getAddress } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Badge } from "../ui/badge";
const rewardABI = RewardContractJSON.abi;

export const Statistic = ({ rewardAddress, onChainAppIds }: { rewardAddress: "0x${string}", onChainAppIds: number[] }) => {
    const { chainId } = useAccount()
    const { data: statistic } = useReadContract({
        address: getAddress(rewardAddress),
        abi: rewardABI,
        functionName: "getAppRewardReport",
        args: [
            onChainAppIds
        ]
    })

    const { data: balance } = useBalance({
        address: rewardAddress,
        chainId: chainId || 1924
    })

    return (
        <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 space-y-2">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Badge className="bg-green-600 w-full text-center hover:animate-in">Total Generated Fee: <br /> {
                    //@ts-ignore
                    parseFloat(formatEther(statistic?.[0] || BigInt(0))).toFixed(10)
                } ETH</Badge>
                <Badge className="bg-green-600 w-full text-center hover:animate-in">Total Estimated Reward: <br /> {
                    //@ts-ignore
                    parseFloat(formatEther(statistic?.[1] || BigInt(0))).toFixed(10)
                } ETH</Badge>
            </div>
            <Badge className="bg-green-600 w-full text-center hover:animate-pulse">Available Fund: <br />

                {
                    // @ts-ignore
                    formatEther(balance?.value || "0")
                } ETH

            </Badge>

        </div>
    )
} 