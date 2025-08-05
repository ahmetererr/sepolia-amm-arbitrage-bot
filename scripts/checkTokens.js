const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🔍 Checking Token Status on Sepolia");
  console.log("====================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  // Basic ERC20 ABI for checking tokens
  const ERC20_ABI = [
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [{"name": "", "type": "string"}],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "", "type": "string"}],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint8"}],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const tokens = [
    { name: "WETH", address: WETH },
    { name: "FOGG", address: FOGG },
    { name: "DAI", address: DAI }
  ];

  for (const token of tokens) {
    console.log(`\n🔍 Checking ${token.name} (${token.address})`);
    
    try {
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, ethers.provider);
      
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();
      
      console.log(`  ✅ Token exists`);
      console.log(`  📝 Name: ${name}`);
      console.log(`  🏷️ Symbol: ${symbol}`);
      console.log(`  🔢 Decimals: ${decimals}`);
      
      // Check if we have any balance
      const [signer] = await ethers.getSigners();
      const balance = await tokenContract.balanceOf(signer.address);
      console.log(`  💰 Our balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  // Check pools
  console.log(`\n🏊‍♂️ Checking Pools`);
  console.log(`  DAI/WETH: ${SEPOLIA_POOLS.DAI_WETH}`);
  console.log(`  FOGG/WETH: ${SEPOLIA_POOLS.FOGG_WETH}`);

  // Check if pools exist and have liquidity
  const PAIR_ABI = [
    {
      "constant": true,
      "inputs": [],
      "name": "token0",
      "outputs": [{"name": "", "type": "address"}],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "token1",
      "outputs": [{"name": "", "type": "address"}],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getReserves",
      "outputs": [
        {"name": "_reserve0", "type": "uint112"},
        {"name": "_reserve1", "type": "uint112"},
        {"name": "_blockTimestampLast", "type": "uint32"}
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const pools = [
    { name: "DAI/WETH", address: SEPOLIA_POOLS.DAI_WETH },
    { name: "FOGG/WETH", address: SEPOLIA_POOLS.FOGG_WETH }
  ];

  for (const pool of pools) {
    console.log(`\n🔍 Checking ${pool.name} pool (${pool.address})`);
    
    try {
      const poolContract = new ethers.Contract(pool.address, PAIR_ABI, ethers.provider);
      
      const token0 = await poolContract.token0();
      const token1 = await poolContract.token1();
      const reserves = await poolContract.getReserves();
      
      console.log(`  ✅ Pool exists`);
      console.log(`  🪙 Token0: ${token0}`);
      console.log(`  🪙 Token1: ${token1}`);
      console.log(`  💧 Reserve0: ${ethers.utils.formatEther(reserves[0])}`);
      console.log(`  💧 Reserve1: ${ethers.utils.formatEther(reserves[1])}`);
      
      if (reserves[0].eq(0) && reserves[1].eq(0)) {
        console.log(`  ⚠️ No liquidity in pool`);
      } else {
        console.log(`  ✅ Pool has liquidity`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 