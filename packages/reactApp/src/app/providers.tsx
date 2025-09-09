'use client'; // 关键：将此文件标记为客户端组件

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// **新增**: 检查 projectId 是否存在
if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_PROJECT_ID in .env.local");
}

const config = getDefaultConfig({
  appName: 'DGuestbook',
  projectId: projectId, // 从 WalletConnect Cloud 获取
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider coolMode>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}