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
import "react-datepicker/dist/react-datepicker.css";
import { useFieldArray, useForm } from 'react-hook-form';
import { BaseError, encodeFunctionData, getAddress, parseEventLogs } from 'viem';
import { z } from 'zod';
import { AddressInput } from '../common/AddressInput';

import DAOJSON from "@/lib/abi/DAO.json";
import ProgramJSON from "@/lib/abi/Program.json";
import { config } from '@/lib/wagmi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useWriteContract } from 'wagmi';
const DAOABI = DAOJSON.abi;
const programABI = ProgramJSON.abi;

const proposalSchema = z.object({
    name: z.string().min(10),
    durationInDays: z.coerce.number().min(1),
    type: z.enum(['applyprogram']),

    // Incentive fields
    applicationName: z.string().nonempty(),
    xAccount: z.string().nonempty(),
    website: z.string().nonempty().url(),
    beneficiaryApp: z.string().nonempty(),
    targetContract: z.string().optional(),
    whitelistedAppContracts: z.string().array().min(1, "The application needs at least one smart contract."),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export function ApplyToProgram({ dao_address, program_address, reward_address, dao_id }: { dao_address: string, program_address: string, reward_address: string, dao_id: string }) {
    const { address, chainId } = useAccount()
    const [open, setOpen] = useState(false);
    const [createProposalProcessing, setCreateProposalProcessing] = useState(false)
    const { writeContractAsync } = useWriteContract();

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            name: '',
            durationInDays: 7,
            type: 'applyprogram',
            applicationName: "",
            xAccount: "",
            website: "",
            whitelistedAppContracts: ["0x"]
        },
        mode: "onChange"
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        // @ts-ignore
        name: "whitelistedAppContracts"
    });



    const onSubmit = async (data: ProposalFormValues) => {
        try {
            let callData: `0x${string}` = '0x';


            data.targetContract = program_address;
            callData = encodeFunctionData({
                abi: programABI,
                functionName: 'addWhitelistedApp',
                args: [
                    [data.applicationName, data.website, data.xAccount, getAddress(data.beneficiaryApp)],
                    data.whitelistedAppContracts.map(address => getAddress(address.trim()))
                ]
            });


            if (dao_address && chainId) {
                setCreateProposalProcessing(true);
                const tx = await writeContractAsync({
                    abi: DAOABI,
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
                    abi: DAOABI,
                    eventName: 'ProposalCreated',
                    logs: receipt.logs,
                });


                if (logs.length > 0) {
                    const { proposalId } = logs[0].args;
                    console.log(logs[0].args)
                    console.log('Proposal ID:', proposalId);

                    const params: any = {
                        name: data.name,
                        durationInDays: data.durationInDays,
                        type: data.type,
                        targetContract: data.targetContract,
                        applicationName: data.applicationName,
                        website: data.website,
                        xAccount: data.xAccount,
                        reward_address: reward_address,
                        beneficiaryApp: getAddress(data.beneficiaryApp),
                        whitelistedAppContracts: data.whitelistedAppContracts
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

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
            <DialogTrigger asChild>
                <Button className='w-full' disabled={!address}>Propose My Application</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create Proposal</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Separator title='Application Information' />
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
                                                <option value="applyprogram">Propose My Application</option>
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>



                        <Separator title='Application Information' />

                        <div className='grid grid-cols-2 gap-4 items-center'>
                            <FormField name="applicationName" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="website" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="xAccount" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>X Account</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField name="beneficiaryApp" defaultValue={address} control={form.control} render={({ field, fieldState }) => (
                                <AddressInput
                                    //@ts-ignore
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    label={"Beneficiary Address"}
                                />
                            )} />
                        </div>

                        <Separator title="Contract Addresses" />

                        <FormField
                            control={form.control}
                            name="whitelistedAppContracts"
                            render={() => (
                                <FormItem>
                                    <FormLabel></FormLabel>

                                    {/* Render dynamic fields */}
                                    <div className="space-y-2">
                                        {fields.map((field, index) => (
                                            <FormField
                                                key={field.id}
                                                control={form.control}
                                                name={`whitelistedAppContracts.${index}`}
                                                render={({ field }) => (
                                                    <div className="flex gap-2 items-center">
                                                        <FormControl>
                                                            <Input placeholder="0x..." {...field} />
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => remove(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                    {/* Add new field button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => append("0x0")}
                                    >
                                        Add Contract
                                    </Button>

                                    
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={createProposalProcessing} className="w-full">
                            {createProposalProcessing && <Loader2 className='animate-spin' />}
                            Submit
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
