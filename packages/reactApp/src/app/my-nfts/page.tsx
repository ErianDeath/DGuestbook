"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sparkles, Search, ExternalLink, Share2, Eye, Calendar, Hash, User } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useWallet } from "@/hooks/use-wallet"

interface NFT {
  id: string
  tokenId: string
  name: string
  description: string
  image: string
  originalMessage?: string
  author: string
  mintedAt: number
  attributes: Array<{ trait_type: string; value: string }>
  rarity?: "Common" | "Rare" | "Epic" | "Legendary"
}

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet()

  useEffect(() => {
    // Mock NFT data
    const mockNfts: NFT[] = [
      {
        id: "1",
        tokenId: "NFT-001",
        name: "Message NFT #001",
        description: "Just minted my first NFT message! The future is here.",
        image: "/placeholder.svg?key=a3ie9",
        originalMessage: "Just minted my first NFT message! The future is here.",
        author: "0xabcd...efgh",
        mintedAt: Date.now() - 7200000,
        rarity: "Rare",
        attributes: [
          { trait_type: "Message Length", value: "52" },
          { trait_type: "Platform", value: "BlockBoard" },
          { trait_type: "Rarity", value: "Rare" },
          { trait_type: "Generation", value: "1" },
        ],
      },
      {
        id: "2",
        tokenId: "NFT-002",
        name: "Welcome Message NFT",
        description: "Welcome to the blockchain message board! This is the future of decentralized communication.",
        image: "/placeholder.svg?key=2lxjg",
        originalMessage: "Welcome to the blockchain message board! This is the future of decentralized communication.",
        author: "0x1234...5678",
        mintedAt: Date.now() - 3600000,
        rarity: "Epic",
        attributes: [
          { trait_type: "Message Length", value: "95" },
          { trait_type: "Platform", value: "BlockBoard" },
          { trait_type: "Rarity", value: "Epic" },
          { trait_type: "Generation", value: "1" },
        ],
      },
      {
        id: "3",
        tokenId: "NFT-003",
        name: "Web3 Builder NFT",
        description: "Building on Web3 is amazing. The possibilities are endless!",
        image: "/placeholder.svg?key=7b2mf",
        originalMessage: "Building on Web3 is amazing. The possibilities are endless!",
        author: "0x9876...5432",
        mintedAt: Date.now() - 10800000,
        rarity: "Common",
        attributes: [
          { trait_type: "Message Length", value: "58" },
          { trait_type: "Platform", value: "BlockBoard" },
          { trait_type: "Rarity", value: "Common" },
          { trait_type: "Generation", value: "1" },
        ],
      },
    ]
    setNfts(mockNfts)
    setFilteredNfts(mockNfts)
  }, [])

  useEffect(() => {
    let filtered = nfts

    if (searchQuery) {
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.tokenId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedRarity !== "all") {
      filtered = filtered.filter((nft) => nft.rarity?.toLowerCase() === selectedRarity.toLowerCase())
    }

    setFilteredNfts(filtered)
  }, [searchQuery, selectedRarity, nfts])

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500"
      case "Rare":
        return "bg-blue-500"
      case "Epic":
        return "bg-purple-500"
      case "Legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const NFTDetailDialog = ({ nft }: { nft: NFT }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Eye className="w-4 h-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {nft.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Token ID: {nft.tokenId}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Author: {truncateAddress(nft.author)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Minted: {formatDate(nft.mintedAt)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{nft.description}</p>
            </div>
            {nft.originalMessage && (
              <div>
                <h4 className="font-medium mb-2">Original Message</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed">{nft.originalMessage}</p>
                </div>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">Attributes</h4>
              <div className="grid grid-cols-2 gap-2">
                {nft.attributes.map((attr, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-center">
                    <div className="text-xs text-muted-foreground">{attr.trait_type}</div>
                    <div className="text-sm font-medium">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                <ExternalLink className="w-4 h-4" />
                OpenSea
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          isConnected={isConnected}
          userAddress={address}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-4">Connect your wallet to view your NFT collection</p>
              <Button onClick={connectWallet} className="w-full">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isConnected={isConnected}
        userAddress={address}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My NFT Collection</h1>
          <p className="text-muted-foreground">
            {nfts.length} NFTs owned by {truncateAddress(address)}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search NFTs by name, description, or token ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Tabs value={selectedRarity} onValueChange={setSelectedRarity} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="common">Common</TabsTrigger>
                <TabsTrigger value="rare">Rare</TabsTrigger>
                <TabsTrigger value="epic">Epic</TabsTrigger>
                <TabsTrigger value="legendary">Legendary</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {filteredNfts.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedRarity !== "all"
                ? "Try adjusting your search or filters"
                : "Start minting messages to build your collection"}
            </p>
            <Button asChild>
              <a href="/">Go to Message Board</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNfts.map((nft) => (
              <Card key={nft.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <Sparkles className="w-12 h-12 text-primary" />
                    {nft.rarity && (
                      <Badge className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)} text-white`}>
                        {nft.rarity}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{nft.name}</h3>
                      <p className="text-sm text-muted-foreground">#{nft.tokenId}</p>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{nft.description}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Minted {formatDate(nft.mintedAt)}</span>
                      <span>{nft.attributes.length} traits</span>
                    </div>

                    <div className="flex gap-2">
                      <NFTDetailDialog nft={nft} />
                      <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                        <ExternalLink className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
