async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const MyMarketPlace = await ethers.getContractFactory("MyMarketPlace");
    const feePercentage = 3;
    const MyMarketPlaceInstance = await MyMarketPlace.deploy(feePercentage);
  
    console.log("Token address:", MyMarketPlaceInstance.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });