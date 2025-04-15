'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useWriteContract } from 'wagmi';
import { abi } from '@/lib/abi/DAOFactory.json';

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
});

type FormData = z.infer<typeof formSchema>;

export default function CreateDAOForm() {
    const [step, setStep] = useState(0);
    const { writeContractAsync } = useWriteContract();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            daoName: "",
            daoDescription: "",
            daoXAccount: "",
            daoDiscordAccount:  "",
            daoQuorum: 50,
            daoVotingThreshold: 50,
            daoOnlyMembersCanPropose: true,
            daoAllowEarlierExecution: false,
            initialWhitelistedTokens: [''],
            initialWhitelistedFunders: [''],
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

    const onSubmit = async (data: FormData) => {
        const tx = await writeContractAsync({
            abi,
            address: '0xYourDAOFactoryAddress',
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
                data.initialWhitelistedTokens,
                data.initialWhitelistedFunders,
            ],
        });

        console.log('DAO Created TX:', tx);
    };

    const summary = form.getValues();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
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
                        </>
                    )}

                    {/* Step 1: Social */}
                    {step === 1 && (
                        <>
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

                    {/* Step 2: Voting */}
                    {step === 2 && (
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
                                            <Input type="number" {...field}  onChange={(e) => field.onChange(e.target.valueAsNumber)}/>
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

                    {/* Step 3: Whitelists */}
                    {step === 3 && (
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
                            <Button type="submit">Create DAO</Button>
                        )}
                    </div>
                </form>
            </Form>

            {/* Sidebar */}
            <Card className="hidden lg:block">
                <CardContent className="p-4 space-y-2 text-sm">
                    <h3 className="text-lg font-bold">Thông tin DAO</h3>
                    <p><strong>Name:</strong> {summary.daoName}</p>
                    <p><strong>Description:</strong> {summary.daoDescription}</p>
                    <p><strong>X:</strong> {summary.daoXAccount}</p>
                    <p><strong>Discord:</strong> {summary.daoDiscordAccount}</p>
                    <p><strong>Quorum:</strong> {summary.daoQuorum}%</p>
                    <p><strong>Threshold:</strong> {summary.daoVotingThreshold}%</p>
                    <p><strong>Only member can propose:</strong> {summary.daoOnlyMembersCanPropose ? '✅' : '❌'}</p>
                    <p><strong>Allow earlier execution:</strong> {summary.daoAllowEarlierExecution ? '✅' : '❌'}</p>
                    <p><strong>Tokens:</strong> {summary.initialWhitelistedTokens?.join(', ')}</p>
                    <p><strong>Funders:</strong> {summary.initialWhitelistedFunders?.join(', ')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
