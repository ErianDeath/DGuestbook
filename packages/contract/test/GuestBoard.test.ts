import { describe, it } from "node:test";
import { deepStrictEqual, strictEqual, rejects } from "node:assert";
import { network } from "hardhat";
import type { Address } from "viem";

// **修复**: 明确定义合约返回的 Struct 和 Event 的类型
type Message = readonly [Address, string, bigint]; // [sender, message, timestamp]

type NewMessageEventArgs = {
    sender?: Address;
    messageId?: bigint;
    message?: string;
    timestamp?: bigint;
}

const { viem } = await network.connect();
const { getPublicClient, getWalletClients, deployContract } = viem;

describe("GuestBoard Data Contract", function () {
    async function deployFixture() {
        const publicClient = await getPublicClient();
        const [owner, addr1] = await getWalletClients();
        const guestBoard = await deployContract("GuestBoard");
        return { publicClient, owner, addr1, guestBoard };
    }

    it("Should start with zero messages upon deployment", async function () {
        const { guestBoard } = await deployFixture();

        const messageCount = await guestBoard.read.getMessageCount();
        strictEqual(messageCount, 0n, "Initial message count should be 0");
    });

    it("Should allow a user to post the first message correctly", async function () {
        const { guestBoard, owner } = await deployFixture();
        const testMessage = "This is the first message.";

        await guestBoard.write.postMessage([testMessage], { account: owner.account });

        const messageCount = await guestBoard.read.getMessageCount();
        strictEqual(messageCount, 1n, "Message count should be 1 after posting");

        // **修复**: 使用类型断言告诉 TypeScript postedMessageTuple 的确切类型
        const postedMessageTuple = (await guestBoard.read.messages([0n])) as Message;
        strictEqual(postedMessageTuple[0].toLowerCase(), owner.account.address.toLowerCase(), "Sender of the first message is incorrect");
        strictEqual(postedMessageTuple[1], testMessage, "Content of the first message is incorrect");
    });

    it("Should correctly track message IDs for users", async function() {
        const { guestBoard, owner, addr1 } = await deployFixture();

        await guestBoard.write.postMessage(["Owner's first message"], { account: owner.account });   // msgId 0
        await guestBoard.write.postMessage(["Addr1's first message"], { account: addr1.account });   // msgId 1
        await guestBoard.write.postMessage(["Owner's second message"], { account: owner.account });  // msgId 2

        const ownerMessageIds = await guestBoard.read.getMessageIdsByUser([owner.account.address]);
        deepStrictEqual(ownerMessageIds, [0n, 2n], "Owner's message ID list is incorrect");

        const addr1MessageIds = await guestBoard.read.getMessageIdsByUser([addr1.account.address]);
        deepStrictEqual(addr1MessageIds, [1n], "Addr1's message ID list is incorrect");
    });


    it("Should emit a NewMessage event upon posting", async function () {
        const { guestBoard, addr1, publicClient } = await deployFixture();
        const testMessage = "Testing event emission.";

        const txHash = await guestBoard.write.postMessage([testMessage], { account: addr1.account });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const events = await guestBoard.getEvents.NewMessage();
        strictEqual(events.length, 1, "Should have emitted one event");
        
        // **修复**: 使用类型断言告诉 TypeScript eventArgs 的确切类型
        const eventArgs = events[0].args as NewMessageEventArgs;

        strictEqual(eventArgs.sender?.toLowerCase(), addr1.account.address.toLowerCase(), "Event sender is incorrect");
        strictEqual(eventArgs.messageId, 0n, "Event messageId should be 0 for the first message");
        strictEqual(eventArgs.message, testMessage, "Event message content is incorrect");
    });

    it("Should revert if the message content is empty", async function () {
        const { guestBoard, addr1 } = await deployFixture();
        
        await rejects(
            guestBoard.write.postMessage([""], { account: addr1.account }),
            (err: Error) => err.message.includes("Message cannot be empty."),
            "Transaction should have reverted with an empty message error"
        );
    });
});

