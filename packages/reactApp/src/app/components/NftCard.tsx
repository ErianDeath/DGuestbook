'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { GUESTBOARD_NFT_CONTRACT } from '@/contracts/config';

export function NftCard({ tokenId }: { tokenId: bigint }) {
    const { data: tokenURI } = useReadContract({
        ...GUESTBOARD_NFT_CONTRACT,
        functionName: 'tokenURI',
        args: [tokenId]
    });
    
    const [metadata, setMetadata] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // **修复**: 增加一个类型检查，确保 tokenURI 是一个字符串
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
            }
        }
    }, [tokenURI]);

    if (error) return <div>Error loading NFT #{tokenId.toString()}: {error}</div>;
    // 在 metadata 加载完成前，可以显示一个更通用的加载状态
    if (!metadata) return <div>Loading NFT #{tokenId.toString()}...</div>;

    const imageUrl = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '';

    return (
        <div style={{ border: '1px solid gray', margin: '10px', padding: '10px', maxWidth: '220px' }}>
            {imageUrl && <img src={imageUrl} alt={metadata.name} style={{ width: '200px', height: '200px', objectFit: 'cover' }} />}
            <h3>{metadata.name}</h3>
            <p style={{ wordWrap: 'break-word' }}>{metadata.description}</p>
        </div>
    );
}