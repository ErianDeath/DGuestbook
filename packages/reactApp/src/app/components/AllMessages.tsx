'use client';

import { useReadContract } from 'wagmi';
import { GUESTBOARD_CONTRACT } from '@/contracts/config';
import { MintNFTButton } from '@/app/components/MintNFTButton';
import type { Address } from 'viem';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Message = {
  sender: Address;
  message: string;
  timestamp: bigint;
};

// 辅助函数
const formatTime = (timestamp: bigint) => new Date(Number(timestamp) * 1000).toLocaleString();
const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

interface AllMessagesProps {
  messages: Message[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function AllMessages({ messages, isLoading, error, refetch }: AllMessagesProps) {
  const { data: totalMessages } = useReadContract({
    ...GUESTBOARD_CONTRACT,
    functionName: 'getMessageCount',
  });
  

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div>Error loading messages: {error.message}</div>;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">All Messages ({totalMessages?.toString() ?? 0})</h2>
      {messages && [...messages].reverse().map((msg, index) => {
        const originalId = messages.length - 1 - index;
        return (
          <Card key={originalId}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline">{truncateAddress(msg.sender)}</Badge>
                <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="mb-4">{msg.message}</p>
              <MintNFTButton
                messageId={BigInt(originalId)}
                messageText={msg.message}
                author={msg.sender}
                onMintSuccess={refetch}
              />
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}