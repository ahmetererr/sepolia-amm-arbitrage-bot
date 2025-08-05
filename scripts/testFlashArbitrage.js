const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("⚡ FLASH SWAP ARBITRAGE TEST");
  console.log("==============================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("💰 FLASH SWAP ARBITRAGE SIMULATION:");
  console.log("=====================================");
  
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
  
  const testAmount = ethers.utils.parseEther("100"); // 100 tokens
  
  try {
    console.log("\n📊 Current Prices:");
    console.log("===================");
    
    // Get current rates
    const wethToDai = await router.getAmountsOut(testAmount, [WETH, DAI]);
    const daiToWeth = await router.getAmountsOut(testAmount, [DAI, WETH]);
    const foggToWeth = await router.getAmountsOut(testAmount, [FOGG, WETH]);
    const wethToFogg = await router.getAmountsOut(testAmount, [WETH, FOGG]);
    
    const wethToDaiRate = parseFloat(ethers.utils.formatEther(wethToDai[1])) / 100;
    const daiToWethRate = parseFloat(ethers.utils.formatEther(daiToWeth[1])) / 100;
    const foggToWethRate = parseFloat(ethers.utils.formatEther(foggToWeth[1])) / 100;
    const wethToFoggRate = parseFloat(ethers.utils.formatEther(wethToFogg[1])) / 100;
    
    console.log(`WETH → DAI: 1 WETH = ${wethToDaiRate.toFixed(6)} DAI`);
    console.log(`DAI → WETH: 1 DAI = ${daiToWethRate.toFixed(6)} WETH`);
    console.log(`FOGG → WETH: 1 FOGG = ${foggToWethRate.toFixed(6)} WETH`);
    console.log(`WETH → FOGG: 1 WETH = ${wethToFoggRate.toFixed(6)} FOGG`);
    
    console.log("\n⚡ FLASH SWAP ARBITRAGE TESTS:");
    console.log("=================================");
    
    // Test 1: WETH ↔ DAI Flash Arbitrage
    console.log("\n🔄 Test 1: WETH ↔ DAI Flash Arbitrage");
    console.log("========================================");
    
    const theoreticalDaiToWeth = 1 / wethToDaiRate;
    const wethDaiDiff = ((daiToWethRate - theoreticalDaiToWeth) / theoreticalDaiToWeth) * 100;
    
    console.log(`Price Difference: ${wethDaiDiff.toFixed(2)}%`);
    
    // Simulate flash swap (no fees, no slippage)
    const flashSwapAmount = ethers.utils.parseEther("100"); // 100 DAI
    
    // Step 1: DAI → WETH (flash swap)
    const step1 = await router.getAmountsOut(flashSwapAmount, [DAI, WETH]);
    const wethAmount = step1[1];
    console.log(`Step 1: 100 DAI → ${ethers.utils.formatEther(wethAmount)} WETH`);
    
    // Step 2: WETH → DAI (flash swap)
    const step2 = await router.getAmountsOut(wethAmount, [WETH, DAI]);
    const finalDai = step2[1];
    console.log(`Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(finalDai)} DAI`);
    
    const profit = finalDai.sub(flashSwapAmount);
    const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / 100) * 100;
    
    console.log(`\n💰 FLASH SWAP RESULT:`);
    console.log(`Profit: ${ethers.utils.formatEther(profit)} DAI`);
    console.log(`ROI: ${profitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    // Test 2: FOGG ↔ WETH Flash Arbitrage
    console.log("\n🔄 Test 2: FOGG ↔ WETH Flash Arbitrage");
    console.log("=========================================");
    
    const theoreticalWethToFogg = 1 / foggToWethRate;
    const foggWethDiff = ((wethToFoggRate - theoreticalWethToFogg) / theoreticalWethToFogg) * 100;
    
    console.log(`Price Difference: ${foggWethDiff.toFixed(2)}%`);
    
    // Simulate flash swap
    const flashSwapFoggAmount = ethers.utils.parseEther("100"); // 100 FOGG
    
    // Step 1: FOGG → WETH (flash swap)
    const foggStep1 = await router.getAmountsOut(flashSwapFoggAmount, [FOGG, WETH]);
    const foggWethAmount = foggStep1[1];
    console.log(`Step 1: 100 FOGG → ${ethers.utils.formatEther(foggWethAmount)} WETH`);
    
    // Step 2: WETH → FOGG (flash swap)
    const foggStep2 = await router.getAmountsOut(foggWethAmount, [WETH, FOGG]);
    const finalFogg = foggStep2[1];
    console.log(`Step 2: ${ethers.utils.formatEther(foggWethAmount)} WETH → ${ethers.utils.formatEther(finalFogg)} FOGG`);
    
    const foggProfit = finalFogg.sub(flashSwapFoggAmount);
    const foggProfitPercent = (parseFloat(ethers.utils.formatEther(foggProfit)) / 100) * 100;
    
    console.log(`\n💰 FLASH SWAP RESULT:`);
    console.log(`Profit: ${ethers.utils.formatEther(foggProfit)} FOGG`);
    console.log(`ROI: ${foggProfitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${foggProfit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    console.log("\n💡 FLASH SWAP vs NORMAL SWAP:");
    console.log("================================");
    console.log("• Flash Swap: NO FEES, NO SLIPPAGE");
    console.log("• Normal Swap: 0.3% fee per swap + slippage");
    console.log("• Flash Swap: Even small differences profitable");
    console.log("• Normal Swap: Need >1% differences");
    
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