require("dotenv").config();
const { ethers } = require("hardhat");

const BN = ethers.BigNumber;

const deployer = {
  sepolia: null,
  localhost: null,
  hardhat: null
};

async function initializeDeployer() {
  try {
    const [signer] = await ethers.getSigners();
    
    deployer.sepolia = signer;
    deployer.localhost = signer;
    deployer.hardhat = signer;
    
    console.log(`🔗 Connected to network: ${await signer.provider.getNetwork().then(n => n.name)}`);
    console.log(`👤 Using account: ${signer.address}`);
  } catch (error) {
    console.error("Error initializing deployer:", error.message);
  }
}

// Export the initialization function so it can be called when needed
module.exports = {
  BN,
  deployer,
  ethers,
  initializeDeployer
};
