'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { GUESTBOARD_NFT_CONTRACT } from '@/contracts/config';
import { NftCard } from '@/app/components/NftCard';

export function MyNFTs() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      setError('');
      try {
        // **新增**: 获取当前最新区块号
        const latestBlock = await publicClient.getBlockNumber();

        // **变更**: 计算一个在 10000 区块限制内的起始区块
        // 如果合约部署在很久以前，这里可能找不到，但对于新部署的合约是有效的
        const fromBlock = latestBlock > BigInt(10000) ? latestBlock - BigInt(9999) : BigInt(0);

        const logs = await publicClient.getContractEvents({
          ...GUESTBOARD_NFT_CONTRACT,
          eventName: 'NFTMinted',
          args: { owner: address },
          fromBlock: fromBlock, // **变更**: 使用计算出的起始区块
          toBlock: 'latest',
        });
        
        const ids = logs.map(log => log.args.tokenId!);
        setTokenIds(ids);
      } catch (e) {
        console.error(e);
        // 将 RPC 错误信息显示给用户
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [address, publicClient]);

  if (!address) return <div>Please connect your wallet to see your NFTs.</div>;
  if (isLoading) return <div>Loading your NFTs...</div>;
  if (error) return <div style={{ color: 'red' }}>Error fetching NFTs: {error}</div>;

  return (
    <section>
        <h2>My NFTs</h2>
        {tokenIds.length === 0 ? (
            <p>No NFTs minted in the last 10,000 blocks found.</p>
        ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {tokenIds.map(id => <NftCard key={id.toString()} tokenId={id} />)}
            </div>
        )}
    </section>
  );
}