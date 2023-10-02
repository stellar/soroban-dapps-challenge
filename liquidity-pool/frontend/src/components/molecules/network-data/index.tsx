import React, { FunctionComponent } from 'react'

import { ConnectButton } from 'components/atoms'
import { DisconnectButton } from 'components/atoms/disconnect-button'

import styles from './styles.module.scss'

interface INetworkDataProps {
  network: string
  account: string
  onConnect: () => void
  onDisconnect: () => void
}

const NetworkData: FunctionComponent<INetworkDataProps> = ({
  network,
  account,
  onConnect,
  onDisconnect,
}) => {
  return (
    <>
      {network && account ? (
        <div className={styles.cardContainer}>
          <div className={styles.card}>{network}</div>
          <DisconnectButton label="Disconnect" onClick={onDisconnect} />
        </div>
      ) : (
        <ConnectButton label="Connect Wallet" onClick={onConnect} />
      )}
    </>
  )
}
export { NetworkData }
