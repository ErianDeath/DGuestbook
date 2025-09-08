"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Send } from "lucide-react"
import { NFTMintDialog } from "@/components/nft-mint-dialog"
import { Navigation } from "@/components/navigation"
import { useWallet } from "@/hooks/use-wallet"

interface Message {
  id: string
  content: string
  author: string
  timestamp: number
  isMinted: boolean
  nftTokenId?: string
}

export default function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet()

  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: "1",
        content: "Welcome to the blockchain message board! This is the future of decentralized communication.",
        author: "0x1234...5678",
        timestamp: Date.now() - 3600000,
        isMinted: false,
      },
      {
        id: "2",
        content: "Just minted my first NFT message! The future is here.",
        author: "0xabcd...efgh",
        timestamp: Date.now() - 7200000,
        isMinted: true,
        nftTokenId: "NFT-001",
      },
      {
        id: "3",
        content: "Building on Web3 is amazing. The possibilities are endless!",
        author: "0x9876...5432",
        timestamp: Date.now() - 10800000,
        isMinted: false,
      },
    ]
    setMessages(mockMessages)
    setFilteredMessages(mockMessages)
  }, [])

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      author: address,
      timestamp: Date.now(),
      isMinted: false,
    }

    const updatedMessages = [message, ...messages]
    setMessages(updatedMessages)
    setFilteredMessages(updatedMessages)
    setNewMessage("")
  }

  const searchByAddress = () => {
    if (!searchAddress.trim()) {
      setFilteredMessages(messages)
      return
    }

    const filtered = messages.filter((msg) => msg.author.toLowerCase().includes(searchAddress.toLowerCase()))
    setFilteredMessages(filtered)
  }

  const mintAsNFT = (messageId: string) => {
    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        return {
          ...msg,
          isMinted: true,
          nftTokenId: `NFT-${Date.now()}`,
        }
      }
      return msg
    })
    setMessages(updatedMessages)
    setFilteredMessages(updatedMessages)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Send Message Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts on the blockchain..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={!isConnected}
                />
                <Button onClick={sendMessage} className="w-full gap-2" disabled={!isConnected || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                  Send to Blockchain
                </Button>
                {!isConnected && (
                  <p className="text-sm text-muted-foreground text-center">Connect your wallet to send messages</p>
                )}
              </CardContent>
            </Card>

            {/* Search Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter wallet address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={searchByAddress} variant="outline" className="flex-1 bg-transparent">
                    Search
                  </Button>
                  <Button
                    onClick={() => {
                      setSearchAddress("")
                      setFilteredMessages(messages)
                    }}
                    variant="ghost"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Messages ({filteredMessages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No messages found</p>
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <Card key={message.id} className="border border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{truncateAddress(message.author)}</Badge>
                              {message.isMinted && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  NFT #{message.nftTokenId}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{formatTime(message.timestamp)}</span>
                          </div>

                          <p className="text-foreground mb-4 leading-relaxed">{message.content}</p>

                          {!message.isMinted && isConnected && (
                            <NFTMintDialog
                              messageId={message.id}
                              messageContent={message.content}
                              messageAuthor={message.author}
                              onMintSuccess={(tokenId) => mintAsNFT(message.id)}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
