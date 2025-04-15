// app/providers.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Khởi tạo RainbowKit + Wagmi config
const config = getDefaultConfig({
  appName: 'My DAO App',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!, // Tạo ở https://cloud.walletconnect.com
  chains: [mainnet, polygon, optimism, arbitrum],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
