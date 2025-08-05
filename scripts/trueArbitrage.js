const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 TRUE ARBITRAGE ANALYSIS");
  console.log("===========================");
  
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
  
  console.log("💰 TRUE PRICE ANALYSIS:");
  console.log("========================");
  
  // Test different amounts to see slippage impact
  const testAmounts = [
    ethers.utils.parseEther("0.1"),   // 0.1 token
    ethers.utils.parseEther("1"),     // 1 token
    ethers.utils.parseEther("10"),    // 10 tokens
    ethers.utils.parseEther("100")    // 100 tokens
  ];
  
  console.log("\n🔄 WETH ↔ DAI Analysis:");
  console.log("=========================");
  
  for (let i = 0; i < testAmounts.length; i++) {
    const amount = testAmounts[i];
    const amountStr = ethers.utils.formatEther(amount);
    
    try {
      // WETH → DAI
      const wethToDai = await router.getAmountsOut(amount, [WETH, DAI]);
      const daiReceived = wethToDai[1];
      
      // DAI → WETH
      const daiToWeth = await router.getAmountsOut(amount, [DAI, WETH]);
      const wethReceived = daiToWeth[1];
      
      // Calculate rates
      const wethToDaiRate = parseFloat(ethers.utils.formatEther(daiReceived)) / parseFloat(amountStr);
      const daiToWethRate = parseFloat(ethers.utils.formatEther(wethReceived)) / parseFloat(amountStr);
      
      // Calculate theoretical inverse
      const theoreticalDaiToWeth = 1 / wethToDaiRate;
      const priceDifference = ((daiToWethRate - theoreticalDaiToWeth) / theoreticalDaiToWeth) * 100;
      
      console.log(`\n💰 Amount: ${amountStr} tokens`);
      console.log(`  WETH → DAI: 1 WETH = ${wethToDaiRate.toFixed(6)} DAI`);
      console.log(`  DAI → WETH: 1 DAI = ${daiToWethRate.toFixed(6)} WETH`);
      console.log(`  Theoretical: 1 DAI should = ${theoreticalDaiToWeth.toFixed(6)} WETH`);
      console.log(`  Price Difference: ${priceDifference.toFixed(2)}%`);
      
      // Test arbitrage profitability
      console.log(`  🔄 Arbitrage Test:`);
      
      // Step 1: DAI → WETH
      const step1 = await router.getAmountsOut(amount, [DAI, WETH]);
      const wethAmount = step1[1];
      
      // Step 2: WETH → DAI
      const step2 = await router.getAmountsOut(wethAmount, [WETH, DAI]);
      const finalDai = step2[1];
      
      const profit = finalDai.sub(amount);
      const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / parseFloat(amountStr)) * 100;
      
      console.log(`    DAI → WETH → DAI: ${ethers.utils.formatEther(amount)} → ${ethers.utils.formatEther(wethAmount)} → ${ethers.utils.formatEther(finalDai)}`);
      console.log(`    Profit: ${ethers.utils.formatEther(profit)} DAI (${profitPercent.toFixed(4)}%)`);
      console.log(`    Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
      
    } catch (error) {
      console.log(`  ❌ Error with ${amountStr} tokens: ${error.message}`);
    }
  }
  
  console.log("\n🔄 FOGG ↔ WETH Analysis:");
  console.log("==========================");
  
  for (let i = 0; i < testAmounts.length; i++) {
    const amount = testAmounts[i];
    const amountStr = ethers.utils.formatEther(amount);
    
    try {
      // FOGG → WETH
      const foggToWeth = await router.getAmountsOut(amount, [FOGG, WETH]);
      const wethReceived = foggToWeth[1];
      
      // WETH → FOGG
      const wethToFogg = await router.getAmountsOut(amount, [WETH, FOGG]);
      const foggReceived = wethToFogg[1];
      
      // Calculate rates
      const foggToWethRate = parseFloat(ethers.utils.formatEther(wethReceived)) / parseFloat(amountStr);
      const wethToFoggRate = parseFloat(ethers.utils.formatEther(foggReceived)) / parseFloat(amountStr);
      
      // Calculate theoretical inverse
      const theoreticalWethToFogg = 1 / foggToWethRate;
      const priceDifference = ((wethToFoggRate - theoreticalWethToFogg) / theoreticalWethToFogg) * 100;
      
      console.log(`\n💰 Amount: ${amountStr} tokens`);
      console.log(`  FOGG → WETH: 1 FOGG = ${foggToWethRate.toFixed(6)} WETH`);
      console.log(`  WETH → FOGG: 1 WETH = ${wethToFoggRate.toFixed(6)} FOGG`);
      console.log(`  Theoretical: 1 WETH should = ${theoreticalWethToFogg.toFixed(6)} FOGG`);
      console.log(`  Price Difference: ${priceDifference.toFixed(2)}%`);
      
      // Test arbitrage profitability
      console.log(`  🔄 Arbitrage Test:`);
      
      // Step 1: FOGG → WETH
      const step1 = await router.getAmountsOut(amount, [FOGG, WETH]);
      const wethAmount = step1[1];
      
      // Step 2: WETH → FOGG
      const step2 = await router.getAmountsOut(wethAmount, [WETH, FOGG]);
      const finalFogg = step2[1];
      
      const profit = finalFogg.sub(amount);
      const profitPercent = (parseFloat(ethers.utils.formatEther(profit)) / parseFloat(amountStr)) * 100;
      
      console.log(`    FOGG → WETH → FOGG: ${ethers.utils.formatEther(amount)} → ${ethers.utils.formatEther(wethAmount)} → ${ethers.utils.formatEther(finalFogg)}`);
      console.log(`    Profit: ${ethers.utils.formatEther(profit)} FOGG (${profitPercent.toFixed(4)}%)`);
      console.log(`    Profitable: ${profit.gt(0) ? '✅ YES!' : '❌ NO'}`);
      
    } catch (error) {
      console.log(`  ❌ Error with ${amountStr} tokens: ${error.message}`);
    }
  }
  
  console.log("\n💡 CONCLUSION:");
  console.log("=================");
  console.log("• Price differences exist but are eaten by fees and slippage");
  console.log("• Larger amounts = more slippage = less profit");
  console.log("• Uniswap V2 0.3% fee per swap kills small arbitrage");
  console.log("• Need MASSIVE price differences (>5%) for profitable arbitrage");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 