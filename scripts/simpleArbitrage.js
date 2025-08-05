const { ethers } = require("hardhat");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS, TEST_AMOUNTS } = require("../data/tokens.js");
const { checkArbitrageOpportunity } = require("../utils/swapsUtilities");

async function main() {
  console.log("🧪 Simple Arbitrage Test for Sepolia");
  console.log("=====================================");
  
  const TYPE = "sepolia";
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log(`Token Addresses:`);
  console.log(`  WETH: ${WETH}`);
  console.log(`  FOGG: ${FOGG}`);
  console.log(`  DAI: ${DAI}`);
  console.log(`Pool Addresses:`);
  console.log(`  DAI/WETH: ${SEPOLIA_POOLS.DAI_WETH}`);
  console.log(`  FOGG/WETH: ${SEPOLIA_POOLS.FOGG_WETH}`);
  console.log("");

  try {
    // Test 1: WETH -> FOGG -> WETH (2-token path)
    console.log("🔄 Test 1: WETH → FOGG → WETH");
    const path1 = [WETH, FOGG, WETH];
    const result1 = await checkArbitrageOpportunity(TEST_AMOUNTS.SMALL, path1, TYPE);
    console.log(`Result: ${result1.profitable ? "✅ Profitable" : "❌ Not profitable"}`);
    if (result1.profitable) {
      console.log(`Profit: ${ethers.utils.formatEther(result1.profit)} ETH`);
    }
    console.log("");

    // Test 2: WETH -> DAI -> WETH (2-token path)
    console.log("🔄 Test 2: WETH → DAI → WETH");
    const path2 = [WETH, DAI, WETH];
    const result2 = await checkArbitrageOpportunity(TEST_AMOUNTS.SMALL, path2, TYPE);
    console.log(`Result: ${result2.profitable ? "✅ Profitable" : "❌ Not profitable"}`);
    if (result2.profitable) {
      console.log(`Profit: ${ethers.utils.formatEther(result2.profit)} ETH`);
    }
    console.log("");

    // Test 3: FOGG -> WETH -> FOGG (2-token path)
    console.log("🔄 Test 3: FOGG → WETH → FOGG");
    const path3 = [FOGG, WETH, FOGG];
    const result3 = await checkArbitrageOpportunity(TEST_AMOUNTS.SMALL, path3, TYPE);
    console.log(`Result: ${result3.profitable ? "✅ Profitable" : "❌ Not profitable"}`);
    if (result3.profitable) {
      console.log(`Profit: ${ethers.utils.formatEther(result3.profit)} ETH`);
    }
    console.log("");

    // Test 4: DAI -> WETH -> DAI (2-token path)
    console.log("🔄 Test 4: DAI → WETH → DAI");
    const path4 = [DAI, WETH, DAI];
    const result4 = await checkArbitrageOpportunity(TEST_AMOUNTS.SMALL, path4, TYPE);
    console.log(`Result: ${result4.profitable ? "✅ Profitable" : "❌ Not profitable"}`);
    if (result4.profitable) {
      console.log(`Profit: ${ethers.utils.formatEther(result4.profit)} ETH`);
    }
    console.log("");

    // Summary
    console.log("📊 Summary:");
    const results = [result1, result2, result3, result4];
    const profitableCount = results.filter(r => r.profitable).length;
    console.log(`Profitable opportunities: ${profitableCount}/${results.length}`);
    
    if (profitableCount > 0) {
      console.log("🎯 Arbitrage opportunities found!");
    } else {
      console.log("😔 No arbitrage opportunities found at the moment.");
      console.log("💡 This is normal - arbitrage opportunities are rare and require price differences.");
      console.log("💡 You can create opportunities by adjusting pool prices manually.");
    }

  } catch (error) {
    console.error("❌ Error during testing:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
