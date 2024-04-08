// Put smart ccontract onto the blockchain of hardhat local network

async function main() {
  // Pick deployer from the first account in the list of accounts
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Use ContractFactory (factory pattern contract) to deploy new instances of the contract.
  const NFT = await ethers.getContractFactory("NFT");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  
  // Deploy nft contract
  const nft = await NFT.deploy();
  // Deploy the marketplace contract
  // Input fee percentage for the marketplace, imagine we want to take 5% of the sale price
  const marketplace = await Marketplace.deploy(5);
  
  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end
  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(marketplace , "Marketplace");
  saveFrontendFiles(nft , "NFT");
  console.log("NFT contract address:", nft.address);
  console.log("Marketplace contract address:", marketplace.address);
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save the contract's address to the frontend so we can use it in our frontend to interact with the deployed contract
  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  // Smart contract ABI is necessary to interact with the contract
  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });