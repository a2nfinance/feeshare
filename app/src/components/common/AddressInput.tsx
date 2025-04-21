"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { publicClient } from "@/lib/wagmi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type AddressInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  error?: string;
};

export const AddressInput = ({
  value,
  onChange,
  name = "address",
  label = "Web3 Address",
  error,
}: AddressInputProps) => {
  const [isContract, setIsContract] = useState<null | boolean>(null);
  const [isNative, setIsNative] = useState<null | boolean>(null);

  useEffect(() => {
    const check = async () => {
      if (value === "0x0000000000000000000000000000000000000000" || value === "0x0") {
        setIsNative(true);
        return;
      }
      if (!isAddress(value)) {
        setIsContract(null);
        return;
      }

      try {
        const bytecode = await publicClient.getBytecode({ address: value });
        setIsContract(!!bytecode);
      } catch {
        setIsContract(null);
      }
    };

    check();
  }, [value]);

  const borderColor = isAddress(value)
    ? isContract === null
      ? "border-yellow-400"
      : isContract
        ? "border-blue-500"
        : "border-green-500"
    : "border-red-500";

  return (
    <FormItem>
      <Label htmlFor={name}>{label}</Label>
      <FormControl>
        <Input
          id={name}
          name={name}
          placeholder="0x..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("transition-all", borderColor)}
        />
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
      {isAddress(value) && (
        <p className="text-xs text-muted-foreground mt-1">
          {(isContract === null && isNative === null) && "🔍 Checking address type..."}
          {isContract === true && "✅ This is a contract address."}
          {isContract === false && "✅ This is a wallet (EOA) address."}
          {isNative === true && "✅ This is a native token."}
        </p>
      )}
    </FormItem>
  );
};
