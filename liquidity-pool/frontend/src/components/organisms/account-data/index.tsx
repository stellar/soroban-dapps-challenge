import { FunctionComponent } from 'react'

import { ConnectButton } from 'components/atoms'
import { TokenAIcon, TokenBIcon, TokenLPIcon } from 'components/icons'
import { Balance } from 'components/molecules'

import { IToken } from 'interfaces/soroban/token'

import {
  tokenAContract,
  tokenBContract
} from '../../../shared/contracts'
import styles from './styles.module.scss'

interface IAccountData {
  account: string
  tokenA: IToken
  tokenB: IToken
  shareToken: IToken
  onUpdate: () => void
  onWalletConnect: () => void
}

const AccountData: FunctionComponent<IAccountData> = ({
  account,
  tokenA,
  tokenB,
  shareToken,
  onUpdate,
  onWalletConnect,
}) => {
  return (
    <div className={styles.card}>
      <h3>Account balance</h3>
      {account ? (
        <BalanceData
          account={account}
          tokenA={tokenA}
          tokenB={tokenB}
          shareToken={shareToken}
          onUpdate={onUpdate}
        />
      ) : (
        <ConnectButton label="Connect Wallet" onClick={onWalletConnect} />
      )}
    </div>
  )
}

interface IBalanceData {
  tokenA: IToken
  tokenB: IToken
  shareToken: IToken
  account: string
  onUpdate: () => void
}

const BalanceData: FunctionComponent<IBalanceData> = ({
  tokenA,
  tokenB,
  shareToken,
  account,
  onUpdate,
}) => {
  return (
    <>
      <div className={styles.address}>
        {`${account.substring(0, 10)}...${account.substring(
          account.length - 10
        )}`}
      </div>
      <div className={styles.balances}>
        <Balance
          account={account}
          token={tokenA}
          balance={tokenA.balance || BigInt(0)}
          mint={tokenAContract.mint as any} // Using 'as any' type assertion
          icon={TokenAIcon}
          onUpdate={onUpdate}
        />
        <Balance
          account={account}
          token={tokenB}
          balance={tokenB.balance || BigInt(0)}
          mint={tokenBContract.mint as any} // Using 'as any' type assertion
          icon={TokenBIcon}
          onUpdate={onUpdate}
        />
        <Balance
          account={account}
          token={shareToken}
          balance={shareToken.balance || BigInt(0)}
          icon={TokenLPIcon}
          onUpdate={onUpdate}
        />
      </div>
    </>
  )
}

export { AccountData }
