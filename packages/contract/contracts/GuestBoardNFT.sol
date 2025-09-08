// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

// 为 GuestBoard 数据合约定义一个接口
interface IGuestBoard {
    // Note: The struct definition here is for clarity, but not strictly necessary
    // for the interface since we only care about the function signature.
    struct Message {
        address sender;
        string message;
        uint256 timestamp;
    }
    function messages(uint256) external view returns (address sender, string memory message, uint256 timestamp);
    function getMessageCount() external view returns (uint256);
}

contract GuestBoardNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;

    IGuestBoard public guestBoardContract;
    uint256 public mintFee = 0.01 ether;

    mapping(uint256 => bool) public messageHasBeenMinted;
    mapping(uint256 => string) private _tokenImageURIs;
    mapping(uint256 => uint256) public tokenIdToMessageId;

    event NFTMinted(
        uint256 indexed tokenId,
        uint256 indexed messageId,
        address indexed owner
    );

    // **修复1**: Ownable constructor in v5.0 requires the initial owner address.
    constructor(address _guestBoardAddress) ERC721("Guestbook Message NFT", "GBM") Ownable(msg.sender) {
        guestBoardContract = IGuestBoard(_guestBoardAddress);
    }

    function mintFromMessage(uint256 _messageId, string memory _imageURI) public payable {
        require(msg.value >= mintFee, "Insufficient fee to mint NFT.");
        require(_messageId < guestBoardContract.getMessageCount(), "Message ID does not exist.");
        
        // **修复2**: Correctly handle multiple return values from the interface call.
        // We only need the sender for the check, so we can ignore the other return values.
        (address messageSender, , ) = guestBoardContract.messages(_messageId);
        require(messageSender == msg.sender, "You can only mint your own messages.");
        
        require(!messageHasBeenMinted[_messageId], "This message has already been minted.");

        messageHasBeenMinted[_messageId] = true;
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _tokenImageURIs[tokenId] = _imageURI;
        tokenIdToMessageId[tokenId] = _messageId;
        
        _safeMint(msg.sender, tokenId);

        emit NFTMinted(tokenId, _messageId, msg.sender);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        uint256 messageId = tokenIdToMessageId[tokenId];
        (, string memory messageText, uint256 messageTimestamp) = guestBoardContract.messages(messageId);
        string memory imageURI = _tokenImageURIs[tokenId];

        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name": "Guestbook Message #',
                    messageId.toString(),
                    '", "description": "',
                    messageText,
                    '", "image": "',
                    imageURI,
                    '", "attributes": [',
                    '{"trait_type": "Author", "value": "', Strings.toHexString(ownerOf(tokenId)), '"},',
                    '{"trait_type": "Timestamp", "value": ', messageTimestamp.toString(), '}',
                    ']}'
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function setMintFee(uint256 _newFee) public onlyOwner {
        mintFee = _newFee;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed.");
    }
}

