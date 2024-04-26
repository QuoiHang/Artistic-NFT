// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

// Use reentrancy guard to prevent reentrancy attacks
contract Marketplace is ReentrancyGuard {
    // State Variables
    // the account that receives fees
    address payable public immutable feeAccount; 
    // _feePercent is the percentage of the fee that will be taken from the sale price
    uint public immutable feePercent;
    uint public itemCount; 

    struct Item {
        uint itemId;    // the id of the item in the marketplace
        IERC721 nft;
        uint tokenId;   // the id of the token in the nft contract
        uint price;
        address payable seller;
        bool sold;
    }

    // itemId -> Item
    mapping(uint => Item) public items;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );
    
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    // Constructor
    constructor(uint _feePercent) {
        // feeAccount (sender) is the account that deploys the contract
        feeAccount = payable(msg.sender);
        // feePercent is the service fee over the sale price
        feePercent = _feePercent;
    }

    // Make item to offer on the marketplace
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        // increment itemCount
        itemCount ++;
        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            _price,
            // msg.sender is the seller in makeItem
            payable(msg.sender),
            false
        );

        // emit Offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            // msg.sender is the seller in makeItem
            msg.sender
        );
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        require(msg.value >= _totalPrice, "Not enough Ether to cover item price and market fee");
        require(!item.sold, "Item already sold");
        
        // transfer(address to, uint256 value)
        // Pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        // Update item to sold
        item.sold = true;
        // safeTransferFrom(address from, address to, uint256 tokenId)
        // Transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        item.seller = payable(msg.sender);

        // Emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            // msg.sender is the buyer in purchaseItem
            msg.sender
        );
    }

    // Resell item
    function resellItem(uint _itemId, uint _price) external nonReentrant {
        Item storage item = items[_itemId];
        require(_price > 0, "Price must be greater than zero");
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        require(msg.sender == item.seller, "Only the seller can resell the item");

        item.price = _price;
        item.sold = false;

        // transfer nft
        item.nft.transferFrom(msg.sender, address(this), item.tokenId);

        // emit Offered event
        emit Offered(
            item.itemId,
            address(item.nft),
            item.tokenId,
            _price,
            // msg.sender is the seller in makeItem
            msg.sender
        );
    }

    function getTotalPrice(uint _itemId) view public returns(uint){
        return((items[_itemId].price * (100 + feePercent)) / 100);
    }
}
