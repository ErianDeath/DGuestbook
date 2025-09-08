'use client'

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { GUESTBOARD_CONTRACT } from '@/contracts/config';

// **变更**: 移除对 BaseError 的显式导入和类型注解
// 这个函数会接收 useWriteContract 返回的 error 对象，其类型由 Wagmi 自动推断
const getRootErrorMessage = (error: Error | null): string => {
  if (!error) return '';
  let cause: any = error;
  while (cause.cause) {
    cause = cause.cause;
  }
  // 在 cause 链的末端，我们查找 shortMessage 或 message 属性
  return cause.shortMessage ?? cause.message ?? 'An unknown error occurred';
};

export function AddMessage() {
  const [message, setMessage] = useState('');
  const { writeContract, isPending, error } = useWriteContract({
    mutation: {
      onSuccess: () => {
        // 当用户成功提交交易后，清空输入框
        setMessage('');
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    writeContract({
      ...GUESTBOARD_CONTRACT,
      functionName: 'postMessage',
      args: [message],
    });
  };

  return (
    <section>
      <h2>Post a New Message</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message here..."
          rows={4}
          style={{ width: '100%' }}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Posting...' : 'Post Message'}
        </button>
        {error && <p style={{ color: 'red' }}>Error: {getRootErrorMessage(error)}</p>}
      </form>
    </section>
  );
}