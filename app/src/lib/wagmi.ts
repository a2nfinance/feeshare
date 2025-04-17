import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, swellchain, swellchainTestnet } from 'wagmi/chains';
import { getPublicClient } from 'wagmi/actions';
import { createPublicClient, http } from 'viem';

const swellChainIconURL = "https://cdn.prod.website-files.com/6449b6fe52164e30db503746/66ff57f3aa9de72eae8aefd1_path-1-copy-48.svg";
export const config = getDefaultConfig({
  appName: 'FeeShare',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!, // Tạo ở https://cloud.walletconnect.com
  chains: [mainnet, {...swellchain, iconUrl: swellChainIconURL}, {...swellchainTestnet, iconUrl: swellChainIconURL}],
  ssr: true,
});


export const publicClient = createPublicClient({
  chain: swellchainTestnet,
  transport: http()
});