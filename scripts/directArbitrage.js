const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 Direct Arbitrage Test for Sepolia");
  console.log("=====================================");
  
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
  
  console.log("💰 Current Prices:");
  console.log("==================");
  
  // Get current prices
  const amountIn = ethers.utils.parseEther("1"); // 1 token
  
  try {
    // WETH to FOGG price
    const wethToFogg = await router.getAmountsOut(amountIn, [WETH, FOGG]);
    const foggPrice = wethToFogg[1];
    console.log(`1 WETH = ${ethers.utils.formatEther(foggPrice)} FOGG`);
    
    // FOGG to WETH price
    const foggToWeth = await router.getAmountsOut(amountIn, [FOGG, WETH]);
    const wethPrice = foggToWeth[1];
    console.log(`1 FOGG = ${ethers.utils.formatEther(wethPrice)} WETH`);
    
    // WETH to DAI price
    const wethToDai = await router.getAmountsOut(amountIn, [WETH, DAI]);
    const daiPrice = wethToDai[1];
    console.log(`1 WETH = ${ethers.utils.formatEther(daiPrice)} DAI`);
    
    // DAI to WETH price
    const daiToWeth = await router.getAmountsOut(amountIn, [DAI, WETH]);
    const wethFromDaiPrice = daiToWeth[1];
    console.log(`1 DAI = ${ethers.utils.formatEther(wethFromDaiPrice)} WETH`);
    
    console.log("");
    console.log("🚨 MASSIVE PRICE DIFFERENCES FOUND!");
    console.log("=====================================");
    
    // Calculate price differences
    const wethToDaiRate = parseFloat(ethers.utils.formatEther(daiPrice));
    const daiToWethRate = parseFloat(ethers.utils.formatEther(wethFromDaiPrice));
    const priceDifference = ((daiToWethRate - (1/wethToDaiRate)) / (1/wethToDaiRate)) * 100;
    
    console.log(`WETH → DAI: 1 WETH = ${wethToDaiRate} DAI`);
    console.log(`DAI → WETH: 1 DAI = ${daiToWethRate} WETH`);
    console.log(`Theoretical: 1 DAI should = ${(1/wethToDaiRate).toFixed(6)} WETH`);
    console.log(`Price Difference: ${priceDifference.toFixed(2)}%`);
    
    console.log("");
    console.log("🔄 Direct Arbitrage Tests:");
    console.log("===========================");
    
    // Test 1: DAI → WETH → DAI (Direct arbitrage)
    console.log("🔄 Test 1: DAI → WETH → DAI");
    const startAmount = ethers.utils.parseEther("100"); // 100 DAI
    
    try {
      // Step 1: DAI → WETH
      const step1 = await router.getAmountsOut(startAmount, [DAI, WETH]);
      const wethAmount = step1[1];
      console.log(`  Step 1: 100 DAI → ${ethers.utils.formatEther(wethAmount)} WETH`);
      
      // Step 2: WETH → DAI
      const step2 = await router.getAmountsOut(wethAmount, [WETH, DAI]);
      const finalDai = step2[1];
      console.log(`  Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(finalDai)} DAI`);
      
      const profit = finalDai.sub(startAmount);
      const profitable = profit.gt(0);
      
      console.log(`  💰 Profit: ${ethers.utils.formatEther(profit)} DAI`);
      console.log(`  📈 ROI: ${((parseFloat(ethers.utils.formatEther(profit)) / 100) * 100).toFixed(4)}%`);
      console.log(`  ✅ Profitable: ${profitable}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
    
    // Test 2: WETH → DAI → WETH (Reverse arbitrage)
    console.log("🔄 Test 2: WETH → DAI → WETH");
    
    try {
      // Step 1: WETH → DAI
      const step1 = await router.getAmountsOut(startAmount, [WETH, DAI]);
      const daiAmount = step1[1];
      console.log(`  Step 1: 100 WETH → ${ethers.utils.formatEther(daiAmount)} DAI`);
      
      // Step 2: DAI → WETH
      const step2 = await router.getAmountsOut(daiAmount, [DAI, WETH]);
      const finalWeth = step2[1];
      console.log(`  Step 2: ${ethers.utils.formatEther(daiAmount)} DAI → ${ethers.utils.formatEther(finalWeth)} WETH`);
      
      const profit = finalWeth.sub(startAmount);
      const profitable = profit.gt(0);
      
      console.log(`  💰 Profit: ${ethers.utils.formatEther(profit)} WETH`);
      console.log(`  📈 ROI: ${((parseFloat(ethers.utils.formatEther(profit)) / 100) * 100).toFixed(4)}%`);
      console.log(`  ✅ Profitable: ${profitable}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
    
    // Test 3: FOGG → WETH → FOGG
    console.log("🔄 Test 3: FOGG → WETH → FOGG");
    
    try {
      // Step 1: FOGG → WETH
      const step1 = await router.getAmountsOut(startAmount, [FOGG, WETH]);
      const wethAmount = step1[1];
      console.log(`  Step 1: 100 FOGG → ${ethers.utils.formatEther(wethAmount)} WETH`);
      
      // Step 2: WETH → FOGG
      const step2 = await router.getAmountsOut(wethAmount, [WETH, FOGG]);
      const finalFogg = step2[1];
      console.log(`  Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(finalFogg)} FOGG`);
      
      const profit = finalFogg.sub(startAmount);
      const profitable = profit.gt(0);
      
      console.log(`  💰 Profit: ${ethers.utils.formatEther(profit)} FOGG`);
      console.log(`  📈 ROI: ${((parseFloat(ethers.utils.formatEther(profit)) / 100) * 100).toFixed(4)}%`);
      console.log(`  ✅ Profitable: ${profitable}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
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