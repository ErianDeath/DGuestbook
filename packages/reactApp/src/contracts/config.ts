import GuestBoardABI from '../abis/GuestBoard.json';
import GuestBoardNFTABI from '../abis/GuestBoardNFT.json';

export const GUESTBOARD_CONTRACT = {
  address: '0x98BAF76B397a1e16C1d24f9B2f7b688699f4095C',
  abi: GuestBoardABI.abi,
} as const;

export const GUESTBOARD_NFT_CONTRACT = {
  address: '0x5194A31F134CB8F4dD903d14beFeFBad2E5277d5',
  abi: GuestBoardNFTABI.abi,
} as const;
