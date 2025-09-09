'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { GUESTBOARD_NFT_CONTRACT } from '@/contracts/config';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ImageIcon } from 'lucide-react';

interface NftMetadata {
    name: string;
    description: string;
    image: string;
}

export function NftCard({ tokenId }: { tokenId: bigint }) {
    const { data: tokenURI, error: uriError } = useReadContract({
        ...GUESTBOARD_NFT_CONTRACT,
        functionName: 'tokenURI',
        args: [tokenId]
    });
    
    const [metadata, setMetadata] = useState<NftMetadata | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (uriError) {
          setError(uriError.message);
          setIsLoading(false);
          return;
        }

        if (typeof tokenURI === 'string') {
            try {
                if (tokenURI.startsWith('data:application/json;base64,')) {
                    const json = atob(tokenURI.substring(29));
                    setMetadata(JSON.parse(json));
                } else {
                    setError('Unsupported token URI format');
                }
            } catch (e) {
                setError('Failed to parse metadata');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        } else if (tokenURI !== undefined) {
             setIsLoading(false);
        }
    }, [tokenURI, uriError]);

    if (isLoading) {
        return (
            <Card className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error || !metadata) {
        return (
             <Card className="overflow-hidden border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">NFT #{tokenId.toString()}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                    <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-2" />
                    <p className="text-sm text-destructive-foreground">{error || "Could not load metadata."}</p>
                </CardContent>
            </Card>
        )
    }

    const imageUrl = metadata.image ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : '';

    return (
        <Card className="overflow-hidden">
             {imageUrl ? (
                <img src={imageUrl} alt={metadata.name} className="w-full h-48 object-cover" />
            ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-base truncate" title={metadata.name}>{metadata.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground truncate" title={metadata.description}>{metadata.description}</p>
            </CardContent>
        </Card>
    );
}