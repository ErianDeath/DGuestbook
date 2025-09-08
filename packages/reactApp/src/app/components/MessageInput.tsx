"use client"

import { useState, useEffect } from "react" // 确保导入 useEffect
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { GUESTBOARD_CONTRACT } from "@/contracts/config"

// 辅助函数：解析 Wagmi V2 的错误对象
const getRootErrorMessage = (error: Error | null): string => {
  if (!error) return '';
  let cause: any = error;
  while (cause.cause) { cause = cause.cause; }
  return cause.shortMessage ?? cause.message ?? 'An unknown error occurred';
};

interface MessageInputProps {
  onMessagePosted: () => void; // 用于通知父组件刷新列表
}

export function MessageInput({ onMessagePosted }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("")
  const { isConnected } = useAccount()

  const { data: postTxHash, writeContract: postMessage, isPending: isPosting, error: postError } = useWriteContract();
  
  // **变更**: 移除 onSuccess 回调，并从 hook 中获取 isSuccess 状态
  const { isLoading: isConfirmingPost, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash: postTxHash,
  });

  // **新增**: 使用 useEffect 来处理交易成功后的逻辑
  useEffect(() => {
    if (isConfirmed) {
      setNewMessage('');
      onMessagePosted(); // 调用回调
    }
  }, [isConfirmed, onMessagePosted]);

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;
    postMessage({
      ...GUESTBOARD_CONTRACT,
      functionName: 'postMessage',
      args: [newMessage],
    });
  }

  const isDisabled = !isConnected || isPosting || isConfirmingPost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5" />Send Message</CardTitle>

      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Share your thoughts on the blockchain..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={isDisabled}
        />
        <Button onClick={sendMessage} className="w-full gap-2" disabled={isDisabled || !newMessage.trim()}>
          {isPosting || isConfirmingPost ? 'Sending...' : <><Send className="w-4 h-4" /> Send to Blockchain</>}
        </Button>
        {!isConnected && <p className="text-sm text-muted-foreground text-center">Connect your wallet to send messages</p>}
        {postError && <p className="text-sm text-destructive text-center">{getRootErrorMessage(postError)}</p>}
      </CardContent>
    </Card>
  )
}