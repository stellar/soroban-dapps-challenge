<div>

<h3 align="center">Soroban Bitcoin Price Oracle</h3>

  <p align="center"> Bitcoin Price Oracle on Soroban Stellar (Futurenet)</p>
    - Live app: https://soroban-bitcoin-oracle.netlify.app<br/>
    - Tutorial (article): https://dev.to/user1122/soroban-bitcoin-price-oracle-tutorial-3ldk<br/>
    - Tutorial (video): <a href="https://www.youtube.com/watch?v=YEHb36HEUyc">Link</a><br/>
    - Inspired by: <a href="https://github.com/stellar/sorobounty-spectacular/discussions/29">This Sorobounty Submission</a>
</div>

## Built With

- Soroban smart contracts - https://soroban.stellar.org
- React
- IPFS Storage - https://thirdweb.com/dashboard/infrastructure/storage
- Chakra UI - https://chakra-ui.com/

## Getting Started

### Prerequisites

- **Node v18** - Install here: https://nodejs.org/en/download
- **Rust** - How to install Rust:
  [https://soroban.stellar.org/docs/getting-started/setup#install-rust](https://soroban.stellar.org/docs/getting-started/setup#install-rust)

- **Soroban CLI** - How to install Soroban CLI:
  [https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli)
- **Stellar Account with test tokens on Futurenet** - How to create new wallet using soroban-cli & receive test tokens:
  [https://soroban.stellar.org/docs/getting-started/deploy-to-futurenet#configure-an-identity](https://soroban.stellar.org/docs/getting-started/deploy-to-futurenet#configure-an-identity)

- **Freighter Wallet** - Wallet extension for interact with the app. Link: https://www.freighter.app

## Build, deploy & run the app frontend

### 1. Navigate to this repository:

```sh
git clone https://github.com/stellar/soroban-dapps-challenge.git
cd soroban-dapps-challenge
git checkout crypto-oracle
```

### 2. Setting up `initialize.sh` script

The `initialize.sh` script will do all actions (creating a new wallet, get test tokens, build and deploy all contracts using this wallet, create bind for typescript and also will install all node js packages). For more details, please check the guide.

We need to configure parameters to initialize `DONATION` and `ORACLE` contracts.

a) <ins>Let's start with `DONATION` contract.</ins>

- Open `initialize.sh` file.
- Find the following part at the end of the file:

  ```sh
  echo "Initialize the DONATION contract"
  ```

- For the `--recipient` parameter, specify the wallet address that will be able to withdraw money from the donation contract. This could be your address.

  ```sh
  initialize\
  --recipient <YOUR_WALLET> \
  ```

b) <ins>Now is the time for the `ORACLE` contract.</ins>

- Open `initialize.sh` file.
- Find the following part at the end of the file:

  ```sh
  echo "Initialize the ORACLE contract"
  ```

- As we can see, there are several parameters that need to be specified here. Below are descriptions of each.

  ```sh
   initialize \
   --caller <OWNER_ADDRESS> \
   --pair_name BTC_USDT \
   --epoch_interval <TIME_IS_SECONDS> \
   --relayer <RELAYER_ADDRESS>
  ```

  - `<OWNER_ADDRESS>` - the address that will become the owner of the contract. This could be your address. Only the contract owner will be able to change the `epoch_interval` and `relayer`;
  - `<TIME_IS_SECONDS>` - frequency (in seconds) of price updates;
  - `<RELAYER_ADDRESS>` - address of the wallet that will update the price (in the backend, in the CRON task). It is better to create a separate wallet for this (with test tokens);

### 3. Run `initialize.sh` script

```sh
npm run setup
```

It will execute the `initialize.sh` bash script. \*

> - If you are using Linux or Ubuntu OS, you may get the following error:
>
>   `./initialize.sh: Permission denied`

This error occurs when the shell script you’re trying to run doesn’t have the permissions to execute. To fix that, use this command:

```sh
chmod +x initialize.sh
```

and try again to run

```sh
npm run setup
```

### 4. Create a CRON task

You will need to run a CRON task at every 5 minutes that will check if there is need to fetch the BTC price from external API and set it to contract.

The function is ready, you need only to put:

- Secret key of wallet (relayer) that will fetch BTC price from API and set it to smart contract;
- Contract address of deployed Oracle Contract;
- `API_KEY` from https://api-ninjas.com/api/cryptoprice (for free).

To run the CRON task, go to `cron` dir and run:

```sh
npm install
node cron-script.js
```

### 7. Run

```sh
npm run dev
```

It will run the app frontend on port 3000 or other.

### 8. Open the app and start use it.
