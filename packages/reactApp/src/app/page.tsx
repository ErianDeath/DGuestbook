'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AllMessages } from '@/app/components/AllMessages';
import { AddMessage } from '@/app/components/AddMessage';
import { SearchMessages } from '@/app/components/SearchMessages';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <h1>Decentralized Guestbook</h1>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/mynfts">My NFTs</Link>
          <ConnectButton />
        </nav>
      </header>
      <main style={{ padding: '1rem' }}>
        <AddMessage />
        <hr />
        <SearchMessages />
        <hr />
        <AllMessages />
      </main>
    </div>
  );
}