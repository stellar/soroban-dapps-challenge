import * as HelloWorld from 'hello-world-contract'
import { SorobanRpc } from 'stellar-sdk'
import config from './config.json'
const { network, rpcUrl } = config

export const helloWorld = new HelloWorld.Contract({
  rpcUrl,
  ...HelloWorld.networks[network as keyof typeof HelloWorld.networks],
})

export const server = new SorobanRpc.Server(rpcUrl, { allowHttp: rpcUrl.startsWith('http:') })