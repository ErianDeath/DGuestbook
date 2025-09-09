'use client'

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { GUESTBOARD_CONTRACT } from '@/contracts/config';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

// 辅助函数：解析 Wagmi V2 的错误对象
const getRootErrorMessage = (error: Error | null): string => {
  if (!error) return '';
  let cause: any = error;
  while (cause.cause) { cause = cause.cause; }
  return cause.shortMessage ?? cause.message ?? 'An unknown error occurred';
};

interface AddMessageProps {
  onMessagePosted: () => void;
}

export function AddMessage({ onMessagePosted }: AddMessageProps) {
  const [message, setMessage] = useState('');
  const { isConnected } = useAccount();

  const { data: postTxHash, writeContract: postMessage, isPending: isPosting, error: postError } = useWriteContract();
  
  const { isLoading: isConfirmingPost, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash: postTxHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      setMessage('');
      onMessagePosted();
    }
  }, [isConfirmed, onMessagePosted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;
    postMessage({
      ...GUESTBOARD_CONTRACT,
      functionName: 'postMessage',
      args: [message],
    });
  };

  const isDisabled = !isConnected || isPosting || isConfirmingPost;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts on the blockchain..."
            rows={4}
            className="resize-none"
            disabled={isDisabled}
          />
          <Button type="submit" disabled={isDisabled || !message.trim()} className="w-full">
            {isPosting || isConfirmingPost ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Message'
            )}
          </Button>
          {!isConnected && (
            <p className="text-sm text-center text-muted-foreground">
              Please connect your wallet to post a message.
            </p>
          )}
          {postError && (
            <p className="text-sm text-center text-destructive">
              Error: {getRootErrorMessage(postError)}
            </p>
          )}
        </form>
  );
}