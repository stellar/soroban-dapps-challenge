import { Contract as TokenA, networks as networksA } from 'token-a-contract'
import { Contract as TokenB, networks as networksB } from 'token-b-contract'
import { Contract as ShareToken, networks as networksShareToken } from 'share-token-contract'
import { Contract as LiquidityPool, networks as networksLiquidityPool } from 'liquidity-pool-contract'

const rpcUrl = 'https://rpc-futurenet.stellar.org	'

export { Address } from 'token-a-contract'
export const tokenAContract = new TokenA({ ...networksA.futurenet, rpcUrl })
export const tokenBContract = new TokenB({ ...networksB.futurenet, rpcUrl })
export const shareTokenContract = new ShareToken({ ...networksShareToken.futurenet, rpcUrl })
export const liquidityPoolContract = new LiquidityPool({ ...networksLiquidityPool.futurenet, rpcUrl })
