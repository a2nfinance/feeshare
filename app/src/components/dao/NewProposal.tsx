'use client';

import { Separator } from '@/components/common/Separator';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFieldArray, useForm } from 'react-hook-form';
import { BaseError, encodeFunctionData, getAddress, parseEther, parseEventLogs } from 'viem';
import { z } from 'zod';
import { AddressInput } from '../common/AddressInput';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

import DAOJSON from "@/lib/abi/DAO.json";
import ProgramFactoryJSON from "@/lib/abi/ProgramFactory.json";
import RewardJSON from "@/lib/abi/Reward.json";
import TreasuryJSON from "@/lib/abi/Treasury.json";
import { config } from '@/lib/wagmi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useWriteContract } from 'wagmi';

const abi = DAOJSON.abi;
const programABI = ProgramFactoryJSON.abi;
const TreasuryABI = TreasuryJSON.abi;
const RewardABI = RewardJSON.abi;

const proposalSchema = z.object({
    name: z.string().min(1),
    durationInDays: z.coerce.number().min(1),
    type: z.enum(['incentive', 'sendfund', "updateavscontract", "allowclaim"]),

    // Incentive fields
    title: z.string().optional(),
    targetContract: z.string().optional(),
    startDate: z.coerce.number().optional(),
    endDate: z.coerce.number().optional(),
    rewardType: z.enum(["fixed", "dynamic"]),
    fixedRewardPercentage: z.coerce.number().optional(),
    rewardRules: z.array(
        z.object({
            amount: z.coerce.number(),
            percentage: z.coerce.number()
        })
    ).optional(),
    avsSubmitContract: z.string().optional(),

    // Send fund fields
    tokenAddress: z.string().optional(),
    receiverAddress: z.string().optional(),
    amount: z.coerce.number().optional(),
    allowClaim: z.string().optional()
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export function NewProposal({ dao_address, treasury_address, fetchProposals, dao_id }: { dao_address: string, treasury_address: string, fetchProposals: () => void, dao_id: string }) {
    const { address, chainId } = useAccount()
    const [open, setOpen] = useState(false);
    const [createProposalProcessing, setCreateProposalProcessing] = useState(false)
    const { writeContractAsync } = useWriteContract();

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            name: '',
            durationInDays: 7,
            type: 'incentive',
            rewardType: "fixed",
            fixedRewardPercentage: 5,
            rewardRules: [{ amount: 1, percentage: 10 }],
            amount: 0.001,
            title: "",
            allowClaim: "0"
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rewardRules"
    });

    const watchRewardType = form.watch("rewardType");

    const onSubmit = async (data: ProposalFormValues) => {
        try {
            let callData: `0x${string}` = '0x';

            if (data.type === 'incentive') {

                const startTimestamp = Math.floor(new Date(data.startDate!).getTime() / 1000);
                const endTimestamp = Math.floor(new Date(data.endDate!).getTime() / 1000);
                const rules = data.rewardRules!.map(
                    (rw: { amount: number, percentage: number }) => ([parseEther(`${rw.amount}`), BigInt(rw.percentage)])
                );

                callData = encodeFunctionData({
                    abi: programABI,
                    functionName: 'createContracts',
                    args: [
                        data.title,
                        `0x${dao_address.trim().replace("0x", "")}`,
                        BigInt(startTimestamp),
                        BigInt(endTimestamp),
                        BigInt(data.fixedRewardPercentage! * 100),
                        rules,
                        `0x${data.avsSubmitContract!.trim().replace("0x", "")}`,
                        data.rewardType === "fixed" ? BigInt(0) : BigInt(1)
                    ]
                });
            }

            if (data.type === 'sendfund') {
                data.targetContract = treasury_address;
                callData = encodeFunctionData({
                    abi: TreasuryABI,
                    functionName: 'sendFund',
                    args: [
                        `0x${data.tokenAddress!.trim().replace("0x", "")}`,
                        `0x${data.receiverAddress!.trim().replace("0x", "")}`,
                        parseEther(data.amount!.toString())
                    ]
                });
            }

            if (data.type === "updateavscontract") {
                callData = encodeFunctionData({
                    abi: RewardABI,
                    functionName: 'updateAvsSubmitContractAddress',
                    args: [
                        data.avsSubmitContract
                    ]
                })
            }

            if (data.type === "allowclaim") {
                callData = encodeFunctionData({
                    abi: RewardABI,
                    functionName: 'setAllowClaim',
                    args: [
                        data.allowClaim === "1" ? true : false
                    ]
                })
            }

            if (dao_address && chainId) {
                setCreateProposalProcessing(true);
                const tx = await writeContractAsync({
                    abi,
                    address: getAddress(dao_address),
                    functionName: 'createProposal',
                    args: [
                        data.name,
                        data.targetContract,
                        callData,
                        data.durationInDays
                    ],
                });

                console.log('DAO Created TX:', tx);

                // @ts-ignore
                const receipt = await waitForTransactionReceipt(config.getClient(chainId), {
                    hash: tx,
                });


                const logs: any[] = parseEventLogs({
                    abi,
                    eventName: 'ProposalCreated',
                    logs: receipt.logs,
                });


                if (logs.length > 0) {
                    const { proposalId } = logs[0].args;
                    console.log(logs[0].args)
                    console.log('Proposal ID:', proposalId);

                    let params: any = {
                        name: data.name,
                        durationInDays: data.durationInDays,
                        type: data.type,
                        targetContract: data.targetContract
                    }
                    if (data.type === 'sendfund') {
                        params = { ...params, tokenAddress: data.tokenAddress, receiverAddress: data.receiverAddress, amount: data.amount }
                    } else if (data.type === "incentive") {
                        params = {
                            ...params,
                            title: data.title,
                            rewardType: data.rewardType,
                            rewardRules: data.rewardRules,
                            fixedRewardPercentage: data.fixedRewardPercentage,
                            avsSubmitContract: data.avsSubmitContract,
                            startDate: data.startDate,
                            endDate: data.endDate
                        }
                    } else if (data.type === "updateavscontract") {
                        params = {
                            ...params,
                            avsSubmitContract: data.avsSubmitContract,
                        }
                    }
                    const req = await fetch("/api/proposal", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            creator: address,
                            onchain_id: parseInt(proposalId),
                            dao_id: dao_id,
                            duration_in_days: data.durationInDays,
                            proposal_type: data.type,
                            dao_address: dao_address,
                            params: params
                        })
                    })
                    const res = await req.json();

                    if (res.success) {
                        toast.success(`Proposal was created successfull!`);
                        fetchProposals()
                    }

                }
            }

            setOpen(false);
            form.reset();
        } catch (e: any) {
            if (e instanceof BaseError) {
                toast.error(`Error: ${e.shortMessage}`)
            } else {
                toast.error(`Error: ${e.message}`)
            }

        }

        setCreateProposalProcessing(false)

    };

    const type = form.watch('type');

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
            <DialogTrigger asChild>
                <Button>New Proposal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create Proposal</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Separator title='General Information' />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4 items-center'>
                            <FormField
                                control={form.control}
                                name="durationInDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (days)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="w-full border rounded px-3 py-2 bg-background"
                                            >
                                                <option value="incentive">Incentive Program</option>
                                                <option value="sendfund">Send Fund</option>
                                                <option value="updateavscontract">Update AVS for RewardContract</option>
                                                <option value="allowclaim">Allow Developer to Claim Reward</option>
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>


                        {type === 'incentive' && (
                            <>
                                <Separator title='Program Settings' />
                                <FormField name="title" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl><Input  {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <div className='grid grid-cols-2 gap-4 items-center'>
                                    <FormField name="targetContract" defaultValue={process.env.NEXT_PUBLIC_PROGRAM_FACTORY!} control={form.control} render={({ field, fieldState }) => (

                                        <AddressInput
                                            //@ts-ignore
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            label="Program Factory Contract"
                                        />
                                    )} />

                                    <FormField name="avsSubmitContract" defaultValue={process.env.NEXT_PUBLIC_AVS_CONTRACT!} control={form.control} render={({ field, fieldState }) => (
                                        <AddressInput
                                            //@ts-ignore
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            label={"FeeShareAVS contract"}
                                        />
                                    )} />
                                </div>
                                <div className='grid grid-cols-2 gap-4 items-center'>
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        //@ts-ignore
                                                        selected={field.value}
                                                        onChange={(date) => field.onChange(date)}
                                                        showTimeSelect
                                                        dateFormat="Pp"
                                                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        //@ts-ignore
                                                        selected={field.value}
                                                        onChange={(date) => field.onChange(date)}
                                                        showTimeSelect
                                                        dateFormat="Pp"
                                                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator title='Reward Settings' />
                                <FormField
                                    control={form.control}
                                    name="rewardType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel></FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-row space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="fixed" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Fixed Reward</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="dynamic" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Dynamic Rules</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Conditionally render based on rewardType */}
                                {watchRewardType === "fixed" && (
                                    <FormField name="fixedRewardPercentage" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Percentage (%)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )} />
                                )}

                                {watchRewardType === "dynamic" && (
                                    <div className="space-y-4">
                                        <FormLabel></FormLabel>

                                        {fields.map((fieldItem, index) => (
                                            <div key={fieldItem.id} className="grid grid-cols-3 gap-4 items-end">
                                                <FormField name={`rewardRules.${index}.amount`} control={form.control} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Generated Gas Fee (ETH)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                                <FormField name={`rewardRules.${index}.percentage`} control={form.control} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Reward Percentage (%)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => append({ amount: 0, percentage: 0 })}
                                        >
                                            Add New Rule
                                        </Button>
                                    </div>
                                )}



                            </>
                        )}

                        {type === 'sendfund' && (
                            <>
                                <Separator title='Funding Settings' />
                                <div className='grid grid-cols-2 gap-4 items-center'>
                                    <FormField name="tokenAddress" control={form.control} defaultValue='0x0000000000000000000000000000000000000000' render={({ field, fieldState }) => (
                                        <FormItem>
                                            <AddressInput
                                                //@ts-ignore
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                                label="Token address"
                                            />
                                        </FormItem>
                                    )} />
                                    <FormField name="receiverAddress" defaultValue={address} control={form.control} render={({ field, fieldState }) => (
                                        <FormItem>
                                            <AddressInput
                                                //@ts-ignore
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                                label="Beneficiary Address"
                                            />
                                        </FormItem>
                                    )} />

                                </div>

                                <FormField name="amount" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </>
                        )}

                        {type === 'updateavscontract' && (
                            <>
                                <Separator title='' />

                                <div className='grid grid-cols-2 gap-4 items-center'>
                                    <FormField name="targetContract" control={form.control} render={({ field, fieldState }) => (

                                        <AddressInput
                                            //@ts-ignore
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            label="Reward Contract"
                                        />
                                    )} />

                                    <FormField name="avsSubmitContract" control={form.control} render={({ field, fieldState }) => (
                                        <AddressInput
                                            //@ts-ignore
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            label={"FeeShareAVS contract"}
                                        />
                                    )} />
                                </div>




                            </>
                        )}


                        {type === 'allowclaim' && (
                            <>
                                <Separator title='' />

                                <div className='grid grid-cols-2 gap-4 items-center'>
                                    <FormField name="targetContract" control={form.control} render={({ field, fieldState }) => (

                                        <AddressInput
                                            //@ts-ignore
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            label="Reward Contract"
                                        />
                                    )} />

                                    <FormField
                                        control={form.control}
                                        name="allowClaim"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Template</FormLabel>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        className="w-full border rounded px-3 py-2 bg-background"
                                                    >
                                                        <option value="1">Yes</option>
                                                        <option value="0">No</option>
                                                    </select>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>




                            </>
                        )}

                        <Button type="submit" className="w-full">
                            {createProposalProcessing && <Loader2 className='animate-spin' />}
                            Submit
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
