"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { NFTMintDialog } from "@/components/nft-mint-dialog"
import { useReadContract } from "wagmi"
import { GUESTBOARD_CONTRACT } from "@/contracts/config"
import { type Address, isAddress } from "viem"

type Message = {
  sender: Address;
  message: string;
  timestamp: bigint;
};

export function MessageFeed() {
  const [searchAddress, setSearchAddress] = useState("")
  
  const { data: messages, isLoading, refetch } = useReadContract({
    ...GUESTBOARD_CONTRACT,
    functionName: 'getAllMessages',
  }) as { data: readonly Message[] | undefined; isLoading: boolean; refetch: () => void };

  const filteredMessages = useMemo(() => {
    const allMsgs = messages ? [...messages].reverse() : [];
    if (!searchAddress.trim() || !isAddress(searchAddress)) {
      return allMsgs;
    }
    return allMsgs.filter((msg) => msg.sender.toLowerCase() === searchAddress.toLowerCase());
  }, [messages, searchAddress]);

  const formatTime = (timestamp: bigint) => new Date(Number(timestamp) * 1000).toLocaleString()
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="w-5 h-5" />Search Messages</CardTitle></CardHeader>
        <CardContent><Input placeholder="Enter wallet address to filter..." value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-xl">Messages ({filteredMessages.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading messages...</p>
            : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message, index) => {
                const originalId = (messages?.length ?? 0) - 1 - filteredMessages.findIndex(m => m.timestamp === message.timestamp);
                
                return (
                  <Card key={originalId} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{truncateAddress(message.sender)}</Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(message.timestamp)}</span>
                      </div>
                      <p className="text-foreground mb-4 leading-relaxed">{message.message}</p>
                      <NFTMintDialog
                          messageId={BigInt(originalId)}
                          messageContent={message.message}
                          messageAuthor={message.sender}
                          onMintSuccess={() => refetch()}
                        />
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}