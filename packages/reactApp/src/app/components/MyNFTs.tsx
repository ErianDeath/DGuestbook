'use client';

import { useEffect, useState } from 'react';
// **修复 2**: 在这里添加 useReadContract 的导入
import { useAccount, usePublicClient, useReadContract } from 'wagmi'; 
import { GUESTBOARD_NFT_CONTRACT } from '@/contracts/config';
// **变更**: 导入 NftCard 子组件
import { NftCard } from '@/app/components/NftCard'; 

export function MyNFTs() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      const logs = await publicClient.getContractEvents({
        ...GUESTBOARD_NFT_CONTRACT,
        eventName: 'NFTMinted',
        args: { owner: address },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });
      // **修复 1**: 现在 log.args 可以被正确推断出来
      const ids = logs.map(log => log.args.tokenId!); 
      setTokenIds(ids);
      setIsLoading(false);
    };

    fetchEvents();
  }, [address, publicClient]);

  if (!address) return <div>Please connect your wallet to see your NFTs.</div>
  if (isLoading) return <div>Loading your NFTs...</div>

  return (
    <section>
        <h2>My NFTs</h2>
        {tokenIds.length === 0 ? (
            <p>You haven't minted any message NFTs yet.</p>
        ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {tokenIds.map(id => <NftCard key={id.toString()} tokenId={id} />)}
            </div>
        )}
    </section>
  );
}