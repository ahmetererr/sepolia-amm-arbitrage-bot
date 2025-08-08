/**
 * @fileoverview Cross-pool arbitrage script for Uniswap V2
 * @description Tests arbitrage opportunities between different token pairs on the same DEX
 * @author AMM Arbitrageur Project
 * @version 1.0.0
 */

const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");

/**
 * @function crossArbitrage
 * @description Executes cross-pool arbitrage between DAI, WETH, and FOGG tokens
 * @async
 * @returns {Promise<void>}
 * 
 * @example
 * // Test cross-pool arbitrage
 * await crossArbitrage();
 */
async function crossArbitrage() {
    try {
        // Initialize blockchain connection
        await initializeDeployer();
        const { deployer } = require("../config/blockchain");
        
        console.log("🚀 Cross-Pool Arbitrage Test");
        console.log("=" .repeat(60));
        
        // Contract addresses for Sepolia testnet
        const WETH = "0x6A05167EC0C3f5684525C1bCa2ff25B31950a45e";
        const DAI = "0xd07A73dBC01e3ca6f60e49Dd079C1C8164efb45d";
        const FOGG = "0x4b39323d4708dDee635ee1be054f3cB9a95D4090";
        const UNISWAP_ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
        
        // Initialize router contract for price queries
        const router = new ethers.Contract(UNISWAP_ROUTER, [
            "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
        ], deployer.sepolia);
        
        console.log("\n📊 Testing Cross-Pool Arbitrage:");
        console.log("-".repeat(50));
        
        // Test amount: 10 DAI
        const testAmount = ethers.utils.parseUnits("10", 18);
        
        console.log(`\n💰 Testing with: ${ethers.utils.formatUnits(testAmount, 18)} DAI`);
        
        /**
         * @description Step 1: DAI → WETH conversion
         * @type {Array} amounts1 - Array containing input and output amounts
         */
        const path1 = [DAI, WETH];
        const amounts1 = await router.getAmountsOut(testAmount, path1);
        const wethAmount = amounts1[1];
        
        console.log(`Step 1: ${ethers.utils.formatUnits(testAmount, 18)} DAI → ${ethers.utils.formatEther(wethAmount)} WETH`);
        
        /**
         * @description Step 2: WETH → FOGG conversion
         * @type {Array} amounts2 - Array containing input and output amounts
         */
        const path2 = [WETH, FOGG];
        const amounts2 = await router.getAmountsOut(wethAmount, path2);
        const foggAmount = amounts2[1];
        
        console.log(`Step 2: ${ethers.utils.formatEther(wethAmount)} WETH → ${ethers.utils.formatUnits(foggAmount, 6)} FOGG`);
        
        /**
         * @description Calculate final profit/loss
         * @type {BigNumber} profit - Difference between input and output values
         * @type {BigNumber} roi - Return on investment percentage
         */
        const profit = foggAmount.sub(testAmount);
        const roi = profit.mul(100).div(testAmount);
        
        console.log(`\n📈 Results:`);
        console.log(`Input: ${ethers.utils.formatUnits(testAmount, 18)} DAI`);
        console.log(`Output: ${ethers.utils.formatUnits(foggAmount, 6)} FOGG`);
        console.log(`Profit: ${ethers.utils.formatUnits(profit, 6)} FOGG`);
        console.log(`ROI: ${roi.toString()}%`);
        
        if (profit.gt(0)) {
            console.log(`\n🎉 PROFITABLE OPPORTUNITY!`);
            console.log(`ROI: ${roi.toString()}%`);
        } else {
            console.log(`\n📉 No profitable opportunity found`);
            console.log(`Loss: ${roi.toString()}%`);
        }
        
        console.log(`\n🔍 Analysis:`);
        console.log(`• Cross-pool arbitrage tested`);
        console.log(`• Path: DAI → WETH → FOGG`);
        console.log(`• Same DEX (Uniswap V2)`);
        console.log(`• Fee impact: 0.3% per swap (0.6% total)`);
        
    } catch (error) {
        console.error("❌ Error in cross arbitrage:", error.message);
    }
}

/**
 * @description Main execution function
 * @async
 * @returns {Promise<void>}
 */
crossArbitrage()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 