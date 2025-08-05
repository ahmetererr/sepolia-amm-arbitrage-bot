const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("⚡ SMALL FLASH SWAP ARBITRAGE TEST");
  console.log("====================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("💰 SMALL AMOUNT FLASH SWAP TESTS:");
  console.log("===================================");
  
  // Get current prices
  const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
  const router = new ethers.Contract(routerAddress, [
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
  ], ethers.provider);
  
  // Test different small amounts
  const testAmounts = [
    ethers.utils.parseEther("0.1"),   // 0.1 token
    ethers.utils.parseEther("1"),     // 1 token
    ethers.utils.parseEther("10"),    // 10 tokens
    ethers.utils.parseEther("50")     // 50 tokens
  ];
  
  try {
    console.log("\n📊 WETH ↔ DAI Flash Arbitrage Tests:");
    console.log("======================================");
    
    for (let i = 0; i < testAmounts.length; i++) {
      const amount = testAmounts[i];
      const amountStr = ethers.utils.formatEther(amount);
      
      console.log(`\n💰 Amount: ${amountStr} DAI`);
      console.log("================================");
      
      // Step 1: DAI → WETH
      const step1 = await router.getAmountsOut(amount, [DAI, WETH]);
      const wethAmount = step1[1];
      console.log(`Step 1: ${amountStr} DAI → ${ethers.utils.formatEther(wethAmount)} WETH`);
      
      // Step 2: WETH → DAI
      const step2 = await router.getAmountsOut(wethAmount, [WETH, DAI]);
      const finalDai = step2[1];
      console.log(`Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(finalDai)} DAI`);
      
      const profit = finalDai.sub(amount);
      const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / parseFloat(amountStr)) * 100;
      
      console.log(`Profit: ${ethers.utils.formatEther(profit)} DAI (${profitPercent.toFixed(4)}%)`);
      console.log(`Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    }
    
    console.log("\n📊 FOGG ↔ WETH Flash Arbitrage Tests:");
    console.log("=======================================");
    
    for (let i = 0; i < testAmounts.length; i++) {
      const amount = testAmounts[i];
      const amountStr = ethers.utils.formatEther(amount);
      
      console.log(`\n💰 Amount: ${amountStr} FOGG`);
      console.log("================================");
      
      // Step 1: FOGG → WETH
      const step1 = await router.getAmountsOut(amount, [FOGG, WETH]);
      const wethAmount = step1[1];
      console.log(`Step 1: ${amountStr} FOGG → ${ethers.utils.formatEther(wethAmount)} WETH`);
      
      // Step 2: WETH → FOGG
      const step2 = await router.getAmountsOut(wethAmount, [WETH, FOGG]);
      const finalFogg = step2[1];
      console.log(`Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(finalFogg)} FOGG`);
      
      const profit = finalFogg.sub(amount);
      const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / parseFloat(amountStr)) * 100;
      
      console.log(`Profit: ${ethers.utils.formatEther(profit)} FOGG (${profitPercent.toFixed(4)}%)`);
      console.log(`Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    }
    
    console.log("\n💡 CONCLUSION:");
    console.log("=================");
    console.log("• Smaller amounts = less slippage");
    console.log("• Flash swaps = no fees");
    console.log("• Need to find optimal amount");
    console.log("• Price differences must be > slippage");
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 