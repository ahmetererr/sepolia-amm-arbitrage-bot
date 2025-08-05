const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 DIRECT DAI ↔ FOGG ARBITRAGE");
  console.log("==================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("💰 DAI ↔ FOGG ARBITRAGE OPPORTUNITIES:");
  console.log("=======================================");
  
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
    console.log("\n📊 Current DAI ↔ FOGG Rates:");
    console.log("===============================");
    
    // Get DAI → FOGG rate (via WETH)
    const daiToFogg = await router.getAmountsOut(testAmount, [DAI, WETH, FOGG]);
    const foggReceived = daiToFogg[2];
    const daiToFoggRate = parseFloat(ethers.utils.formatEther(foggReceived)) / 100;
    
    // Get FOGG → DAI rate (via WETH)
    const foggToDai = await router.getAmountsOut(testAmount, [FOGG, WETH, DAI]);
    const daiReceived = foggToDai[2];
    const foggToDaiRate = parseFloat(ethers.utils.formatEther(daiReceived)) / 100;
    
    console.log(`DAI → FOGG: 1 DAI = ${daiToFoggRate.toFixed(6)} FOGG`);
    console.log(`FOGG → DAI: 1 FOGG = ${foggToDaiRate.toFixed(6)} DAI`);
    
    // Calculate theoretical inverse
    const theoreticalFoggToDai = 1 / daiToFoggRate;
    const priceDifference = ((foggToDaiRate - theoreticalFoggToDai) / theoreticalFoggToDai) * 100;
    
    console.log(`\n📊 Analysis:`);
    console.log(`Theoretical: 1 FOGG should = ${theoreticalFoggToDai.toFixed(6)} DAI`);
    console.log(`Actual: 1 FOGG = ${foggToDaiRate.toFixed(6)} DAI`);
    console.log(`Price Difference: ${priceDifference.toFixed(2)}%`);
    
    console.log("\n🔄 ARBITRAGE TESTS:");
    console.log("====================");
    
    // Test 1: DAI → FOGG → DAI
    console.log("\n🔄 Test 1: DAI → FOGG → DAI");
    console.log("==============================");
    
    // Step 1: DAI → FOGG
    const step1 = await router.getAmountsOut(testAmount, [DAI, WETH, FOGG]);
    const foggAmount = step1[2];
    console.log(`Step 1: 100 DAI → ${ethers.utils.formatEther(foggAmount)} FOGG`);
    
    // Step 2: FOGG → DAI
    const step2 = await router.getAmountsOut(foggAmount, [FOGG, WETH, DAI]);
    const finalDai = step2[2];
    console.log(`Step 2: ${ethers.utils.formatEther(foggAmount)} FOGG → ${ethers.utils.formatEther(finalDai)} DAI`);
    
    const profit = finalDai.sub(testAmount);
    const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / 100) * 100;
    
    console.log(`\n💰 RESULT:`);
    console.log(`Profit: ${ethers.utils.formatEther(profit)} DAI`);
    console.log(`ROI: ${profitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    // Test 2: FOGG → DAI → FOGG
    console.log("\n🔄 Test 2: FOGG → DAI → FOGG");
    console.log("==============================");
    
    // Step 1: FOGG → DAI
    const revStep1 = await router.getAmountsOut(testAmount, [FOGG, WETH, DAI]);
    const daiAmount = revStep1[2];
    console.log(`Step 1: 100 FOGG → ${ethers.utils.formatEther(daiAmount)} DAI`);
    
    // Step 2: DAI → FOGG
    const revStep2 = await router.getAmountsOut(daiAmount, [DAI, WETH, FOGG]);
    const finalFogg = revStep2[2];
    console.log(`Step 2: ${ethers.utils.formatEther(daiAmount)} DAI → ${ethers.utils.formatEther(finalFogg)} FOGG`);
    
    const revProfit = finalFogg.sub(testAmount);
    const revProfitPercent = (parseFloat(ethers.utils.formatEther(revProfit)) / 100) * 100;
    
    console.log(`\n💰 RESULT:`);
    console.log(`Profit: ${ethers.utils.formatEther(revProfit)} FOGG`);
    console.log(`ROI: ${revProfitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${revProfit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    console.log("\n💡 WHY THIS WORKS:");
    console.log("===================");
    console.log("• DAI and FOGG are in SEPARATE pools");
    console.log("• WETH/DAI pool ≠ WETH/FOGG pool");
    console.log("• Different pool dynamics create opportunities");
    console.log("• 3-token paths can find price differences");
    
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