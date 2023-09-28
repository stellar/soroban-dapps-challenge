import { useEffect, useState } from 'react'
import { useAppContext } from '../context/appContext'
import {
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
} from 'stellar-wallets-kit/build/module'

// returning the same object identity every time avoids unnecessary re-renders
const addressObject = {
  address: '',
  displayName: '',
}

const addressToHistoricObject = (address: string) => {
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

type Props = {
  account: typeof addressObject | null
  onConnect: () => void
  onDisconnect: () => void
  isLoading: boolean
}
export function useAccount(): Props {
  const { walletAddress, setWalletAddress } = useAppContext()

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

  const getWalletAddress = async (type: WalletType) => {
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

  // if the walletType is stored in local storage the first opening the page
  // will trigger autoconnect for users
  useEffect(() => {
    const storedWallet = localStorage.getItem(STORAGE_WALLET_KEY)
    if (
      !walletAddress &&
      storedWallet &&
      Object.values(WalletType).includes(storedWallet as WalletType)
    ) {
      ;(async () => {
        await getWalletAddress(storedWallet as WalletType)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress])

  const onConnect = async () => {
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

  const onDisconnect = () => {
    setWalletAddress('')
    localStorage.removeItem(STORAGE_WALLET_KEY)
    setIsLoading(false)
  }

  return {
    account: walletAddress ? addressToHistoricObject(walletAddress) : null,
    onConnect,
    onDisconnect,
    isLoading,
  }
}
