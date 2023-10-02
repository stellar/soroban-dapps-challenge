import React from 'react'
import styles from './style.module.css'
import { Loading } from '../loading'

export interface ConnectButtonProps {
  label: string
  isHigher?: boolean
  isLoading?: boolean
  onClick: () => void
}

export function ConnectButton({
  label,
  isHigher,
  isLoading,
  onClick,
}: ConnectButtonProps) {
  if (isLoading) {
    return <Loading size={isHigher ? 50 : 38} />
  }
  return (
    <button
      className={styles.button}
      style={{ height: isHigher ? 50 : 38 }}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
