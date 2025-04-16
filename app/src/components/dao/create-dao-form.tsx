'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { abi } from '@/lib/abi/DAOFactory.json';
import { config } from '@/lib/wagmi';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BaseError, getAddress, parseEventLogs } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useWriteContract } from 'wagmi';
import { z } from 'zod';
import { Summary } from './Summary';
const formSchema = z.object({
    daoName: z.string().min(3),
    daoDescription: z.string().min(3),
    daoXAccount: z.string(),
    daoDiscordAccount: z.string(),
    daoQuorum: z.number().min(1),
    daoVotingThreshold: z.number().min(1),
    daoOnlyMembersCanPropose: z.boolean(),
    daoAllowEarlierExecution: z.boolean(),
    initialWhitelistedTokens: z.string().array(),
    initialWhitelistedFunders: z.string().array(),
    members: z.string().array(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateDAOForm() {
    const { address, chainId } = useAccount()
    const [step, setStep] = useState(0);
    const { writeContractAsync } = useWriteContract();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            daoName: "",
            daoDescription: "",
            daoXAccount: "",
            daoDiscordAccount: "",
            daoQuorum: 50,
            daoVotingThreshold: 50,
            daoOnlyMembersCanPropose: true,
            daoAllowEarlierExecution: false,
            initialWhitelistedTokens: [''],
            initialWhitelistedFunders: [''],
            members: ['']
        },
        mode: "onChange"
    });

    const {
        fields: funderFields,
        append: funderAppend,
        remove: funderRemove,
    } = useFieldArray({
        control: form.control,
        // @ts-ignore
        name: "initialWhitelistedFunders",
    });

    const {
        fields: tokenFields,
        append: tokenAppend,
        remove: tokenRemove,
    } = useFieldArray({
        control: form.control,
        // @ts-ignore
        name: "initialWhitelistedTokens",
    });

    const {
        fields: membersFields,
        append: membersAppend,
        remove: membersRemove,
    } = useFieldArray({
        control: form.control,
        // @ts-ignore
        name: "members",
    });

    const [createDAOProcessing, setCreateDAOProcessing] = useState(false)

    const onSubmit = async (data: FormData) => {
        try {


            if (process.env.NEXT_PUBLIC_DAO_FACTORY && chainId) {
                setCreateDAOProcessing(true);
                const tx = await writeContractAsync({
                    abi,
                    address: getAddress(process.env.NEXT_PUBLIC_DAO_FACTORY),
                    functionName: 'createContracts',
                    args: [
                        data.daoName,
                        data.daoDescription,
                        data.daoXAccount,
                        data.daoDiscordAccount,
                        data.daoQuorum,
                        data.daoVotingThreshold,
                        data.daoOnlyMembersCanPropose,
                        data.daoAllowEarlierExecution,
                        data.initialWhitelistedTokens.map(i => i.trim().toLowerCase()),
                        data.initialWhitelistedFunders.map(i => i.trim().toLowerCase()),
                        data.members.map(m => [getAddress(m.trim()), 1])
                    ],
                });

                console.log('DAO Created TX:', tx);
                
                // @ts-ignore
                const receipt = await waitForTransactionReceipt(config.getClient(chainId), {
                    hash: tx,
                });

                const logs: any[] = parseEventLogs({
                    abi,
                    eventName: 'DAOCreated',
                    logs: receipt.logs,
                });


                if (logs.length > 0) {
                    const { daoContract, treasuryContract } = logs[0].args;
                    console.log('DAO Contract:', daoContract);
                    console.log('Treasury Contract:', treasuryContract);


                    let req = await fetch("/api/dao", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            creator: address,
                            dao_address: daoContract,
                            treasury_address: treasuryContract,
                            params: data
                        })
                    })
                    let res = await req.json();
                }
                

                toast.success(`DAO & Treasury contracts were create successfull!`)
            }
        } catch (e: any) {
            if (e instanceof BaseError) {
                toast.error(`Error: ${e.shortMessage}`)
            } else {
                toast.error(`Error: ${e.message}`)
            }

        }

        setCreateDAOProcessing(false)


    };

    const summary = form.getValues();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className='lg:col-span-2 '>
                <CardHeader>
                    <CardTitle className="text-2xl">Step {step + 1}</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Step 0: Basic Info */}
                            {step === 0 && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="daoName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>DAO Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="daoDescription"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="daoXAccount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Farcaster / X username</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="daoDiscordAccount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discord</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Step 1: Social */}
                            {step === 1 && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="daoQuorum"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quorum (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="daoVotingThreshold"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Voting Threshold (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="daoOnlyMembersCanPropose"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel>Only member can create proposals</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="daoAllowEarlierExecution"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel>Allow earlier execution if pass threshold</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Step 2: Voting */}
                            {step === 2 && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="initialWhitelistedTokens"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Whitelisted Token Addresses</FormLabel>

                                                {/* Render dynamic fields */}
                                                <div className="space-y-2">
                                                    {tokenFields.map((field, index) => (
                                                        <FormField
                                                            key={field.id}
                                                            control={form.control}
                                                            name={`initialWhitelistedTokens.${index}`}
                                                            render={({ field }) => (
                                                                <div className="flex gap-2 items-center">
                                                                    <FormControl>
                                                                        <Input placeholder="0x..." {...field} />
                                                                    </FormControl>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={() => tokenRemove(index)}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Add new field button */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-2"
                                                    onClick={() => tokenAppend(" ")}
                                                >
                                                    Add Token
                                                </Button>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="initialWhitelistedFunders"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Whitelisted Funder Addresses</FormLabel>

                                                {/* Render dynamic fields */}
                                                <div className="space-y-2">
                                                    {funderFields.map((field, index) => (
                                                        <FormField
                                                            key={field.id}
                                                            control={form.control}
                                                            name={`initialWhitelistedFunders.${index}`}
                                                            render={({ field }) => (
                                                                <div className="flex gap-2 items-center">
                                                                    <FormControl>
                                                                        <Input placeholder="0x..." {...field} />
                                                                    </FormControl>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={() => funderRemove(index)}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Add new field button */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-2"
                                                    onClick={() => funderAppend(" ")}
                                                >
                                                    Add Funder
                                                </Button>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Step 3: Whitelists */}
                            {step === 3 && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="members"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Members</FormLabel>

                                                {/* Render dynamic fields */}
                                                <div className="space-y-2">
                                                    {membersFields.map((field, index) => (
                                                        <FormField
                                                            key={field.id}
                                                            control={form.control}
                                                            name={`members.${index}`}
                                                            render={({ field }) => (
                                                                <div className="flex gap-2 items-center">
                                                                    <FormControl>
                                                                        <Input placeholder="0x..." {...field} />
                                                                    </FormControl>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={() => membersRemove(index)}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Add new field button */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-2"
                                                    onClick={() => membersAppend(" ")}
                                                >
                                                    Add members
                                                </Button>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}


                            {/* Step 4: Confirm */}
                            {step === 4 && (
                                <div>
                                    <p className="text-lg font-bold">DAO Information Confirmation</p>
                                    <pre className="bg-muted text-sm rounded p-4 overflow-x-auto">
                                        {JSON.stringify(summary, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-between">
                                {step > 0 ? <Button onClick={() => setStep(step - 1)} type="button">Back</Button> : <div />}
                                {step < 4 ? (
                                    <Button onClick={() => setStep(step + 1)} type="button">Continue</Button>
                                ) : (
                                    <Button type="submit">
                                        {createDAOProcessing && <Loader2 className='animate-spin' />}
                                        Create DAO
                                    </Button>
                                )}
                            </div>
                        </form>


                    </Form>
                </CardContent>
            </Card>
            {/* Sidebar */}
            <Summary summary={summary} />
        </div >
    );
}
