// src/contracts/config.ts

// 1. 从 Hardhat 项目的 artifacts/contracts/ 目录中复制 ABI
import GuestBoardABI from '../abis/GuestBoard.json';
import GuestBoardNFTABI from '../abis/GuestBoardNFT.json';

export const GUESTBOARD_CONTRACT = {
  address: '0x48c9F9526f59DA3E8F1fE5C38C996E8Ce4cbf8E4' as const,
  abi: GuestBoardABI.abi,
};

export const GUESTBOARD_NFT_CONTRACT = {
  address: '0x817659384A83e7022fDffb34f2baB6118cDF9C27' as const,
  abi: GuestBoardNFTABI.abi,
};