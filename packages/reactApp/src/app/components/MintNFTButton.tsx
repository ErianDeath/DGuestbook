'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { GUESTBOARD_NFT_CONTRACT } from '@/contracts/config';
import type { Address } from 'viem';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

interface MintNFTButtonProps {
  messageId: bigint;
  messageText: string;
  author: Address;
  onMintSuccess?: () => void;
}

export function MintNFTButton({ messageId, messageText, author, onMintSuccess }: MintNFTButtonProps) {
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: mintFee, isLoading: isFeeLoading } = useReadContract({
    ...GUESTBOARD_NFT_CONTRACT,
    functionName: 'mintFee',
  });

  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });

  const { data: hasBeenMinted, isLoading: isMintedStatusLoading, refetch } = useReadContract({
    ...GUESTBOARD_NFT_CONTRACT,
    functionName: 'messageHasBeenMinted',
    args: [messageId],
  });

  const handleMint = async () => {
    if (!isConnected || address !== author || !selectedFile) return;
    if (chainId !== 11155111) {
      setStatus('Error: Please switch to Sepolia network.');
      return;
    }
    if (typeof mintFee !== 'bigint' || !balance) {
      setStatus('Error: Could not retrieve fee or balance.');
      return;
    }
    if (balance.value < mintFee) {
      setStatus('Error: Insufficient balance to mint.');
      return;
    }

    try {
      setStatus('Uploading image to IPFS...');
      setProgress(25);
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const imageUploadResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        { headers: { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_API_SECRET } }
      );
      const imageUri = `ipfs://${imageUploadResponse.data.IpfsHash}`;
      setStatus('Image uploaded! Minting NFT...');
      setProgress(75);

      await writeContractAsync({
        ...GUESTBOARD_NFT_CONTRACT,
        functionName: 'mintFromMessage',
        args: [messageId, imageUri],
        value: mintFee,
      });

      setStatus('Minted successfully!');
      setProgress(100);
      onMintSuccess?.();
      refetch();
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${(err as Error).message}`);
      setProgress(0);
    }
  };

  const isLoading = isFeeLoading || isBalanceLoading || isMintedStatusLoading;

  if (address !== author) return null;
  if (hasBeenMinted) return <Badge variant="secondary">Already Minted</Badge>;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Mint as NFT
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mint Message #{messageId.toString()} as NFT</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground italic">"{messageText}"</p>
          <div>
            <Label htmlFor="nft-image">Upload Image</Label>
            <Input id="nft-image" type="file" accept="image/*" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
          </div>
          {status && (
            <div className="space-y-2">
               <p className="text-sm text-center">{status}</p>
               {progress > 0 && <Progress value={progress} />}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleMint} disabled={!selectedFile || progress > 0}>
            {progress > 0 && progress < 100 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {progress === 100 ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
            {status.startsWith('Error') ? <AlertCircle className="mr-2 h-4 w-4" /> : null}
            Mint Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}