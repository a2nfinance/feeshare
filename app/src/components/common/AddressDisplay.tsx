import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Check } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";

type AddressDisplayProps = {
  address: string;
  showFullOnHover?: boolean;
};

export default function AddressDisplay({ address, showFullOnHover = true }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm font-mono">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span title={showFullOnHover ? address : ""}>
              {shortenAddress(address)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{address}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopy}>
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? "Copied!" : "Copy address"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
