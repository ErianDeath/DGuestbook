// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GuestBoard {

    struct Message{
        address sender;
        string message;
        uint256 timestamp;
    }

    Message[] public messages;

    mapping(address => uint256[]) public userMsgId;

    event NewMessage(
        address indexed sender, 
        uint256 indexed messageId,
        uint256 timestamp, 
        string message
        );
    
    constructor() {
        string memory initMsg = "Hello Web3!";
        uint256 initMsgId = messages.length;
        messages.push(Message(msg.sender, initMsg, block.timestamp));
        userMsgId[msg.sender].push(initMsgId);
        emit NewMessage(msg.sender, initMsgId, block.timestamp, initMsg);
    }

    function postMessage(string memory _msg)  public {
        require(bytes(_msg).length > 0, "Guestbook: Message text cannot be empty.");
        uint256 _msgId = messages.length;
        messages.push(Message(msg.sender, _msg, block.timestamp));
        userMsgId[msg.sender].push(_msgId);
        emit NewMessage(msg.sender, _msgId, block.timestamp, _msg);
    }

    function getAllMessages() public view returns(Message[] memory) {
        return messages;
    }

    function getMessagesCount() public view returns(uint256) {
        return messages.length;
    }

    function getMessagesCountByUser(address _sender) public view returns(uint256) {
        return userMsgId[_sender].length;
    }
}