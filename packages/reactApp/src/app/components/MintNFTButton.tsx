'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { GUESTBOARD_NFT_CONTRACT } from '@/contracts/config';
import type { Address } from 'viem';
import axios from 'axios';

// 在.env.local文件中设置你的Pinata凭证
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

interface MintNFTButtonProps {
  messageId: bigint;
  messageText: string;
  author: Address;
}

export function MintNFTButton({ messageId, messageText, author }: MintNFTButtonProps) {
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState('');

  const { data: mintFee, isLoading: isFeeLoading } = useReadContract({
    ...GUESTBOARD_NFT_CONTRACT,
    functionName: 'mintFee',
  });

  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });

  const { data: hasBeenMinted, isLoading: isMintedStatusLoading } = useReadContract({
    ...GUESTBOARD_NFT_CONTRACT,
    functionName: 'messageHasBeenMinted',
    args: [messageId],
  });

  const handleMint = async (file: File) => {
    // 1. 检查前置条件
    if (!isConnected || address !== author) return;
    if (chainId !== 11155111) { // Sepolia Chain ID
      setStatus('Error: Please switch to Sepolia network.');
      return;
    }

    // **修复 1 & 3**: 明确检查 mintFee 和 balance 是否已定义
    if (typeof mintFee !== 'bigint' || !balance) {
      setStatus('Error: Could not retrieve fee or balance. Please try again.');
      return;
    }
    
    // Now TypeScript knows `mintFee` is a bigint and `balance.value` is a bigint.
    if (balance.value < mintFee) {
      setStatus('Error: Insufficient balance to mint.');
      return;
    }

    try {
      // 2. 上传图片到 IPFS
      setStatus('Uploading image to IPFS...');
      const formData = new FormData();
      formData.append('file', file);
      
      const imageUploadResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            // **修复 2**: 移除 Content-Type header，让 axios 自动处理
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_API_SECRET
          }
        }
      );
      const imageIpfsHash = imageUploadResponse.data.IpfsHash;
      const imageUri = `ipfs://${imageIpfsHash}`;
      setStatus('Image uploaded! Creating metadata...');

      // 3. 创建并上传元数据 JSON 到 IPFS
      const metadata = {
        name: `Guestbook Message #${messageId}`,
        description: messageText,
        image: imageUri,
        attributes: [{ trait_type: "Author", value: author }],
      };

      const metadataUploadResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        { headers: { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_API_SECRET } }
      );
      const metadataIpfsHash = metadataUploadResponse.data.IpfsHash;
      const metadataUri = `ipfs://${metadataIpfsHash}`;
      setStatus('Metadata created! Awaiting mint transaction...');

      // 4. 调用 mintFromMessage 函数
      await writeContractAsync({
        ...GUESTBOARD_NFT_CONTRACT,
        functionName: 'mintFromMessage',
        args: [messageId, metadataUri],
        value: mintFee, // 此处 mintFee 已被确认为 bigint
      });

      setStatus('Minted successfully!');
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${(err as Error).message}`);
    }
  };
  
  const isLoading = isFeeLoading || isBalanceLoading || isMintedStatusLoading;

  if (isLoading) return <span>Loading mint status...</span>;
  if (address !== author) return null; // 只显示给留言作者
  if (hasBeenMinted) return <span>(Already Minted)</span>;

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleMint(e.target.files[0]);
          }
        }} 
      />
      {status && <p>{status}</p>}
    </div>
  );
}