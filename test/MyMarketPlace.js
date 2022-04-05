const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyMarketPlace Contract", () => {
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let MyMarketPlace;
  let MyMarketPlaceInstance;
  let MyNFTERC721;
  let MyNFTERC721Instance;

  const feePercentage = 3;

  const listNFTFromOwnerAccountTokenID1 = async () => {
    //approve the marketplace as an operator
    await MyNFTERC721Instance.setApprovalForAll(
      MyMarketPlaceInstance.address,
      true
    );

    // list an NFT with the token ID 1
    await expect(
      MyMarketPlaceInstance.listNFTforSale(
        ethers.utils.parseUnits("0.0001", "ether").toString(),
        MyNFTERC721Instance.address,
        1
      )
    ).to.emit(MyMarketPlaceInstance, "listed");
  };

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    MyMarketPlace = await ethers.getContractFactory("MyMarketPlace");
    MyMarketPlaceInstance = await MyMarketPlace.deploy(feePercentage);
    MyNFTERC721 = await ethers.getContractFactory("MyNFTERC721");
    MyNFTERC721Instance = await MyNFTERC721.deploy(
      "My Space collection",
      "MSC"
    );
    // mint 3 NFTS (owner account)
    await MyNFTERC721Instance.mint(3);
  });

  it("delployer should be feeReciever", async () => {
    expect(await MyMarketPlaceInstance._feeReciever()).to.equal(owner.address);
    expect(await MyMarketPlaceInstance.feePercentage()).to.equal(feePercentage);
  });

  it("NFT owner should approve marketPlace before listing and pass all other requirements", async () => {
    //minimum price of NFT listing is 0.00001 ether
    await expect(
      MyMarketPlaceInstance.listNFTforSale(
        ethers.utils.parseUnits("0.00000000001", "ether").toString(),
        MyNFTERC721Instance.address,
        1
      )
    ).to.be.revertedWith("minimum listing price is 0.00001 ether");

    //NFT owner is required for listing
    await expect(
      MyMarketPlaceInstance.connect(addr1).listNFTforSale(
        ethers.utils.parseUnits("1", "ether").toString(),
        MyNFTERC721Instance.address,
        1
      )
    ).to.be.revertedWith("Owner is required for listing");

    //trying to list the item with token ID 1 and set the selling price 1 ether
    await expect(
      MyMarketPlaceInstance.listNFTforSale(
        ethers.utils.parseUnits("1", "ether").toString(),
        MyNFTERC721Instance.address,
        1
      )
    ).to.be.revertedWith(
      "Owner should approved this marketPlace as a operator before listings"
    );
  });

  it("NFT Owner should be able to list items after approving MarketPlace and all other conditions and emit listed events", async () => {
    //list the NFT
    await listNFTFromOwnerAccountTokenID1();
  });

  it("owner cannot list a one NFT multiple times", async () => {
    //list the NFT
    await listNFTFromOwnerAccountTokenID1();

    //try to list the same NFT again
    await expect(
      MyMarketPlaceInstance.listNFTforSale(
        ethers.utils.parseUnits("1", "ether").toString(),
        MyNFTERC721Instance.address,
        1
      )
    ).to.be.revertedWith("NFT is already in sale");
  });

  it("After listing a NFT, correct listing info should be there for sale", async () => {
    //list the NFT
    await listNFTFromOwnerAccountTokenID1();

    const [itemId, contractAddress, tokenId, price, seller, sold] =
      await MyMarketPlaceInstance.items(1);

    expect(contractAddress).to.equal(MyNFTERC721Instance.address);
    expect(tokenId).to.equal(1); //token Id 1 is listed
    expect(price).to.equal(ethers.utils.parseUnits("0.0001", "ether").toString());
    expect(seller).to.equal(owner.address);
    expect(sold).to.equal(false);
  });

  it("User cannot buy NFT with Invalid item id", async () => {
    //list the NFT
    await listNFTFromOwnerAccountTokenID1();

    //try to buy with invalid id (ex:0)
    await expect(
      MyMarketPlaceInstance.buyNFT(0, {
        value: ethers.utils.parseUnits("1", "ether"),
      })
    ).to.be.revertedWith("NFT is not exist");
  });

  it("user should able to purchase NFT and Become an Owner", async () => {
    //list the NFT
    await listNFTFromOwnerAccountTokenID1();

    //buy from addr1
    await expect(
      MyMarketPlaceInstance.connect(addr1).buyNFT(1, {
        value: ethers.utils.parseUnits("1", "ether"),
      })
    ).to.emit(MyMarketPlaceInstance, "purchase");

    //addr1 should be the new owner
    expect(await MyNFTERC721Instance.ownerOf(1)).to.equal(addr1.address);
  });

  it("Cannnot purchase an NFT , which is already purchased",async()=>{
    //list the NFT
    await listNFTFromOwnerAccountTokenID1();

    //buy from addr1
    await expect(
      MyMarketPlaceInstance.connect(addr1).buyNFT(1, {
        value: ethers.utils.parseUnits("1", "ether"),
      })
    ).to.emit(MyMarketPlaceInstance, "purchase");

    //try to buy this NFT again
    await expect(
      MyMarketPlaceInstance.connect(addr1).buyNFT(1, {
        value: ethers.utils.parseUnits("1", "ether"),
      })
    ).to.be.revertedWith("This NFT is already sold");

  })


});
