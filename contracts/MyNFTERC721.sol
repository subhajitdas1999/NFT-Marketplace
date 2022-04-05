//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; 


contract MyNFTERC721 is ERC721Enumerable, Ownable{

    using Strings for uint256;

    //uint8 , maximum token can be mint at a time
    uint8 private _maxTokenMintAtOneGo = 6;

    //to count the token ID
    uint256 private _tokenIdCounter;

    string private _baseExtension = ".json";


    

    constructor(string memory _name, string memory _symbol) ERC721(_name,_symbol) {
        _tokenIdCounter=1;
    }
    function mint(uint256 _tokenAmount) public onlyOwner{
        require(_tokenAmount <= _maxTokenMintAtOneGo,"You can max mint 5 token at a time");
        for(uint8 i=0;i< _tokenAmount;i++){
            _safeMint(msg.sender,_tokenIdCounter);
            _tokenIdCounter++;
        }
        
        

    }


    function tokenURI(uint256 tokenId) public view  override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), _baseExtension)) : "";
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmQu1KZ16W2SrvwqCYMyJPg5JTAPJ1kwMj3QqMh4JEciYY/";
    }

    
    
    

}