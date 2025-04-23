'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import AddressDisplay from './AddressDisplay';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    txHash: string;
};

export default function CongratulationModal({ open, onOpenChange, txHash }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] max-w-md p-6 text-center">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                </DialogHeader>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <div className="text-3xl font-bold text-blue-600 mb-2">🎉 Congratulation!</div>
                    <p className="text-gray-700 mb-2">
                        The reward tokens have been sent.
                    </p>
                    <div className="text-xs text-gray-500 break-words mt-2">
                        Transaction hash: <br /> <div className="text-blue-500  mt-1">
                            <a href={`https://swell-testnet-explorer.alt.technology/tx/${txHash}`} target='_blank'><AddressDisplay address={txHash} /></a>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
