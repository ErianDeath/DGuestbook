'use client';

import { useReadContract } from 'wagmi';
import { GUESTBOARD_CONTRACT } from '@/contracts/config';
import { MintNFTButton } from '@/app/components/MintNFTButton';
import type { Address } from 'viem';

// 1. 定义与 Solidity struct 匹配的 TypeScript 类型
type Message = {
  sender: Address;
  message: string;
  timestamp: bigint;
};

export function AllMessages() {
  // 2. 将 hook 返回的 data 断言为我们定义的类型数组
  const { data: messages, isLoading, error } = useReadContract({
    ...GUESTBOARD_CONTRACT,
    functionName: 'getAllMessages',
  }) as { data: Message[] | undefined; isLoading: boolean; error: Error | null };

  const { data: totalMessages } = useReadContract({
    ...GUESTBOARD_CONTRACT,
    functionName: 'getMessageCount',
  });

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div>Error loading messages: {error.message}</div>;

  return (
    <section>
      <h2>All Messages ({totalMessages?.toString() ?? 0})</h2>
      {messages && [...messages].reverse().map((msg, index) => {
        const originalId = messages.length - 1 - index;
        return (
          <div key={originalId} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
            <p><strong>Message:</strong> {msg.message}</p>
            <p><strong>From:</strong> {msg.sender}</p>
            <p><strong>Timestamp:</strong> {new Date(Number(msg.timestamp) * 1000).toLocaleString()}</p>
            <MintNFTButton messageId={BigInt(originalId)} messageText={msg.message} author={msg.sender} />
          </div>
        );
      })}
    </section>
  );
}