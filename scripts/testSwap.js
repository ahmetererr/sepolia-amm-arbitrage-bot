const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🧪 Testing Basic Swap on Sepolia");
  console.log("==================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  // Uniswap V2 Router ABI (simplified)
  const ROUTER_ABI = [
    {
      "inputs": [
        {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
        {"internalType": "address[]", "name": "path", "type": "address[]"}
      ],
      "name": "getAmountsOut",
      "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
  
  console.log(`🔗 Router Address: ${routerAddress}`);
  console.log(`🪙 WETH: ${WETH}`);
  console.log(`🪙 FOGG: ${FOGG}`);
  console.log(`🪙 DAI: ${DAI}`);
  console.log("");
  
  try {
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, ethers.provider);
    
    // Test 1: WETH to FOGG
    console.log("🔄 Test 1: WETH → FOGG");
    const amountIn = ethers.utils.parseEther("0.1"); // 0.1 WETH
    const path1 = [WETH, FOGG];
    
    try {
      const amounts1 = await router.getAmountsOut(amountIn, path1);
      console.log(`  ✅ Success!`);
      console.log(`  💰 Input: ${ethers.utils.formatEther(amountIn)} WETH`);
      console.log(`  📤 Output: ${ethers.utils.formatEther(amounts1[1])} FOGG`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
    
    // Test 2: FOGG to WETH
    console.log("🔄 Test 2: FOGG → WETH");
    const path2 = [FOGG, WETH];
    
    try {
      const amounts2 = await router.getAmountsOut(amountIn, path2);
      console.log(`  ✅ Success!`);
      console.log(`  💰 Input: ${ethers.utils.formatEther(amountIn)} FOGG`);
      console.log(`  📤 Output: ${ethers.utils.formatEther(amounts2[1])} WETH`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
    
    // Test 3: WETH to DAI
    console.log("🔄 Test 3: WETH → DAI");
    const path3 = [WETH, DAI];
    
    try {
      const amounts3 = await router.getAmountsOut(amountIn, path3);
      console.log(`  ✅ Success!`);
      console.log(`  💰 Input: ${ethers.utils.formatEther(amountIn)} WETH`);
      console.log(`  📤 Output: ${ethers.utils.formatEther(amounts3[1])} DAI`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
    
    // Test 4: DAI to WETH
    console.log("🔄 Test 4: DAI → WETH");
    const path4 = [DAI, WETH];
    
    try {
      const amounts4 = await router.getAmountsOut(amountIn, path4);
      console.log(`  ✅ Success!`);
      console.log(`  💰 Input: ${ethers.utils.formatEther(amountIn)} DAI`);
      console.log(`  📤 Output: ${ethers.utils.formatEther(amounts4[1])} WETH`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Router Error: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 