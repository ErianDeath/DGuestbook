import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GuestBoardModule", (m) => {
  // 部署 GuestBoard 数据合约
  const guestBoard = m.contract("GuestBoard");

  // 部署 GuestBoardNFT 合约，并将 GuestBoard 合约的地址作为参数传入
  const guestBoardNFT = m.contract("GuestBoardNFT", [guestBoard]);

  // 返回部署后的合约实例，方便后续使用
  return { guestBoard, guestBoardNFT };
});