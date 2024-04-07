// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// Inherit ERC721URIStorage to store tokenURI
contract NFT is ERC721URIStorage {
    // Count how many NFTs have been minted
    uint public tokenCount;

    constructor() ERC721("DApp NFT", "DAPP"){}

    /// Memory: the address of the input string
    function mint(string memory _tokenURI) external returns(uint) {
        tokenCount ++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        return(tokenCount);
    }
}