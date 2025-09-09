"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { MyNFTs } from "@/app/components/MyNFTs"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function MyNFTsPage() {
  const { isConnected, address } = useAccount()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-4">Connect your wallet to view your NFT collection</p>
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My NFT Collection</h1>
          {address && (
            <p className="text-muted-foreground">
              NFTs owned by {truncateAddress(address)}
            </p>
          )}
        </div>
        <MyNFTs />
      </main>
    </div>
  )
}