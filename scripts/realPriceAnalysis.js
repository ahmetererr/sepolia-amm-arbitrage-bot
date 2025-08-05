const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 REAL PRICE DIFFERENCE ANALYSIS");
  console.log("===================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  // Uniswap V2 Router ABI
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
  const router = new ethers.Contract(routerAddress, ROUTER_ABI, ethers.provider);
  
  console.log("💰 REAL PRICE DIFFERENCES:");
  console.log("===========================");
  
  const testAmount = ethers.utils.parseEther("1"); // 1 token
  
  try {
    console.log("\n🔄 WETH ↔ DAI Analysis:");
    console.log("=========================");
    
    // Get current rates
    const wethToDai = await router.getAmountsOut(testAmount, [WETH, DAI]);
    const daiToWeth = await router.getAmountsOut(testAmount, [DAI, WETH]);
    
    const wethToDaiRate = parseFloat(ethers.utils.formatEther(wethToDai[1]));
    const daiToWethRate = parseFloat(ethers.utils.formatEther(daiToWeth[1]));
    
    console.log(`WETH → DAI: 1 WETH = ${wethToDaiRate} DAI`);
    console.log(`DAI → WETH: 1 DAI = ${daiToWethRate} WETH`);
    
    // Calculate REAL price difference
    const theoreticalDaiToWeth = 1 / wethToDaiRate;
    const realPriceDifference = ((daiToWethRate - theoreticalDaiToWeth) / theoreticalDaiToWeth) * 100;
    
    console.log(`\n📊 REAL ANALYSIS:`);
    console.log(`Theoretical: 1 DAI should = ${theoreticalDaiToWeth.toFixed(6)} WETH`);
    console.log(`Actual: 1 DAI = ${daiToWethRate.toFixed(6)} WETH`);
    console.log(`Price Difference: ${realPriceDifference.toFixed(2)}%`);
    
    // Calculate the REAL percentage difference
    const percentageDiff = ((daiToWethRate - theoreticalDaiToWeth) / theoreticalDaiToWeth) * 100;
    console.log(`\n🚨 REAL PRICE DIFFERENCE: ${percentageDiff.toFixed(2)}%`);
    
    // Test arbitrage with REAL calculation
    console.log(`\n🔄 ARBITRAGE TEST:`);
    const arbitrageAmount = ethers.utils.parseEther("100"); // 100 DAI
    
    // Step 1: DAI → WETH
    const step1 = await router.getAmountsOut(arbitrageAmount, [DAI, WETH]);
    const wethAmount = step1[1];
    console.log(`Step 1: 100 DAI → ${ethers.utils.formatEther(wethAmount)} WETH`);
    
    // Step 2: WETH → DAI
    const step2 = await router.getAmountsOut(wethAmount, [WETH, DAI]);
    const finalDai = step2[1];
    console.log(`Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(finalDai)} DAI`);
    
    const profit = finalDai.sub(arbitrageAmount);
    const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / 100) * 100;
    
    console.log(`\n💰 RESULT:`);
    console.log(`Profit: ${ethers.utils.formatEther(profit)} DAI`);
    console.log(`ROI: ${profitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    console.log("\n🔄 FOGG ↔ WETH Analysis:");
    console.log("==========================");
    
    // Get current rates
    const foggToWeth = await router.getAmountsOut(testAmount, [FOGG, WETH]);
    const wethToFogg = await router.getAmountsOut(testAmount, [WETH, FOGG]);
    
    const foggToWethRate = parseFloat(ethers.utils.formatEther(foggToWeth[1]));
    const wethToFoggRate = parseFloat(ethers.utils.formatEther(wethToFogg[1]));
    
    console.log(`FOGG → WETH: 1 FOGG = ${foggToWethRate} WETH`);
    console.log(`WETH → FOGG: 1 WETH = ${wethToFoggRate} FOGG`);
    
    // Calculate REAL price difference
    const theoreticalWethToFogg = 1 / foggToWethRate;
    const realFoggPriceDifference = ((wethToFoggRate - theoreticalWethToFogg) / theoreticalWethToFogg) * 100;
    
    console.log(`\n📊 REAL ANALYSIS:`);
    console.log(`Theoretical: 1 WETH should = ${theoreticalWethToFogg.toFixed(6)} FOGG`);
    console.log(`Actual: 1 WETH = ${wethToFoggRate.toFixed(6)} FOGG`);
    console.log(`Price Difference: ${realFoggPriceDifference.toFixed(2)}%`);
    
    // Calculate the REAL percentage difference
    const foggPercentageDiff = ((wethToFoggRate - theoreticalWethToFogg) / theoreticalWethToFogg) * 100;
    console.log(`\n🚨 REAL PRICE DIFFERENCE: ${foggPercentageDiff.toFixed(2)}%`);
    
    // Test arbitrage with REAL calculation
    console.log(`\n🔄 ARBITRAGE TEST:`);
    const foggArbitrageAmount = ethers.utils.parseEther("100"); // 100 FOGG
    
    // Step 1: FOGG → WETH
    const foggStep1 = await router.getAmountsOut(foggArbitrageAmount, [FOGG, WETH]);
    const foggWethAmount = foggStep1[1];
    console.log(`Step 1: 100 FOGG → ${ethers.utils.formatEther(foggWethAmount)} WETH`);
    
    // Step 2: WETH → FOGG
    const foggStep2 = await router.getAmountsOut(foggWethAmount, [WETH, FOGG]);
    const finalFogg = foggStep2[1];
    console.log(`Step 2: ${ethers.utils.formatEther(foggWethAmount)} WETH → ${ethers.utils.formatEther(finalFogg)} FOGG`);
    
    const foggProfit = finalFogg.sub(foggArbitrageAmount);
    const foggProfitPercent = (parseFloat(ethers.utils.formatEther(foggProfit)) / 100) * 100;
    
    console.log(`\n💰 RESULT:`);
    console.log(`Profit: ${ethers.utils.formatEther(foggProfit)} FOGG`);
    console.log(`ROI: ${foggProfitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${foggProfit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    console.log("\n💡 EXPLANATION:");
    console.log("==================");
    console.log("• The price differences are REAL but small");
    console.log("• Uniswap V2 fees (0.3% per swap) eat the profit");
    console.log("• Slippage on large trades reduces profit further");
    console.log("• Need >5% price differences for profitable arbitrage");
    
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