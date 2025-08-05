const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 CONTINUOUS ARBITRAGE MONITORING");
  console.log("====================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("💰 CONTINUOUS ARBITRAGE SYSTEM:");
  console.log("=================================");
  
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
  
  let checkCount = 0;
  const minProfitPercent = 1.0; // Minimum %1 profit required
  
  async function checkArbitrageOpportunity() {
    checkCount++;
    console.log(`\n🔍 Check #${checkCount} - ${new Date().toLocaleTimeString()}`);
    console.log("================================================");
    
    try {
      // Get current rates
      const oneToken = ethers.utils.parseEther("1");
      const testAmount = ethers.utils.parseEther("100");
      
      // DAI ↔ WETH rates
      const daiToWeth = await router.getAmountsOut(oneToken, [DAI, WETH]);
      const wethToDai = await router.getAmountsOut(oneToken, [WETH, DAI]);
      const daiToWethRate = parseFloat(ethers.utils.formatEther(daiToWeth[1]));
      const wethToDaiRate = parseFloat(ethers.utils.formatEther(wethToDai[1]));
      
      // WETH ↔ FOGG rates
      const wethToFogg = await router.getAmountsOut(oneToken, [WETH, FOGG]);
      const foggToWeth = await router.getAmountsOut(oneToken, [FOGG, WETH]);
      const wethToFoggRate = parseFloat(ethers.utils.formatEther(wethToFogg[1]));
      const foggToWethRate = parseFloat(ethers.utils.formatEther(foggToWeth[1]));
      
      console.log(`📊 Current Rates:`);
      console.log(`DAI → WETH: 1 DAI = ${daiToWethRate.toFixed(6)} WETH`);
      console.log(`WETH → DAI: 1 WETH = ${wethToDaiRate.toFixed(6)} DAI`);
      console.log(`WETH → FOGG: 1 WETH = ${wethToFoggRate.toFixed(6)} FOGG`);
      console.log(`FOGG → WETH: 1 FOGG = ${foggToWethRate.toFixed(6)} WETH`);
      
      // Calculate price differences
      const theoreticalDaiToWeth = 1 / wethToDaiRate;
      const daiWethDiff = ((daiToWethRate - theoreticalDaiToWeth) / theoreticalDaiToWeth) * 100;
      
      const theoreticalWethToFogg = 1 / foggToWethRate;
      const wethFoggDiff = ((wethToFoggRate - theoreticalWethToFogg) / theoreticalWethToFogg) * 100;
      
      console.log(`\n📈 Price Differences:`);
      console.log(`DAI ↔ WETH: ${daiWethDiff.toFixed(2)}%`);
      console.log(`WETH ↔ FOGG: ${wethFoggDiff.toFixed(2)}%`);
      
      // Test arbitrage opportunities
      console.log(`\n🔄 Testing Arbitrage Opportunities:`);
      
      // Test 1: DAI → WETH → DAI
      const step1 = await router.getAmountsOut(testAmount, [DAI, WETH]);
      const step2 = await router.getAmountsOut(step1[1], [WETH, DAI]);
      const profit1 = step2[1].sub(testAmount);
      const profitPercent1 = (parseFloat(ethers.utils.formatEther(profit1)) / 100) * 100;
      
      console.log(`DAI → WETH → DAI: ${profitPercent1.toFixed(4)}%`);
      
      // Test 2: FOGG → WETH → FOGG
      const step3 = await router.getAmountsOut(testAmount, [FOGG, WETH]);
      const step4 = await router.getAmountsOut(step3[1], [WETH, FOGG]);
      const profit2 = step4[1].sub(testAmount);
      const profitPercent2 = (parseFloat(ethers.utils.formatEther(profit2)) / 100) * 100;
      
      console.log(`FOGG → WETH → FOGG: ${profitPercent2.toFixed(4)}%`);
      
      // Check for profitable opportunities
      if (profitPercent1 > minProfitPercent || profitPercent2 > minProfitPercent) {
        console.log(`\n🚨 PROFITABLE OPPORTUNITY FOUND!`);
        console.log(`====================================`);
        console.log(`DAI arbitrage: ${profitPercent1.toFixed(4)}%`);
        console.log(`FOGG arbitrage: ${profitPercent2.toFixed(4)}%`);
        console.log(`Execute arbitrage now!`);
        return true; // Found opportunity
      } else {
        console.log(`\n💤 No profitable opportunities (min ${minProfitPercent}% required)`);
        return false; // No opportunity
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return false;
    }
  }
  
  console.log("🔍 Starting continuous monitoring...");
  console.log("Press Ctrl+C to stop");
  console.log("=====================================");
  
  // Start monitoring
  const interval = setInterval(async () => {
    const foundOpportunity = await checkArbitrageOpportunity();
    
    if (foundOpportunity) {
      console.log(`\n🎯 OPPORTUNITY DETECTED! Consider executing arbitrage.`);
      // Here you would add the actual arbitrage execution logic
    }
  }, 5000); // Check every 5 seconds
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping continuous monitoring...');
    clearInterval(interval);
    process.exit(0);
  });
}

main()
  .then(() => {
    // Keep the process running
    console.log("Monitoring started...");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 