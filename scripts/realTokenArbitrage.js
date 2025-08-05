const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 REAL TOKEN ARBITRAGE STRATEGY");
  console.log("==================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("💰 REAL TOKEN ARBITRAGE OPPORTUNITIES:");
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
    console.log("\n📊 Current Token Prices:");
    console.log("=========================");
    
    // Get current rates for 1 token
    const oneToken = ethers.utils.parseEther("1");
    
    // DAI → WETH rate
    const daiToWeth = await router.getAmountsOut(oneToken, [DAI, WETH]);
    const wethFromDai = daiToWeth[1];
    const daiToWethRate = parseFloat(ethers.utils.formatEther(wethFromDai));
    
    // WETH → DAI rate
    const wethToDai = await router.getAmountsOut(oneToken, [WETH, DAI]);
    const daiFromWeth = wethToDai[1];
    const wethToDaiRate = parseFloat(ethers.utils.formatEther(daiFromWeth));
    
    // WETH → FOGG rate
    const wethToFogg = await router.getAmountsOut(oneToken, [WETH, FOGG]);
    const foggFromWeth = wethToFogg[1];
    const wethToFoggRate = parseFloat(ethers.utils.formatEther(foggFromWeth));
    
    // FOGG → WETH rate
    const foggToWeth = await router.getAmountsOut(oneToken, [FOGG, WETH]);
    const wethFromFogg = foggToWeth[1];
    const foggToWethRate = parseFloat(ethers.utils.formatEther(wethFromFogg));
    
    console.log(`DAI → WETH: 1 DAI = ${daiToWethRate.toFixed(6)} WETH`);
    console.log(`WETH → DAI: 1 WETH = ${wethToDaiRate.toFixed(6)} DAI`);
    console.log(`WETH → FOGG: 1 WETH = ${wethToFoggRate.toFixed(6)} FOGG`);
    console.log(`FOGG → WETH: 1 FOGG = ${foggToWethRate.toFixed(6)} WETH`);
    
    console.log("\n🔄 ARBITRAGE STRATEGY 1: DAI → WETH → FOGG");
    console.log("==============================================");
    
    // Strategy: Start with DAI, buy WETH when DAI is overvalued, then buy FOGG
    const startDai = ethers.utils.parseEther("100"); // Start with 100 DAI
    
    // Step 1: DAI → WETH
    const step1 = await router.getAmountsOut(startDai, [DAI, WETH]);
    const wethAmount = step1[1];
    console.log(`Step 1: 100 DAI → ${ethers.utils.formatEther(wethAmount)} WETH`);
    
    // Step 2: WETH → FOGG
    const step2 = await router.getAmountsOut(wethAmount, [WETH, FOGG]);
    const foggAmount = step2[1];
    console.log(`Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(foggAmount)} FOGG`);
    
    // Calculate profit in DAI terms
    const foggToDai = await router.getAmountsOut(foggAmount, [FOGG, WETH, DAI]);
    const finalDai = foggToDai[2];
    const profit = finalDai.sub(startDai);
    const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / 100) * 100;
    
    console.log(`\n💰 RESULT:`);
    console.log(`Final DAI: ${ethers.utils.formatEther(finalDai)} DAI`);
    console.log(`Profit: ${ethers.utils.formatEther(profit)} DAI`);
    console.log(`ROI: ${profitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    console.log("\n🔄 ARBITRAGE STRATEGY 2: FOGG → WETH → DAI");
    console.log("==============================================");
    
    // Strategy: Start with FOGG, buy WETH when FOGG is overvalued, then buy DAI
    const startFogg = ethers.utils.parseEther("100"); // Start with 100 FOGG
    
    // Step 1: FOGG → WETH
    const foggStep1 = await router.getAmountsOut(startFogg, [FOGG, WETH]);
    const foggWethAmount = foggStep1[1];
    console.log(`Step 1: 100 FOGG → ${ethers.utils.formatEther(foggWethAmount)} WETH`);
    
    // Step 2: WETH → DAI
    const foggStep2 = await router.getAmountsOut(foggWethAmount, [WETH, DAI]);
    const foggFinalDai = foggStep2[1];
    console.log(`Step 2: ${ethers.utils.formatEther(foggWethAmount)} WETH → ${ethers.utils.formatEther(foggFinalDai)} DAI`);
    
    // Calculate profit in FOGG terms
    const daiToFogg = await router.getAmountsOut(foggFinalDai, [DAI, WETH, FOGG]);
    const foggFinalFogg = daiToFogg[2];
    const foggProfit = foggFinalFogg.sub(startFogg);
    const foggProfitPercent = (parseFloat(ethers.utils.formatEther(foggProfit)) / 100) * 100;
    
    console.log(`\n💰 RESULT:`);
    console.log(`Final FOGG: ${ethers.utils.formatEther(foggFinalFogg)} FOGG`);
    console.log(`Profit: ${ethers.utils.formatEther(foggProfit)} FOGG`);
    console.log(`ROI: ${foggProfitPercent.toFixed(4)}%`);
    console.log(`Profitable: ${foggProfit.gt(0) ? '✅ YES!' : '❌ NO'}`);
    
    console.log("\n💡 ARBITRAGE STRATEGY:");
    console.log("=======================");
    console.log("• Use our own tokens (no flash loans needed)");
    console.log("• Buy low in one pool, sell high in another");
    console.log("• Exploit price differences between pools");
    console.log("• Real arbitrage with our own capital");
    
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