# Artistic-NFT

Steps to run the project

## 1. mpn install
to install all dependencies

## 2. npx hardhat node
to get available nodes to start with

### 2.1 by default, we use 1st node to deploy smart contract

## 3. npx hardhat run src/backend/scripts/deploy.js --network localhost
In Metamask-> Networks -> Add network -> Add a network manually
Settingset up address as http://127.0.0.1:8545, and chain ID in 31337
we deploy the smart contract into testnet

## 4. ~~npm run start~~
~~to open dapp on explorer~~
## 4. npm run dev
run together w/ backend  

## npx hardhat console --network localhost
to open console to interact with smart contract


## 5. Notes
### in case the balance is not updated, we can use the following command to update the balance
### to test expected balance w/o confirmation in hardhat console

```
const [add0, add1] = await ethers.getSigners();
const ba0 = await add0.getBalanc();
const ba1 = await add1.getBalanc();
console.log(ethers.utilsformatEther(ba0), "ETH");
console.log(ethers.utilsformatEther(ba1), "ETH");
```

