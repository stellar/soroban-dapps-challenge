import * as Btc from 'btc-token'
import * as Donation from 'donation-contract'
import * as Oracle from 'oracle-contract'
import { Server } from 'soroban-client'
import config from './config.json'
const { network, rpcUrl } = config

export const btc = new Btc.Contract({
  rpcUrl,
  ...Btc.networks[network as keyof typeof Btc.networks],
})

export const donation = new Donation.Contract({
  rpcUrl,
  ...Donation.networks[network as keyof typeof Donation.networks],
})

export const oracle = new Oracle.Contract({
  rpcUrl,
  ...Oracle.networks[network as keyof typeof Oracle.networks],
})


export const server = new Server(rpcUrl, { allowHttp: rpcUrl.startsWith('http:') })
