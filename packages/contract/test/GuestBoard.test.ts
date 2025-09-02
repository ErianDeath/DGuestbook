// /test/GuestBoard.test.ts

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

// 主测试套件
describe("GuestBoard", function () {
  // 我们定义一个 "fixture" 函数来部署合约，这样可以复用设置并加快测试速度
  async function deployGuestBoardFixture() {
    // 获取签名者账户
    const [owner, addr1, addr2] = await ethers.getSigners();

    // 部署合约
    const GuestBoardFactory = await ethers.getContractFactory("GuestBoard");
    const guestBoard = await GuestBoardFactory.deploy();

    return { guestBoard, owner, addr1, addr2 };
  }

  // 测试套件 1: 部署相关的测试
  describe("Deployment", function () {
    it("Should deploy and set the initial message from the owner", async function () {
      const { guestBoard, owner } = await loadFixture(deployGuestBoardFixture);

      // 检查总留言数是否为 1 (构造函数中的初始留言)
      expect(await guestBoard.getAllMessagesCount()).to.equal(1);

      // 检查初始留言的发送者是否为 owner
      const initialMessage = (await guestBoard.messages(0));
      expect(initialMessage.sender).to.equal(owner.address);
      expect(initialMessage.message).to.equal("Hello Web3!");
    });
  });

  // 测试套件 2: 留言相关的测试
  describe("Messaging", function () {
    it("Should allow users to post a message", async function () {
      const { guestBoard, addr1 } = await loadFixture(deployGuestBoardFixture);
      const testMessage = "This is a test message.";

      // addr1 发送一条留言
      await guestBoard.connect(addr1).postMessage(testMessage);

      // 检查总留言数是否变为 2
      expect(await guestBoard.getAllMessagesCount()).to.equal(2);

      // 检查 addr1 的留言数是否为 1
      expect(await guestBoard.getMessagesCountByUser(addr1.address)).to.equal(1);

      // 检查新留言的内容和发送者是否正确
      const newMessage = (await guestBoard.messages(1));
      expect(newMessage.sender).to.equal(addr1.address);
      expect(newMessage.message).to.equal(testMessage);

      // 检查 addr1 的留言 ID 索引是否正确
      const userMsgIds = await guestBoard.userMsgId(addr1.address, 0);
      expect(userMsgIds).to.equal(1); // 因为第二条留言的 ID 是 1
    });

    it("Should emit a NewMessage event when a message is posted", async function () {
      const { guestBoard, addr1 } = await loadFixture(deployGuestBoardFixture);
      const testMessage = "Another test message.";
      
      // 期望 postMessage 调用会触发 NewMessage 事件，并带有正确的参数
      await expect(guestBoard.connect(addr1).postMessage(testMessage))
        .to.emit(guestBoard, "NewMessage")
        .withArgs(addr1.address, 1, (await ethers.provider.getBlock('latest'))!.timestamp + 1, testMessage);
        // 注意：时间戳的精确断言可能因测试环境而异，通常检查其他参数更重要
    });

    it("Should revert if the message is empty", async function () {
      const { guestBoard, addr1 } = await loadFixture(deployGuestBoardFixture);

      // 期望调用 postMessage 并传入空字符串时，交易会被回滚
      await expect(
        guestBoard.connect(addr1).postMessage("")
      ).to.be.revertedWith("Guestbook: Message text cannot be empty.");
    });
  });
});