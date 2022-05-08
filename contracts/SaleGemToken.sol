// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "MintGemToken.sol";

contract SaleGemToken {
  MintGemToken public mintGemToken;

  constructor(address _mintGemToken) {
    mintGemToken = MintGemToken(_mintGemToken);
  }

  mapping(uint => uint) public tokenPrices;

  uint[] public onSaleGemTokens;

  struct SaleGemData {
    uint tokenId;
    uint gemRank;
    uint gemType;
    uint tokenPrice;
  }

  function setForSaleGemToken(uint _tokenId, uint _price) public {
    address tokenOwner = mintGemToken.ownerOf(_tokenId);

    require(tokenOwner == msg.sender, "Caller is not gem Token owner.");
    require(_price > 0, "Price is zero or lower.");
    require(tokenPrices[_tokenId] == 0, "This gem token is already on sale.");

    // 판매권한을 가지고 있는지 체크
    require(mintGemToken.isApprovedForAll(tokenOwner, address(this)), "Gem token owner did not approve token.");

    tokenPrices[_tokenId] = _price;

    onSaleGemTokens.push(_tokenId);
  }

  function purchaseGemToken(uint _tokenId) public payable {
    uint price = tokenPrices[_tokenId];
    address tokenOwner = mintGemToken.ownerOf(_tokenId);

    require(price > 0, "This gem token not sale.");
    require(price <= msg.value, "Caller sent lower than price");
    require(tokenOwner != msg.sender, "Caller is gem token owner.");

    payable(tokenOwner).transfer(msg.value);
    mintGemToken.safeTransferFrom(tokenOwner, msg.sender, _tokenId);

    tokenPrices[_tokenId] = 0;

    for(uint i = 0; i < onSaleGemTokens.length; i++) {
      if(tokenPrices[onSaleGemTokens[i]] == 0) {
        onSaleGemTokens[i] = onSaleGemTokens[onSaleGemTokens.length - 1];
        onSaleGemTokens.pop();
      } 
    }

  }

  function getGemTokens(address _owner) public view returns(SaleGemData[] memory) {
    uint balanceLength = mintGemToken.balanceOf(_owner);

    require(balanceLength != 0, "Token owner did not token.");

    SaleGemData[] memory gemDataArray = new SaleGemData[](balanceLength);

    for(uint i = 0; i < balanceLength; i++) {
      uint tokenId = mintGemToken.tokenOfOwnerByIndex(_owner, i);
      uint gemRank = mintGemToken.getGemRank(tokenId);
      uint gemType = mintGemToken.getGemType(tokenId);
      uint tokenPrice = tokenPrices[tokenId];

      // gemDataArray의 i 번째 인덱스에 넣어줌.
      gemDataArray[i] = SaleGemData(tokenId, gemRank, gemType, tokenPrice);
    }

    return gemDataArray;
  }

  function getSaleGemTokens() public view returns(SaleGemData[] memory) {
    require(onSaleGemTokens.length > 0, "Not exist on sale token.");

    SaleGemData[] memory onSaleTokens = new SaleGemData[](onSaleGemTokens.length);

    for(uint i = 0; i < onSaleGemTokens.length; i++) {
      uint tokenId = onSaleGemTokens[i];
      uint gemRank = mintGemToken.getGemRank(tokenId);
      uint gemType = mintGemToken.getGemType(tokenId);
      uint tokenPrice = tokenPrices[tokenId];

      onSaleTokens[i] = SaleGemData(tokenId, gemRank, gemType, tokenPrice);
    }
    return onSaleTokens;
  }
  
}