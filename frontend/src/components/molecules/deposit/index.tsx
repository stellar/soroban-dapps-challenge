import React, { FunctionComponent, useState } from 'react'

import { LoadingButton } from '@mui/lab'
import { deposit } from 'vault-contract'

import { InputCurrency, InputPercentage } from 'components/atoms'
import { ErrorText } from 'components/atoms/error-text'
import { TokenAIcon, TokenBIcon } from 'components/icons'

import { IToken } from 'interfaces/soroban/token'

import styles from './styles.module.scss'

interface IFormValues {
  tokenAAmount: string
  maxSlippage: string
}

interface IDeposit {
  account: string
  tokenA: IToken
  onUpdate: () => void
}

const Deposit: FunctionComponent<IDeposit> = ({
  account,
  tokenA,
  onUpdate,
}) => {
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  const [formValues, setFormValues] = useState<IFormValues>({
    tokenAAmount: '0.00',
    maxSlippage: '0.5',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormValues({ ...formValues, [name]: value || 0 })
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSubmitting(true)
    setError(false)

    try {
      const { tokenAAmount, maxSlippage } = formValues
      const minA =
        parseFloat(tokenAAmount) -
        (parseFloat(maxSlippage) * parseFloat(tokenAAmount)) / 100

      await deposit(
        {
          from: account,
          amount: BigInt(parseFloat(tokenAAmount) * 10 ** tokenA.decimals),
        },
        { fee: 100000 }
      )
    } catch (error) {
      console.error(error)
      setError(true)
    }
    setSubmitting(false)
    setFormValues({
      ...formValues,
      tokenAAmount: '0.00',
    })
    onUpdate()
  }

  return (
    <form>
      <div className={styles.formContent}>
        <div className={styles.formContentLeft}>
          <div className={styles.input}>
            <InputCurrency
              label={tokenA.symbol}
              name="tokenAAmount"
              value={formValues.tokenAAmount}
              onChange={handleInputChange}
              decimalScale={tokenA.decimals}
              icon={TokenAIcon}
            />
          </div>
        </div>
        <div className={styles.formContentRight}>
          <InputPercentage
            label="Max slippage"
            name="maxSlippage"
            value={formValues.maxSlippage}
            onChange={handleInputChange}
            helpText="The maximum variation percentage accepted for the desired deposit amounts. The higher the percentage, the greater the chance of a successful transaction, but you may not get such a good price."
          />
        </div>
      </div>
      <div>
        <LoadingButton
          variant="contained"
          onClick={handleSubmit}
          color="primary"
          disableElevation
          fullWidth
          loading={isSubmitting}
        >
          Deposit
        </LoadingButton>
        {error && (
          <div className={styles.error}>
            <ErrorText text="Transaction failed. Try to increase the slippage for more chances of success." />
          </div>
        )}
      </div>
    </form>
  )
}

export { Deposit }
