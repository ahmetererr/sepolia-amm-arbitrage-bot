const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

async function main() {
  console.log("🎯 Real Arbitrage Test for Sepolia");
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
    console.log("🔄 Arbitrage Opportunities:");
    console.log("============================");
    
    // Test 1: WETH → FOGG → DAI → WETH
    console.log("🔄 Test 1: WETH → FOGG → DAI → WETH");
    const startAmount = ethers.utils.parseEther("1"); // 1 WETH
    
    try {
      // Step 1: WETH → FOGG
      const step1 = await router.getAmountsOut(startAmount, [WETH, FOGG]);
      const foggAmount = step1[1];
      console.log(`  Step 1: 1 WETH → ${ethers.utils.formatEther(foggAmount)} FOGG`);
      
      // Step 2: FOGG → DAI
      const step2 = await router.getAmountsOut(foggAmount, [FOGG, DAI]);
      const daiAmount = step2[1];
      console.log(`  Step 2: ${ethers.utils.formatEther(foggAmount)} FOGG → ${ethers.utils.formatEther(daiAmount)} DAI`);
      
      // Step 3: DAI → WETH
      const step3 = await router.getAmountsOut(daiAmount, [DAI, WETH]);
      const finalWeth = step3[1];
      console.log(`  Step 3: ${ethers.utils.formatEther(daiAmount)} DAI → ${ethers.utils.formatEther(finalWeth)} WETH`);
      
      const profit = finalWeth.sub(startAmount);
      const profitable = profit.gt(0);
      
      console.log(`  💰 Profit: ${ethers.utils.formatEther(profit)} WETH`);
      console.log(`  📈 ROI: ${((parseFloat(ethers.utils.formatEther(profit)) / 1) * 100).toFixed(4)}%`);
      console.log(`  ✅ Profitable: ${profitable}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
    
    // Test 2: WETH → DAI → FOGG → WETH
    console.log("🔄 Test 2: WETH → DAI → FOGG → WETH");
    
    try {
      // Step 1: WETH → DAI
      const step1 = await router.getAmountsOut(startAmount, [WETH, DAI]);
      const daiAmount = step1[1];
      console.log(`  Step 1: 1 WETH → ${ethers.utils.formatEther(daiAmount)} DAI`);
      
      // Step 2: DAI → FOGG
      const step2 = await router.getAmountsOut(daiAmount, [DAI, FOGG]);
      const foggAmount = step2[1];
      console.log(`  Step 2: ${ethers.utils.formatEther(daiAmount)} DAI → ${ethers.utils.formatEther(foggAmount)} FOGG`);
      
      // Step 3: FOGG → WETH
      const step3 = await router.getAmountsOut(foggAmount, [FOGG, WETH]);
      const finalWeth = step3[1];
      console.log(`  Step 3: ${ethers.utils.formatEther(foggAmount)} FOGG → ${ethers.utils.formatEther(finalWeth)} WETH`);
      
      const profit = finalWeth.sub(startAmount);
      const profitable = profit.gt(0);
      
      console.log(`  💰 Profit: ${ethers.utils.formatEther(profit)} WETH`);
      console.log(`  📈 ROI: ${((parseFloat(ethers.utils.formatEther(profit)) / 1) * 100).toFixed(4)}%`);
      console.log(`  ✅ Profitable: ${profitable}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
    
    // Test 3: FOGG → WETH → DAI → FOGG
    console.log("🔄 Test 3: FOGG → WETH → DAI → FOGG");
    
    try {
      // Step 1: FOGG → WETH
      const step1 = await router.getAmountsOut(startAmount, [FOGG, WETH]);
      const wethAmount = step1[1];
      console.log(`  Step 1: 1 FOGG → ${ethers.utils.formatEther(wethAmount)} WETH`);
      
      // Step 2: WETH → DAI
      const step2 = await router.getAmountsOut(wethAmount, [WETH, DAI]);
      const daiAmount = step2[1];
      console.log(`  Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatEther(daiAmount)} DAI`);
      
      // Step 3: DAI → FOGG
      const step3 = await router.getAmountsOut(daiAmount, [DAI, FOGG]);
      const finalFogg = step3[1];
      console.log(`  Step 3: ${ethers.utils.formatEther(daiAmount)} DAI → ${ethers.utils.formatEther(finalFogg)} FOGG`);
      
      const profit = finalFogg.sub(startAmount);
      const profitable = profit.gt(0);
      
      console.log(`  💰 Profit: ${ethers.utils.formatEther(profit)} FOGG`);
      console.log(`  📈 ROI: ${((parseFloat(ethers.utils.formatEther(profit)) / 1) * 100).toFixed(4)}%`);
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