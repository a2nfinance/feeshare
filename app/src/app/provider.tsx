// app/providers.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, swellchain, swellchainTestnet } from 'wagmi/chains';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const swellChainIconURL = "https://cdn.prod.website-files.com/6449b6fe52164e30db503746/66ff57f3aa9de72eae8aefd1_path-1-copy-48.svg";
// Khởi tạo RainbowKit + Wagmi config
const config = getDefaultConfig({
  appName: 'My DAO App',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!, // Tạo ở https://cloud.walletconnect.com
  chains: [mainnet, {...swellchain, iconUrl: swellChainIconURL}, {...swellchainTestnet, iconUrl: swellChainIconURL}],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={swellchain} theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
