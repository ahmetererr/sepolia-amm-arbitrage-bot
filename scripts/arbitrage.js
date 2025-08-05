const { BN } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS, arbitragePaths, TEST_AMOUNTS } = require("../data/tokens.js");
const { checkArbitrageOpportunity } = require("../utils/swapsUtilities");

async function main() {
  const TYPE = "sepolia";
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("🚀 Starting Sepolia Arbitrage Bot");
  console.log("📊 Monitoring pools for arbitrage opportunities...");
  console.log("");

  try {
    // Test different arbitrage paths
    for (let i = 0; i < arbitragePaths.length; i++) {
      const path = arbitragePaths[i];
      console.log(`🔄 Testing Path ${i + 1}: ${path.map(token => {
        if (token === WETH) return "WETH";
        if (token === FOGG) return "FOGG";
        if (token === DAI) return "DAI";
        return token;
      }).join(" → ")}`);
      
      // Test with different amounts
      const testAmounts = [TEST_AMOUNTS.SMALL, TEST_AMOUNTS.MEDIUM];
      
      for (let j = 0; j < testAmounts.length; j++) {
        const amount = testAmounts[j];
        console.log(`  💰 Testing with ${ethers.utils.formatEther(amount)} ETH`);
        
        const result = await checkArbitrageOpportunity(amount, path, TYPE);
        
        if (result.profitable) {
          console.log(`  ✅ PROFITABLE! Profit: ${ethers.utils.formatEther(result.profit)} ETH`);
          console.log(`  📈 ROI: ${((parseFloat(ethers.utils.formatEther(result.profit)) / parseFloat(ethers.utils.formatEther(amount))) * 100).toFixed(2)}%`);
        } else {
          console.log(`  ❌ Not profitable`);
        }
        console.log("");
      }
    }
    
    // Continuous monitoring
    console.log("🔍 Starting continuous monitoring...");
    console.log("Press Ctrl+C to stop");
    
    // Monitor for opportunities every 30 seconds
    setInterval(async () => {
      console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Checking for opportunities...`);
      
      for (let i = 0; i < arbitragePaths.length; i++) {
        const path = arbitragePaths[i];
        const result = await checkArbitrageOpportunity(TEST_AMOUNTS.SMALL, path, TYPE);
        
        if (result.profitable) {
          console.log(`🎯 OPPORTUNITY FOUND!`);
          console.log(`Path: ${path.map(token => {
            if (token === WETH) return "WETH";
            if (token === FOGG) return "FOGG";
            if (token === DAI) return "DAI";
            return token;
          }).join(" → ")}`);
          console.log(`Profit: ${ethers.utils.formatEther(result.profit)} ETH`);
          console.log(`ROI: ${((parseFloat(ethers.utils.formatEther(result.profit)) / parseFloat(ethers.utils.formatEther(TEST_AMOUNTS.SMALL))) * 100).toFixed(2)}%`);
        }
      }
    }, 30000); // 30 seconds
    
  } catch (error) {
    console.log("❌ Something went wrong: ", error.reason || error.message);
    console.log("⏳ Waiting for network...");
    setTimeout(() => {
      main();
    }, 5000);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping arbitrage bot...');
  process.exit(0);
});

main();
