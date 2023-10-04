import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext({
  walletAddress: '',
  network: '',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNetwork: (value: any) => value,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setWalletAddress: (value: any) => value,
})

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [network, setNetwork] = useState('')

  return (
    <AppContext.Provider
      value={{ walletAddress, network, setNetwork, setWalletAddress }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): {
  walletAddress: string
  network: string
  setWalletAddress: (value: string) => string
  setNetwork: (value: string) => string
} => useContext(AppContext)
