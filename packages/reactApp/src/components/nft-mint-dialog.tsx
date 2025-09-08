"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Loader2, CheckCircle, AlertCircle, ImageIcon } from "lucide-react"

interface NFTMintDialogProps {
  messageId: string
  messageContent: string
  messageAuthor: string
  onMintSuccess: (tokenId: string) => void
  trigger?: React.ReactNode
}

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{ trait_type: string; value: string }>
}

export function NFTMintDialog({
  messageId,
  messageContent,
  messageAuthor,
  onMintSuccess,
  trigger,
}: NFTMintDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mintStep, setMintStep] = useState<"setup" | "minting" | "success" | "error">("setup")
  const [mintProgress, setMintProgress] = useState(0)
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata>({
    name: `Message NFT #${messageId}`,
    description: messageContent.slice(0, 100) + (messageContent.length > 100 ? "..." : ""),
    image: `/placeholder.svg?height=400&width=400&query=blockchain+nft+message+digital+art`,
    attributes: [
      { trait_type: "Message Length", value: messageContent.length.toString() },
      { trait_type: "Author", value: messageAuthor },
      { trait_type: "Timestamp", value: new Date().toISOString() },
      { trait_type: "Platform", value: "BlockBoard" },
    ],
  })
  const [mintedTokenId, setMintedTokenId] = useState("")
  const [estimatedGas, setEstimatedGas] = useState("0.0025")

  const handleMint = async () => {
    setMintStep("minting")
    setMintProgress(0)

    // Simulate minting process with progress updates
    const steps = [
      { progress: 20, message: "Preparing metadata..." },
      { progress: 40, message: "Uploading to IPFS..." },
      { progress: 60, message: "Creating transaction..." },
      { progress: 80, message: "Confirming on blockchain..." },
      { progress: 100, message: "NFT minted successfully!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMintProgress(step.progress)
    }

    // Simulate successful mint
    const tokenId = `NFT-${Date.now()}`
    setMintedTokenId(tokenId)
    setMintStep("success")
    onMintSuccess(tokenId)
  }

  const resetDialog = () => {
    setMintStep("setup")
    setMintProgress(0)
    setMintedTokenId("")
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(resetDialog, 300) // Reset after dialog closes
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Sparkles className="w-4 h-4" />
            Mint as NFT
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Mint Message as NFT
          </DialogTitle>
        </DialogHeader>

        {mintStep === "setup" && (
          <div className="space-y-6">
            {/* Original Message Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Original Message</h4>
              <p className="text-sm text-muted-foreground mb-2">From: {messageAuthor}</p>
              <p className="text-sm leading-relaxed">{messageContent}</p>
            </div>

            {/* NFT Metadata Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nft-name">NFT Name</Label>
                <Input
                  id="nft-name"
                  value={nftMetadata.name}
                  onChange={(e) => setNftMetadata((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter NFT name"
                />
              </div>

              <div>
                <Label htmlFor="nft-description">Description</Label>
                <Textarea
                  id="nft-description"
                  value={nftMetadata.description}
                  onChange={(e) => setNftMetadata((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your NFT"
                  className="min-h-[80px]"
                />
              </div>

              {/* NFT Preview */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  NFT Preview
                </h4>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{nftMetadata.name}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{nftMetadata.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {nftMetadata.attributes.slice(0, 2).map((attr, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gas Estimation */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Estimated Gas Fee</span>
                <Badge variant="outline">{estimatedGas} ETH</Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleMint} className="flex-1 gap-2">
                <Sparkles className="w-4 h-4" />
                Mint NFT
              </Button>
            </div>
          </div>
        )}

        {mintStep === "minting" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Minting Your NFT</h3>
              <p className="text-muted-foreground mb-4">Please wait while we create your NFT on the blockchain...</p>
              <Progress value={mintProgress} className="w-full max-w-sm mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">{mintProgress}% Complete</p>
            </div>
          </div>
        )}

        {mintStep === "success" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">NFT Minted Successfully!</h3>
              <p className="text-muted-foreground mb-4">Your message has been immortalized on the blockchain</p>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Token ID: {mintedTokenId}
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                Close
              </Button>
              <Button onClick={() => window.open(`/my-nfts`, "_blank")} className="flex-1">
                View in Collection
              </Button>
            </div>
          </div>
        )}

        {mintStep === "error" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Minting Failed</h3>
              <p className="text-muted-foreground mb-4">There was an error minting your NFT. Please try again.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={() => setMintStep("setup")} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
