import { describe, it } from "node:test";
import { strictEqual, rejects } from "node:assert";
import { network } from "hardhat";
import { parseEther, type Address } from "viem";

const { viem } = await network.connect();
const { getPublicClient, getWalletClients, deployContract } = viem;

describe("GuestBoardNFT Contract", function () {
    // 这个 fixture 负责部署两个合约并建立它们之间的连接
    async function deployFixture() {
        const publicClient = await getPublicClient();
        const [owner, addr1] = await getWalletClients();
        
        // 1. 部署数据合约
        const guestBoard = await deployContract("GuestBoard");
        
        // 2. 部署 NFT 合约，并传入数据合约的地址
        const guestBoardNFT = await deployContract("GuestBoardNFT", [guestBoard.address]);

        // 预先发布一些留言以供测试
        await guestBoard.write.postMessage(["Owner's first message"], { account: owner.account }); // msgId 0
        await guestBoard.write.postMessage(["Addr1's first message"], { account: addr1.account }); // msgId 1

        return { publicClient, owner, addr1, guestBoard, guestBoardNFT };
    }

    // --- Minting Logic Tests ---
    describe("Minting Logic", function () {
        it("Should allow minting a message with the correct fee", async function () {
            const { addr1, guestBoardNFT } = await deployFixture();
            // **修复**: 为 'mintFee' 添加类型断言
            const mintFee = (await guestBoardNFT.read.mintFee()) as bigint;
            const messageIdToMint = 1n; // addr1 的留言 ID

            await guestBoardNFT.write.mintFromMessage([messageIdToMint, "ipfs://..."], {
                account: addr1.account,
                value: mintFee,
            });

            // **修复**: 为 'ownerOf' 的返回值添加类型断言
            const ownerOfToken0 = (await guestBoardNFT.read.ownerOf([0n])) as Address;
            strictEqual(
                ownerOfToken0.toLowerCase(),
                addr1.account.address.toLowerCase(),
                "addr1 should own the minted NFT"
            );
        });

        it("Should revert if fee is insufficient", async function () {
            const { addr1, guestBoardNFT } = await deployFixture();
            const insufficientFee = parseEther("0.001");

            await rejects(
                guestBoardNFT.write.mintFromMessage([1n, "ipfs://..."], {
                    account: addr1.account,
                    value: insufficientFee,
                }),
                (err: Error) => err.message.includes("Insufficient fee to mint NFT."),
                "Should revert for insufficient fee"
            );
        });

        it("Should revert if a user tries to mint another user's message", async function () {
            const { addr1, guestBoardNFT } = await deployFixture();
            const mintFee = (await guestBoardNFT.read.mintFee()) as bigint;
            const ownersMessageId = 0n; // owner 的留言 ID

            await rejects(
                guestBoardNFT.write.mintFromMessage([ownersMessageId, "ipfs://..."], {
                    account: addr1.account,
                    value: mintFee,
                }),
                (err: Error) => err.message.includes("You can only mint your own messages."),
                "Should not allow minting another user's message"
            );
        });

        it("Should revert if trying to mint the same message twice", async function () {
            const { addr1, guestBoardNFT } = await deployFixture();
            const mintFee = (await guestBoardNFT.read.mintFee()) as bigint;
            const messageIdToMint = 1n;
    
            // 第一次成功铸造
            await guestBoardNFT.write.mintFromMessage([messageIdToMint, "ipfs://first"], {
                account: addr1.account,
                value: mintFee,
            });
    
            // 尝试第二次铸造同一条留言
            await rejects(
                guestBoardNFT.write.mintFromMessage([messageIdToMint, "ipfs://second"], {
                    account: addr1.account,
                    value: mintFee,
                }),
                (err: Error) => err.message.includes("This message has already been minted."),
                "Should revert on minting a message twice"
            );
        });
    });

    // --- Token URI Logic Tests ---
    describe("Token URI", function() {
        it("Should generate correct tokenURI with message and image data", async function () {
            const { owner, guestBoardNFT } = await deployFixture();
            const mintFee = (await guestBoardNFT.read.mintFee()) as bigint;
            const imageURI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
            const messageId = 0n;
    
            await guestBoardNFT.write.mintFromMessage([messageId, imageURI], {
                account: owner.account,
                value: mintFee,
            });
    
            // **修复**: 为 'tokenURI' 的返回值添加类型断言
            const tokenURI = (await guestBoardNFT.read.tokenURI([0n])) as string;
            
            const jsonPart = tokenURI.split(',')[1];
            const decodedJson = Buffer.from(jsonPart, 'base64').toString('utf-8');
            const metadata = JSON.parse(decodedJson);
    
            strictEqual(metadata.name, "Guestbook Message #0", "NFT name is incorrect");
            strictEqual(metadata.description, "Owner's first message", "NFT description is incorrect");
            strictEqual(metadata.image, imageURI, "NFT image URI is incorrect");
        });
    });

    // --- Admin Function Tests ---
    describe("Admin Functions", function() {
        it("Should allow the owner to change the mint fee", async function () {
            const { owner, guestBoardNFT } = await deployFixture();
            const newFee = parseEther("0.05");

            await guestBoardNFT.write.setMintFee([newFee], { account: owner.account });

            const updatedFee = (await guestBoardNFT.read.mintFee()) as bigint;
            strictEqual(updatedFee, newFee, "Mint fee should be updated");
        });

        it("Should prevent non-owners from changing the mint fee", async function () {
            const { addr1, guestBoardNFT } = await deployFixture();
            const newFee = parseEther("0.05");

            await rejects(
                guestBoardNFT.write.setMintFee([newFee], { account: addr1.account }),
                (err: Error) => err.message.includes("Ownable: caller is not the owner"),
                "Only owner should be able to set mint fee"
            );
        });

        it("Should allow the owner to withdraw funds", async function () {
            const { publicClient, owner, addr1, guestBoardNFT } = await deployFixture();
            const mintFee = (await guestBoardNFT.read.mintFee()) as bigint;

            // addr1 铸造一个 NFT，为合约增加一些余额
            await guestBoardNFT.write.mintFromMessage([1n, "ipfs://..."], {
                account: addr1.account,
                value: mintFee,
            });

            const contractBalanceBefore = await publicClient.getBalance({ address: guestBoardNFT.address });
            const ownerBalanceBefore = await publicClient.getBalance({ address: owner.account.address });

            strictEqual(contractBalanceBefore, mintFee, "Contract should have a balance equal to the mint fee");

            // **修复**: 为没有参数的 write 函数传入一个空数组 []
            const txHash = await guestBoardNFT.write.withdraw([], { account: owner.account });
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
            const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

            const contractBalanceAfter = await publicClient.getBalance({ address: guestBoardNFT.address });
            const ownerBalanceAfter = await publicClient.getBalance({ address: owner.account.address });

            strictEqual(contractBalanceAfter, 0n, "Contract balance should be zero after withdrawal");
            strictEqual(ownerBalanceAfter, ownerBalanceBefore + mintFee - gasUsed, "Owner should receive the funds minus gas costs");
        });

        it("Should prevent non-owners from withdrawing funds", async function () {
            const { addr1, guestBoardNFT } = await deployFixture();

            // **修复**: 为没有参数的 write 函数传入一个空数组 []
            await rejects(
                guestBoardNFT.write.withdraw([], { account: addr1.account }),
                (err: Error) => err.message.includes("Ownable: caller is not the owner"),
                "Only owner should be able to withdraw funds"
            );
        });
    });
});

