'use client';

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
    FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from 'react-hook-form';
import { BaseError, getAddress, parseEther } from 'viem';
import { z } from 'zod';
import { AddressInput } from '../common/AddressInput';

import IERC20JSON from "@/lib/abi/IERC20.json";
import { config } from '@/lib/wagmi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useSendTransaction, useWriteContract } from 'wagmi';
const abi = IERC20JSON.abi;
const fundSchema = z.object({
    // Send fund fields
    tokenAddress: z.string().optional(),
    amount: z.coerce.number().optional()
});

type FundFormValues = z.infer<typeof fundSchema>;

export function FundTreasury({ dao_address, treasury_address }: { dao_address: string, treasury_address: `0x${string}` }) {
    const { chainId } = useAccount()
    const [open, setOpen] = useState(false);
    const [fundProcessing, setFundProcessing] = useState(false)
    const { writeContractAsync } = useWriteContract();
    const { sendTransactionAsync } = useSendTransaction();

    const form = useForm<FundFormValues>({
        resolver: zodResolver(fundSchema),
        defaultValues: {
            tokenAddress: "0x0000000000000000000000000000000000000000",
            amount: 0.001
        }
    });

    const onSubmit = async (data: FundFormValues) => {
        try {
            if (dao_address && chainId) {
                let tx: `0x${string}` = "0x0";
                setFundProcessing(true);
                if (data.tokenAddress === "0x0000000000000000000000000000000000000000" || data.tokenAddress === "0x0") {
                    // @ts-ignore
                    tx = await sendTransactionAsync({
                        to: treasury_address,
                        value: parseEther(`${data.amount}`)
                    });
                } else {
                    tx = await writeContractAsync({
                        abi,
                        address: getAddress(data.tokenAddress!),
                        functionName: 'transfer',
                        args: [
                            treasury_address,
                            parseEther(`${data.amount}`)
                        ],
                    });
                }


                console.log('Fund treasury TX:', tx);

                // @ts-ignore
                await waitForTransactionReceipt(config.getClient(chainId), {
                    hash: tx,
                });

                toast.success(`Fund treasury was sent successfull!`);

            }
            form.reset();
            setOpen(false);
        } catch (e: any) {
            if (e instanceof BaseError) {
                toast.error(`Error: ${e.shortMessage}`)
            } else {
                toast.error(`Error: ${e.message}`)
            }

        }

        setFundProcessing(false);

    };

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
            <DialogTrigger asChild>
                <Button>Fund Treasury</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Send Fund</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField name="tokenAddress" control={form.control} render={({ field, fieldState }) => (
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

                        <FormField name="amount" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                            </FormItem>
                        )} />


                        <Button type="submit" disabled={fundProcessing} className="w-full">
                            {fundProcessing && <Loader2 className='animate-spin' />}
                            Submit
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
