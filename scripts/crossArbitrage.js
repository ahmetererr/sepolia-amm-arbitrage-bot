const { ethers } = require("hardhat");
const { initializeDeployer } = require("../config/blockchain");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS, TEST_AMOUNTS } = require("../data/tokens");

async function testCrossArbitrage() {
    try {
        await initializeDeployer();
        const { deployer } = require("../config/blockchain");
        
        console.log("🚀 Testing Cross-Arbitrage Strategy (DAI → WETH → FOGG)");
        console.log("=" .repeat(60));
        
        // Test amounts
        const testAmounts = [
            { name: "SMALL", amount: TEST_AMOUNTS.SMALL },
            { name: "MEDIUM", amount: TEST_AMOUNTS.MEDIUM },
            { name: "LARGE", amount: TEST_AMOUNTS.LARGE }
        ];
        
        for (const test of testAmounts) {
            console.log(`\n📊 Testing ${test.name} Amount: ${ethers.utils.formatEther(test.amount)} DAI`);
            console.log("-".repeat(40));
            
            // Step 1: DAI → WETH
            const step1Result = await simulateSwap(
                SEPOLIA_TOKENS.DAI,
                SEPOLIA_TOKENS.WETH,
                test.amount,
                "DAI → WETH"
            );
            
            if (!step1Result.success) {
                console.log(`❌ Step 1 failed: ${step1Result.error}`);
                continue;
            }
            
            // Step 2: WETH → FOGG
            const step2Result = await simulateSwap(
                SEPOLIA_TOKENS.WETH,
                SEPOLIA_TOKENS.FOGG,
                step1Result.outputAmount,
                "WETH → FOGG"
            );
            
            if (!step2Result.success) {
                console.log(`❌ Step 2 failed: ${step2Result.error}`);
                continue;
            }
            
            // Calculate profit
            const profit = step2Result.outputAmount.sub(test.amount);
            const roi = profit.mul(100).div(test.amount);
            
            console.log(`✅ Cross-Arbitrage Results:`);
            console.log(`   Starting: ${ethers.utils.formatEther(test.amount)} DAI`);
            console.log(`   Step 1: ${ethers.utils.formatEther(test.amount)} DAI → ${ethers.utils.formatEther(step1Result.outputAmount)} WETH`);
            console.log(`   Step 2: ${ethers.utils.formatEther(step1Result.outputAmount)} WETH → ${ethers.utils.formatEther(step2Result.outputAmount)} FOGG`);
            console.log(`   Final: ${ethers.utils.formatEther(step2Result.outputAmount)} FOGG`);
            console.log(`   Profit: ${ethers.utils.formatEther(profit)} FOGG`);
            console.log(`   ROI: ${roi.toString()}%`);
            
            if (roi.gt(0)) {
                console.log(`🎉 PROFITABLE! ROI: ${roi.toString()}%`);
            } else {
                console.log(`📉 Loss: ${roi.toString()}%`);
            }
        }
        
    } catch (error) {
        console.error("❌ Error in cross arbitrage test:", error.message);
    }
}

async function simulateSwap(tokenIn, tokenOut, amountIn, description) {
    try {
        const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
        const { deployer } = require("../config/blockchain");
        const router = new ethers.Contract(routerAddress, [
            "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
        ], deployer.sepolia);
        
        const path = [tokenIn, tokenOut];
        const amounts = await router.getAmountsOut(amountIn, path);
        
        return {
            success: true,
            outputAmount: amounts[1],
            path: path
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

testCrossArbitrage()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 