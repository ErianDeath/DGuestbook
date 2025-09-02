import { describe, it } from "node:test";
import { deepStrictEqual, strictEqual, rejects } from "node:assert";
import { network } from "hardhat";
import type { Address } from "viem";

// **修复**: 将类型定义为对象，以匹配 viem 从 struct 数组返回的实际结构
type Message = {
    sender: Address;
    message: string;
    timestamp: bigint;
};

const { viem } = await network.connect();
const { getPublicClient, getWalletClients, deployContract } = viem;

describe("GuestBoard Contract with Viem", function () {
    // Fixture for deployment
    async function deployFixture() {
        const publicClient = await getPublicClient();
        const [owner, addr1] = await getWalletClients();
        const guestBoard = await deployContract("GuestBoard");

        return { publicClient, owner, addr1, guestBoard };
    }

    it("Should deploy and set the initial message correctly", async function () {
        const { guestBoard, owner } = await deployFixture();

        // **修复**: viem 将单个 struct 作为元组返回
        const initialMessageTuple = await guestBoard.read.messages([0n]);
        const initialMessage: Message = {
            sender: initialMessageTuple[0],
            message: initialMessageTuple[1],
            timestamp: initialMessageTuple[2],
        };
        
        strictEqual(
            initialMessage.sender.toLowerCase(),
            owner.account.address.toLowerCase(),
            "Initial message sender should be the owner"
        );
        strictEqual(initialMessage.message, "Hello Web3!", "Initial message content is incorrect");
    });

    it("Should allow a user to post a message and update state correctly", async function () {
        const { guestBoard, addr1 } = await deployFixture();
        const testMessage = "This is a test message from addr1.";

        await guestBoard.write.postMessage([testMessage], { account: addr1.account });

        const newMessageTuple = await guestBoard.read.messages([1n]);
        const newMessage: Message = {
            sender: newMessageTuple[0],
            message: newMessageTuple[1],
            timestamp: newMessageTuple[2],
        }

        strictEqual(
            newMessage.sender.toLowerCase(),
            addr1.account.address.toLowerCase(),
            "New message sender is incorrect"
        );
        strictEqual(newMessage.message, testMessage, "New message content is incorrect");
    });

    it("Should emit a NewMessage event when a message is posted", async function () {
        const { guestBoard, addr1, publicClient } = await deployFixture();
        const testMessage = "Testing event emission.";

        const txHash = await guestBoard.write.postMessage([testMessage], { account: addr1.account });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const events = await guestBoard.getEvents.NewMessage();
        const lastEvent = events[events.length - 1];

        strictEqual(
            lastEvent.args.sender?.toLowerCase(),
            addr1.account.address.toLowerCase(),
            "Event sender address is incorrect"
        );
        strictEqual(lastEvent.args.messageId, 1n, "Event messageId is incorrect");
        strictEqual(lastEvent.args.message, testMessage, "Event message content is incorrect");
    });

    it("Should revert the transaction if the message is empty", async function () {
        const { guestBoard, addr1 } = await deployFixture();
        
        // **修复**: 使用 `assert.rejects` 来测试异常，这是 node:test 的标准方式
        await rejects(
            guestBoard.write.postMessage([""], { account: addr1.account }),
            (err: Error) => {
                strictEqual(err.message.includes("Guestbook: Message text cannot be empty."), true);
                return true;
            },
            "Transaction should have reverted with an empty message error"
        );
    });

    it("Should correctly return all messages", async function () {
        const { guestBoard, owner, addr1 } = await deployFixture();
        await guestBoard.write.postMessage(["Message from addr1"], { account: addr1.account });

        // **修复**: viem 将 struct 数组作为对象数组返回，直接进行类型断言
        const allMessages = (await guestBoard.read.getAllMessages()) as Message[];

        strictEqual(allMessages.length, 2, "Should return two messages in total");
        
        // **修复**: 使用对象属性访问
        strictEqual(allMessages[0].sender.toLowerCase(), owner.account.address.toLowerCase());
        strictEqual(allMessages[0].message, "Hello Web3!");

        strictEqual(allMessages[1].sender.toLowerCase(), addr1.account.address.toLowerCase());
        strictEqual(allMessages[1].message, "Message from addr1");
    });
});

