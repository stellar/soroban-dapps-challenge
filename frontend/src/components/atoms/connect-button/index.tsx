import React from 'react'

import { Button } from '@mui/material'

export interface IConnectButtonProps {
  label: string
  onClick: () => void
}

export const ConnectButton: React.FC<IConnectButtonProps> = ({
  label,
  onClick,
}) => {
  return (
    <Button onClick={onClick} variant="contained">
      {label}
    </Button>
  )
}
