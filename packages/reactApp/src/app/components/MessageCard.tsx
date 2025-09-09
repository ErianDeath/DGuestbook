'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useReadContract } from "wagmi";
import { GUESTBOARD_NFT_CONTRACT } from "@/contracts/config";
import { MintNFTButton } from "./MintNFTButton"; // 我们复用之前的 MintNFTButton 逻辑

// 定义 Message 类型，与合约返回的结构匹配
interface Message {
  sender: `0x${string}`;
  message: string;
  timestamp: bigint;
}

interface MessageCardProps {
  message: Message;
  messageId: bigint;
  refetchMessages: () => void;
}

// 辅助函数
const formatTime = (timestamp: bigint) => new Date(Number(timestamp) * 1000).toLocaleString();
const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export function MessageCard({ message, messageId, refetchMessages }: MessageCardProps) {
  const { isConnected, address } = useAccount();

  // 实时检查这条留言是否已经被 mint
  const { data: hasBeenMinted, refetch: refetchMintStatus } = useReadContract({
    ...GUESTBOARD_NFT_CONTRACT,
    functionName: 'messageHasBeenMinted',
    args: [messageId],
  });

  const handleMintSuccess = () => {
    refetchMintStatus(); // Mint 成功后刷新 Mint 状态
    refetchMessages(); // 也可以刷新整个留言列表
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{truncateAddress(message.sender)}</Badge>
            {hasBeenMinted && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Minted as NFT
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">{formatTime(message.timestamp)}</span>
        </div>

        <p className="text-foreground mb-4 leading-relaxed">{message.message}</p>
        
        {/* Mint 按钮逻辑 */}
        {!hasBeenMinted && isConnected && address === message.sender && (
          <MintNFTButton
            messageId={messageId}
            messageText={message.message}
            author={message.sender}
            onMintSuccess={handleMintSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
}