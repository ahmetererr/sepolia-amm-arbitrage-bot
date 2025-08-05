const { deployer, ethers, initializeDeployer } = require("../config/blockchain");
const dexes = require("../config/dexes.json");
const { SEPOLIA_TOKENS, SEPOLIA_POOLS } = require("../data/tokens.js");

const WRAPPER_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

async function getDiff(amount, path, params, i, type) {
  // Initialize deployer if not already done
  if (!deployer[type]) {
    await initializeDeployer();
  }
  
  const exchanges = await getExchanges(type);
  let myDeployer = deployer[type];
  let firstDex, secondDex, thirdDex, minAmount, maxAmount, midAmount;

  const { decimals, symbol } = await getTokenData(params.tokenOut, myDeployer);
  console.log(`Id: ${i}, Symbol: ${symbol}, Address: ${params.tokenOut}`);

  try {
    let amountOut1 = await exchanges.uniswapV2.getAmountsOut(amount, path);
    let amountOut = ethers.utils.formatUnits(amountOut1[amountOut1.length - 1], decimals);
    amountOut = parseFloat(amountOut).toFixed(8);

    firstDex = "uniswapV2";
    secondDex = "uniswapV2";
    thirdDex = "uniswapV2";
    minAmount = amountOut;
    maxAmount = amountOut;
    
    console.log(`Uniswap V2 amountOut: ${ethers.utils.formatUnits(amountOut1[amountOut1.length - 1], decimals)}`);
  } catch (error) {
    console.log("Uniswap V2 amountOut: N/A - Error:", error.message);
  }

  console.log(`FirstDex: ${firstDex} --> (SecondDex: ${secondDex} || ThirdDex: ${thirdDex})`);

  return { firstDex, secondDex, thirdDex };
}

async function getExpectedOutput(firstDex, secondDex, config, params, type) {
  // Initialize deployer if not already done
  if (!deployer[type]) {
    await initializeDeployer();
  }
  
  const amount = config.amount;
  const token0 = config.token0;
  const token1 = config.token1;
  const exchanges = await getExchanges(type);

  let amountOut1, amountOut2, amountInDex, amountTemp, finalAmount;
  let profitable = false;

  try {
    if (firstDex == "uniswapV2" && secondDex == "uniswapV2") {
      amountOut1 = await exchanges.uniswapV2.getAmountsOut(amount, [token0, token1]);
      amountOut2 = await exchanges.uniswapV2.getAmountsOut(amountOut1[1], [token1, token0]);

      amountInDex = ethers.utils.formatUnits(amountOut1[0], 18);
      amountTemp = ethers.utils.formatUnits(amountOut2[0], 18);
      finalAmount = ethers.utils.formatUnits(amountOut2[1], 18);
      
      if (amountOut2[1].gt(amount)) {
        profitable = true;
      }
    }

    console.log(
      `Profitable: ${profitable} (${parseFloat(amountInDex).toFixed(
        8
      )} --${firstDex}--> ${parseFloat(amountTemp).toFixed(8)} --${secondDex}--> ${parseFloat(
        finalAmount
      ).toFixed(8)})`
    );
    return profitable;
  } catch (error) {
    console.log("Error getting swap route", error);
    return profitable;
  }
}

async function getTokenBalance(tokenContract, account) {
  const balance = await tokenContract.balanceOf(account.address);
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  console.log(`${symbol} balance: ${ethers.utils.formatUnits(balance, decimals)}`);
  return { balance, symbol, decimals };
}

async function getTokenData(tokenAddress, deployer) {
  const tokenContract = new ethers.Contract(tokenAddress, WRAPPER_ABI, deployer);
  const balance = await tokenContract.balanceOf(deployer.address);
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return { balance, symbol, decimals };
}

async function getExchanges(type) {
  // Initialize deployer if not already done
  if (!deployer[type]) {
    await initializeDeployer();
  }
  
  const uniswapV2 = new ethers.Contract(
    dexes.sepolia.uniswapV2.address,
    dexes.sepolia.uniswapV2.abi,
    deployer[type]
  );

  return { uniswapV2 };
}

// New function to check arbitrage opportunities between pools
async function checkArbitrageOpportunity(amount, path, type) {
  // Initialize deployer if not already done
  if (!deployer[type]) {
    await initializeDeployer();
  }
  
  const exchanges = await getExchanges(type);
  const myDeployer = deployer[type];
  
  try {
    // Get amount out for the forward path
    const forwardAmounts = await exchanges.uniswapV2.getAmountsOut(amount, path);
    const forwardOutput = forwardAmounts[forwardAmounts.length - 1];
    
    // Create reverse path
    const reversePath = [...path].reverse();
    const reverseAmounts = await exchanges.uniswapV2.getAmountsOut(forwardOutput, reversePath);
    const reverseOutput = reverseAmounts[reverseAmounts.length - 1];
    
    const profit = reverseOutput.sub(amount);
    const profitable = profit.gt(0);
    
    console.log(`Arbitrage Check:`);
    console.log(`  Input: ${ethers.utils.formatEther(amount)} ETH`);
    console.log(`  Forward Output: ${ethers.utils.formatEther(forwardOutput)} tokens`);
    console.log(`  Reverse Output: ${ethers.utils.formatEther(reverseOutput)} ETH`);
    console.log(`  Profit: ${ethers.utils.formatEther(profit)} ETH`);
    console.log(`  Profitable: ${profitable}`);
    
    return {
      profitable,
      profit: profit.toString(),
      inputAmount: amount.toString(),
      forwardOutput: forwardOutput.toString(),
      reverseOutput: reverseOutput.toString()
    };
  } catch (error) {
    console.log("Error checking arbitrage opportunity:", error.message);
    return {
      profitable: false,
      profit: "0",
      inputAmount: amount.toString(),
      forwardOutput: "0",
      reverseOutput: "0"
    };
  }
}

module.exports = {
  getDiff,
  getExpectedOutput,
  getTokenBalance,
  getTokenData,
  getExchanges,
  checkArbitrageOpportunity
};
