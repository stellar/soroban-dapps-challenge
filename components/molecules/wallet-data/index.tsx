import React from 'react'
import { useAccount, useIsMounted } from '../../../hooks'
import { ConnectButton } from '../../atoms'
import styles from './style.module.css'

export function WalletData() {
  const { isLoading, onDisconnect, onConnect, account } = useAccount()

  return (
    <div className={styles.container}>
      {account && (
        <div className={styles.displayData}>
          <div className={styles.card}>{account.displayName}</div>
        </div>
      )}
      {account ? (
        <ConnectButton label="Disconnect" onClick={onDisconnect} />
      ) : (
        <ConnectButton
          isLoading={isLoading}
          label="Connect Wallet"
          onClick={onConnect}
        />
      )}
    </div>
  )
}
