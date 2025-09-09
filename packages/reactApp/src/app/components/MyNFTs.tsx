'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { GUESTBOARD_NFT_CONTRACT } from '@/contracts/config';
import { NftCard } from '@/app/components/NftCard';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock > BigInt(10000) ? latestBlock - BigInt(9999) : BigInt(0);

        const logs = await publicClient.getContractEvents({
          ...GUESTBOARD_NFT_CONTRACT,
          eventName: 'NFTMinted',
          args: { owner: address },
          fromBlock: fromBlock,
          toBlock: 'latest',
        });
        
        const ids = logs.map(log => log.args.tokenId!).reverse();
        setTokenIds(ids);
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [address, publicClient]);

  if (!address) {
      return (
          <Card>
              <CardContent className="p-6 text-center">
                  <p>Please connect your wallet to see your NFTs.</p>
              </CardContent>
          </Card>
      );
  }
  
  if (isLoading) {
      return (
          <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-4">Loading your NFTs...</p>
          </div>
      );
  }

  if (error) {
      return (
          <Card className="border-destructive">
              <CardContent className="p-6 text-center text-destructive">
                  <p>Error fetching NFTs: {error}</p>
              </CardContent>
          </Card>
      );
  }

  return (
    <section>
        {tokenIds.length === 0 ? (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No NFTs minted in the last 10,000 blocks found.</p>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tokenIds.map(id => <NftCard key={id.toString()} tokenId={id} />)}
            </div>
        )}
    </section>
  );
}