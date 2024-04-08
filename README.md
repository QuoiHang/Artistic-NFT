# Artistic-NFT

## npx hardhat node
    to get available nodes to start with

## npx hardhat run src/backend/scripts/deploy.js --network localhost
    set up address as http://127.0.0.1:8545, and chain ID in 31337
    we deploy the smart contract into testnet

## npm run start
    to open dapp on explorer

## npx hardhat console --network localhost
    to open console to interact with smart contract

    ### to test expected balance w/o confirmation in hardhat console

    const [add0, add1] = await ethers.getSigners();
    const ba0 = await add0.getBalance();
    const ba1 = await add1.getBalance();
    console.log(ethers.utils.formatEther(ba0), "ETH");
    console.log(ethers.utils.formatEther(ba1), "ETH");
