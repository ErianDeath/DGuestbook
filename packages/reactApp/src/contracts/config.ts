import GuestBoardABI from '../abis/GuestBoard.json';
import GuestBoardNFTABI from '../abis/GuestBoardNFT.json';

export const GUESTBOARD_CONTRACT = {
  address: '0x48c9F9526f59DA3E8F1fE5C38C996E8Ce4cbf8E4',
  abi: GuestBoardABI.abi,
} as const;

export const GUESTBOARD_NFT_CONTRACT = {
  address: '0x817659384A83e7022fDffb34f2baB6118cDF9C27',
  abi: GuestBoardNFTABI.abi,
} as const;