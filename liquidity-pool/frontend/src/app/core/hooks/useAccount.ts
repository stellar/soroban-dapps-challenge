import { useEffect, useState } from 'react'

import {
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
} from 'stellar-wallets-kit'

import { useAppContext } from '../context/appContext'

// returning the same object identity every time avoids unnecessary re-renders
const addressObject = {
  address: '',
  displayName: '',
}

const addressToHistoricObject = (address: string): typeof addressObject => {
  addressObject.address = address
  addressObject.displayName = `${address.slice(0, 4)}...${address.slice(-4)}`
  return addressObject
}

// Soroban is only supported on Futurenet right now
const FUTURENET_DETAILS = {
  network: 'FUTURENET',
  networkUrl: 'https://horizon-futurenet.stellar.org',
  networkPassphrase: 'Test SDF Future Network ; October 2022',
}

const ERRORS = {
  WALLET_CONNECTION_REJECTED: 'Wallet connection rejected',
}

const STORAGE_WALLET_KEY = 'wallet'

const allowedWallets = [
  WalletType.ALBEDO,
  WalletType.FREIGHTER,
  WalletType.XBULL,
]

type UseAccountType = {
  account: typeof addressObject | null
  network: string
  onConnect: () => void
  onDisconnect: () => void
  isLoading: boolean
}
export function useAccount(): UseAccountType {
  const { walletAddress, network, setWalletAddress, setNetwork } =
    useAppContext()

  const [isLoading, setIsLoading] = useState(false)

  // Update is not only Futurenet is available
  const [selectedNetwork] = useState(FUTURENET_DETAILS)
  // Setup swc, user will set the desired wallet on connect
  const [SWKKit] = useState(
    new StellarWalletsKit({
      network: selectedNetwork.networkPassphrase as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    })
  )

  const getWalletAddress = async (type: WalletType): Promise<void> => {
    try {
      setIsLoading(true)
      // Set selected wallet, network, and public key
      SWKKit.setWallet(type)
      const publicKey = await SWKKit.getPublicKey()
      await SWKKit.setNetwork(WalletNetwork.FUTURENET)

      // Short timeout to prevent blick on loading address
      setTimeout(() => {
        setWalletAddress(publicKey)
        localStorage.setItem(STORAGE_WALLET_KEY, type)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      localStorage.removeItem(STORAGE_WALLET_KEY)
      setIsLoading(false)
      console.error(ERRORS.WALLET_CONNECTION_REJECTED)
    }
  }

  useEffect(() => {
    setNetwork(FUTURENET_DETAILS.network)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // if the walletType is stored in local storage the first opening the page
  // will trigger autoconnect for users
  useEffect(() => {
    const storedWallet = localStorage.getItem(STORAGE_WALLET_KEY)
    const walletType = Object.values(WalletType).includes(
      storedWallet as WalletType
    )

    if (!walletAddress && storedWallet && walletType) {
      const getAccount = async (): Promise<void> => {
        await getWalletAddress(storedWallet as WalletType)
      }
      getAccount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress])

  const onConnect = async (): Promise<void> => {
    if (!walletAddress) {
      // See https://github.com/Creit-Tech/Stellar-Wallets-Kit/tree/main for more options
      await SWKKit.openModal({
        allowedWallets,
        onWalletSelected: async (option: ISupportedWallet) => {
          await getWalletAddress(option.type)
        },
      })
    }
  }

  const onDisconnect = (): void => {
    setWalletAddress('')
    localStorage.removeItem(STORAGE_WALLET_KEY)
    setIsLoading(false)
  }

  return {
    account: walletAddress ? addressToHistoricObject(walletAddress) : null,
    network,
    onConnect,
    onDisconnect,
    isLoading,
  }
}
