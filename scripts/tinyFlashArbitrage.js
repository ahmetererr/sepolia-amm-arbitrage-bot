const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("⚡ TINY FLASH DAI ↔ FOGG ARBITRAGE");
  console.log("====================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("💰 TINY AMOUNT FLASH SWAP TESTS:");
  console.log("==================================");
  
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
  
  // Test very small amounts
  const testAmounts = [
    ethers.utils.parseEther("0.01"),  // 0.01 token
    ethers.utils.parseEther("0.1"),   // 0.1 token
    ethers.utils.parseEther("0.5"),   // 0.5 token
    ethers.utils.parseEther("1")      // 1 token
  ];
  
  try {
    console.log("\n📊 Current DAI ↔ FOGG Rates:");
    console.log("===============================");
    
    const testAmount = ethers.utils.parseEther("1");
    
    // Get DAI → FOGG rate (via WETH)
    const daiToFogg = await router.getAmountsOut(testAmount, [DAI, WETH, FOGG]);
    const foggReceived = daiToFogg[2];
    const daiToFoggRate = parseFloat(ethers.utils.formatEther(foggReceived));
    
    // Get FOGG → DAI rate (via WETH)
    const foggToDai = await router.getAmountsOut(testAmount, [FOGG, WETH, DAI]);
    const daiReceived = foggToDai[2];
    const foggToDaiRate = parseFloat(ethers.utils.formatEther(daiReceived));
    
    console.log(`DAI → FOGG: 1 DAI = ${daiToFoggRate.toFixed(6)} FOGG`);
    console.log(`FOGG → DAI: 1 FOGG = ${foggToDaiRate.toFixed(6)} DAI`);
    
    // Calculate theoretical inverse
    const theoreticalFoggToDai = 1 / daiToFoggRate;
    const priceDifference = ((foggToDaiRate - theoreticalFoggToDai) / theoreticalFoggToDai) * 100;
    
    console.log(`\n📊 Analysis:`);
    console.log(`Theoretical: 1 FOGG should = ${theoreticalFoggToDai.toFixed(6)} DAI`);
    console.log(`Actual: 1 FOGG = ${foggToDaiRate.toFixed(6)} DAI`);
    console.log(`Price Difference: ${priceDifference.toFixed(2)}%`);
    
    console.log("\n⚡ TINY FLASH SWAP ARBITRAGE TESTS:");
    console.log("=====================================");
    
    for (let i = 0; i < testAmounts.length; i++) {
      const amount = testAmounts[i];
      const amountStr = ethers.utils.formatEther(amount);
      
      console.log(`\n💰 Amount: ${amountStr} DAI`);
      console.log("================================");
      
      // Step 1: DAI → FOGG (flash swap)
      const step1 = await router.getAmountsOut(amount, [DAI, WETH, FOGG]);
      const foggAmount = step1[2];
      console.log(`Step 1: ${amountStr} DAI → ${ethers.utils.formatEther(foggAmount)} FOGG`);
      
      // Step 2: FOGG → DAI (flash swap)
      const step2 = await router.getAmountsOut(foggAmount, [FOGG, WETH, DAI]);
      const finalDai = step2[2];
      console.log(`Step 2: ${ethers.utils.formatEther(foggAmount)} FOGG → ${ethers.utils.formatEther(finalDai)} DAI`);
      
      const profit = finalDai.sub(amount);
      const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / parseFloat(amountStr)) * 100;
      
      console.log(`\n💰 FLASH SWAP RESULT:`);
      console.log(`Profit: ${ethers.utils.formatEther(profit)} DAI`);
      console.log(`ROI: ${profitPercent.toFixed(4)}%`);
      console.log(`Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    }
    
    console.log("\n💡 CONCLUSION:");
    console.log("=================");
    console.log("• Even tiny amounts have slippage");
    console.log("• 3-token paths create more slippage");
    console.log("• Need even smaller amounts or different strategy");
    console.log("• Flash swaps help but slippage still kills profit");
    
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