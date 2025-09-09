'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MyNFTs } from '@/app/components/MyNFTs';
import Link from 'next/link';

export default function MyNftsPage() {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <h1>My Guestbook NFTs</h1>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/">Home</Link>
            <ConnectButton />
        </nav>
      </header>
      <main style={{ padding: '1rem' }}>
        <MyNFTs />
      </main>
    </div>
  );
}