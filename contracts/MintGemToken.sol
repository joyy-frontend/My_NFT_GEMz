// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MintGemToken is ERC721Enumerable, Ownable {
    string uri;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC721(_name, _symbol) {
        uri = _uri;
    }

    struct GemData {
        uint256 gemRank;
        uint256 gemType;
    }

    mapping(uint256 => GemData) public gemData;

    // 1 KLAY
    uint256 gemPrice = 1000000000000000000;

    // uri를 읽는 함수
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        string memory gemRank = Strings.toString(gemData[_tokenId].gemRank);
        string memory gemType = Strings.toString(gemData[_tokenId].gemType);

        return string(abi.encodePacked(uri, "/", gemRank, "/", gemType, ".json"));
    }

    function mintGem() public payable {
        require(gemPrice <= msg.value, "Not enough Klay.");
        uint256 tokenId = totalSupply() + 1;    // 토큰의 총량 반환
        uint256 randomNonce = tokenId;

        uint256 gemRank;
        uint256 gemType;

        uint256 randomRank = uint256(keccak256(abi.encodePacked(blockhash(block.timestamp),msg.sender,randomNonce))) % 10;

        randomNonce++;

        uint256 randomType = uint256(keccak256(abi.encodePacked(blockhash(block.timestamp),msg.sender,randomNonce))) % 10;

        if (randomRank < 4) {
            gemRank = 1;
        } else if (randomRank < 7) {
            gemRank = 2;
        } else if (randomRank < 9) {
            gemRank = 3;
        } else {
            gemRank = 4;
        }

        if (randomType < 4) {
            gemType = 1;
        } else if (randomType < 7) {
            gemType = 2;
        } else if (randomType < 9) {
            gemType = 3;
        } else {
            gemType = 4;
        }

        payable(owner()).transfer(msg.value);
        gemData[tokenId] = GemData(gemRank, gemType);

        _mint(msg.sender, tokenId);
    }

    function getLatestMintedGem(address _owner) public view returns(uint, uint) {
        uint balanceLength = balanceOf(_owner); //address를 인자로 넣으면 그 계정의 nft 갯수를 반환한다.
        uint tokenId = tokenOfOwnerByIndex(_owner, balanceLength - 1);  // 가장 마지막으로 민팅한 nft를 가져와서 토큰id 반환

        return (gemData[tokenId].gemRank, gemData[tokenId].gemType);
    }

    function getGemRank(uint _tokenId) public view returns (uint) {
        return gemData[_tokenId].gemRank;
    }

    function getGemType(uint _tokenId) public view returns (uint) {
        return gemData[_tokenId].gemType;
    }

}
