const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 THREE TOKEN ARBITRAGE ANALYSIS");
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
  
  console.log("💰 THREE TOKEN ARBITRAGE OPPORTUNITIES:");
  console.log("=======================================");
  
  const testAmount = ethers.utils.parseEther("100"); // 100 tokens
  
  try {
    console.log("\n🔄 Test 1: DAI → WETH → FOGG");
    console.log("================================");
    
    // DAI → WETH → FOGG
    const daiToFogg = await router.getAmountsOut(testAmount, [DAI, WETH, FOGG]);
    const foggReceived = daiToFogg[2];
    console.log(`100 DAI → ${ethers.utils.formatEther(daiToFogg[1])} WETH → ${ethers.utils.formatEther(foggReceived)} FOGG`);
    
    console.log("\n🔄 Test 2: FOGG → WETH → DAI");
    console.log("================================");
    
    // FOGG → WETH → DAI
    const foggToDai = await router.getAmountsOut(testAmount, [FOGG, WETH, DAI]);
    const daiReceived = foggToDai[2];
    console.log(`100 FOGG → ${ethers.utils.formatEther(foggToDai[1])} WETH → ${ethers.utils.formatEther(daiReceived)} DAI`);
    
    console.log("\n💰 ARBITRAGE OPPORTUNITIES:");
    console.log("=============================");
    
    // Calculate arbitrage opportunities
    const daiToFoggRate = parseFloat(ethers.utils.formatEther(foggReceived)) / 100;
    const foggToDaiRate = parseFloat(ethers.utils.formatEther(daiReceived)) / 100;
    
    console.log(`\n📊 DAI ↔ FOGG Analysis:`);
    console.log(`DAI → FOGG: 1 DAI = ${daiToFoggRate.toFixed(6)} FOGG`);
    console.log(`FOGG → DAI: 1 FOGG = ${foggToDaiRate.toFixed(6)} DAI`);
    
    // Calculate theoretical inverse
    const theoreticalFoggToDai = 1 / daiToFoggRate;
    const priceDifference = ((foggToDaiRate - theoreticalFoggToDai) / theoreticalFoggToDai) * 100;
    
    console.log(`Theoretical: 1 FOGG should = ${theoreticalFoggToDai.toFixed(6)} DAI`);
    console.log(`Price Difference: ${priceDifference.toFixed(2)}%`);
    
    // Test arbitrage profitability
    console.log(`\n🔄 ARBITRAGE TEST: DAI → FOGG → DAI`);
    
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
    
    // Test reverse arbitrage
    console.log(`\n🔄 ARBITRAGE TEST: FOGG → DAI → FOGG`);
    
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
    
    console.log("\n💡 CONCLUSION:");
    console.log("=================");
    console.log("• 3-token arbitrage uses WETH as intermediary");
    console.log("• This creates different price relationships");
    console.log("• May find opportunities that 2-token arbitrage misses");
    
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