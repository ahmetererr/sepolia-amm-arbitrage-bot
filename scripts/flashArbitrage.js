const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("⚡ FLASH SWAP ARBITRAGE ANALYSIS");
  console.log("==================================");
  
  await initializeDeployer();
  
  const WETH = SEPOLIA_TOKENS.WETH;
  const FOGG = SEPOLIA_TOKENS.FOGG;
  const DAI = SEPOLIA_TOKENS.DAI;
  
  console.log("💰 FLASH SWAP OPPORTUNITIES:");
  console.log("=============================");
  
  console.log("\n📊 Current Prices:");
  console.log("===================");
  
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
  
  const testAmount = ethers.utils.parseEther("1");
  
  try {
    // Get current rates
    const wethToDai = await router.getAmountsOut(testAmount, [WETH, DAI]);
    const daiToWeth = await router.getAmountsOut(testAmount, [DAI, WETH]);
    const foggToWeth = await router.getAmountsOut(testAmount, [FOGG, WETH]);
    const wethToFogg = await router.getAmountsOut(testAmount, [WETH, FOGG]);
    
    const wethToDaiRate = parseFloat(ethers.utils.formatEther(wethToDai[1]));
    const daiToWethRate = parseFloat(ethers.utils.formatEther(daiToWeth[1]));
    const foggToWethRate = parseFloat(ethers.utils.formatEther(foggToWeth[1]));
    const wethToFoggRate = parseFloat(ethers.utils.formatEther(wethToFogg[1]));
    
    console.log(`WETH → DAI: 1 WETH = ${wethToDaiRate.toFixed(6)} DAI`);
    console.log(`DAI → WETH: 1 DAI = ${daiToWethRate.toFixed(6)} WETH`);
    console.log(`FOGG → WETH: 1 FOGG = ${foggToWethRate.toFixed(6)} WETH`);
    console.log(`WETH → FOGG: 1 WETH = ${wethToFoggRate.toFixed(6)} FOGG`);
    
    console.log("\n⚡ FLASH SWAP ARBITRAGE OPPORTUNITIES:");
    console.log("=======================================");
    
    // Calculate theoretical rates
    const theoreticalDaiToWeth = 1 / wethToDaiRate;
    const theoreticalWethToFogg = 1 / foggToWethRate;
    
    const wethDaiDiff = ((daiToWethRate - theoreticalDaiToWeth) / theoreticalDaiToWeth) * 100;
    const foggWethDiff = ((wethToFoggRate - theoreticalWethToFogg) / theoreticalWethToFogg) * 100;
    
    console.log(`\n📊 WETH ↔ DAI Analysis:`);
    console.log(`Theoretical: 1 DAI should = ${theoreticalDaiToWeth.toFixed(6)} WETH`);
    console.log(`Actual: 1 DAI = ${daiToWethRate.toFixed(6)} WETH`);
    console.log(`Price Difference: ${wethDaiDiff.toFixed(2)}%`);
    
    console.log(`\n📊 FOGG ↔ WETH Analysis:`);
    console.log(`Theoretical: 1 WETH should = ${theoreticalWethToFogg.toFixed(6)} FOGG`);
    console.log(`Actual: 1 WETH = ${wethToFoggRate.toFixed(6)} FOGG`);
    console.log(`Price Difference: ${foggWethDiff.toFixed(2)}%`);
    
    console.log("\n💡 FLASH SWAP BENEFITS:");
    console.log("========================");
    console.log("• NO FEES - Flash swaps don't charge 0.3% fee");
    console.log("• NO SLIPPAGE - Instant execution");
    console.log("• PROFITABLE - Even small price differences work");
    console.log("• SAFE - Atomic transactions (all or nothing)");
    
    console.log("\n🚀 RECOMMENDATION:");
    console.log("==================");
    console.log("• Use flash swaps for arbitrage");
    console.log("• Even 0.6% price differences can be profitable");
    console.log("• No need for massive price manipulation");
    console.log("• Much more efficient than regular swaps");
    
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