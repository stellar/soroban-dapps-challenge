const cron = require("node-cron");
const SorobanClient = require("soroban-client");
const xdr = SorobanClient.xdr;

const API_NINJA_KEY = "YOUR_API_KEY";

const sourceSecretKey = "YOUR_RELAYER_API_KEY";
const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();

const contractId = "ADDRESS_OF_DEPLOYED_CONTRACT_ORACLE";
const contract = new SorobanClient.Contract(contractId);

const server = new SorobanClient.Server(
  "https://rpc-futurenet.stellar.org:443",
  { allowHttp: true }
);

const networkPassphrase = SorobanClient.Networks.FUTURENET;
const fee = 100;

const getTimestamp = async () => {
  let account = await server.getAccount(sourcePublicKey);
  try {
    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee,
      networkPassphrase,
    })
      .addOperation(contract.call("get_timestamp"))
      .setTimeout(30)
      .build();

    let resultSimulation = await server.simulateTransaction(transaction);
    if (resultSimulation.error) {
      throw new Error("[ERROR] [getTimestamp]");
    }

    if (!resultSimulation.results || !resultSimulation.results.length) {
      throw new Error("[ERROR] [getTimestamp] transaction simulation ");
    }
    const result = resultSimulation.results[0];
    const scVal = xdr.ScVal.fromXDR(result.xdr, "base64");
    return scVal.u64();
  } catch (e) {
    console.error(e);
    throw new Error("[getTimestamp] ERROR");
  }
};

const getPairInfo = async () => {
  let account = await server.getAccount(sourcePublicKey);
  try {
    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee,
      networkPassphrase,
    })
      .addOperation(contract.call("get_pair_info"))
      .setTimeout(30)
      .build();

    let resultSimulation = await server.simulateTransaction(transaction);
    if (resultSimulation.error) {
      throw new Error("[ERROR] [getPairInfo]");
    }

    if (!resultSimulation.results || !resultSimulation.results.length) {
      throw new Error("[ERROR] [getPairInfo] transaction simulation ");
    }
    const result = resultSimulation.results[0];
    const scVal = xdr.ScVal.fromXDR(result.xdr, "base64");
    return SorobanClient.scValToNative(scVal);
  } catch (e) {
    console.error(e);
    throw new Error("[getPairInfo] ERROR");
  }
};

const getEpochData = async (epochNr) => {
  let account = await server.getAccount(sourcePublicKey);
  try {
    epochNr = new SorobanClient.nativeToScVal(epochNr, { type: "u32" });

    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee,
      networkPassphrase,
    })
      .addOperation(contract.call("get_pair_data_at_epoch", ...[epochNr]))
      .setTimeout(30)
      .build();

    let resultSimulation = await server.simulateTransaction(transaction);
    if (resultSimulation.error) {
      throw new Error("[ERROR] [getEpochData]");
    }

    if (!resultSimulation.results || !resultSimulation.results.length) {
      throw new Error("[ERROR] [getEpochData] transaction simulation ");
    }
    const result = resultSimulation.results[0];
    const scVal = xdr.ScVal.fromXDR(result.xdr, "base64");
    return SorobanClient.scValToNative(scVal);
  } catch (e) {
    console.error(e);
    throw new Error("[getEpochData] ERROR");
  }
};

const getPairPrice = async (pairName) => {
  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/cryptoprice?symbol=${pairName}`,
      {
        headers: {
          "X-Api-Key": API_NINJA_KEY,
        },
      }
    );
    const result = await response.json();
    return parseInt((parseFloat(result?.price) * 10 ** 5).toString());
  } catch (e) {
    console.error(e);
    throw new Error("[getPairPrice] ERROR");
  }
};

const updatePairPrice = async (price) => {
  try {
    let account = await server.getAccount(sourcePublicKey);
    const value = new SorobanClient.nativeToScVal(price, { type: "u32" });
    const caller = new SorobanClient.Address(account._accountId).toScVal();
    const operation = contract.call("set_epoch_data", caller, value);
    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee,
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    transaction = await server.prepareTransaction(
      transaction,
      networkPassphrase
    );
    transaction.sign(sourceKeypair);
    let response = await server.sendTransaction(transaction);
    console.log("[updatePairPrice] Transaction hash:", response.hash);

    const hash = response.hash;
    if (response.status === "ERROR") {
      console.log("[updatePairPrice] ERROR STATUS");
      throw new Error("[updatePairPrice] ERROR STATUS");
    }

    while (response.status === "PENDING" || response.status === "NOT_FOUND") {
      response = await server.getTransaction(hash);
      console.log("[updatePairPrice] response.status: ", response.status);

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (response.status === "SUCCESS") {
      console.log("[updatePairPrice] SUCCESS");
      console.log("[updatePairPrice] Transaction status:", response.status);

      let decodedResponse = SorobanClient.xdr.TransactionMeta.fromXDR(
        response.resultMetaXdr,
        "base64"
      );
      decodedResponse = decodedResponse.v3().sorobanMeta()?.returnValue();
      decodedResponse = SorobanClient.scValToNative(decodedResponse);

      return decodedResponse;
    } else {
      console.log("[updatePairPrice] ERROR ");
      throw new Error("[updatePairPrice] ERROR ");
    }
  } catch (e) {
    console.error(e);
    throw new Error("[updatePairPrice] ERROR");
  }
};

const main = async () => {
  try {
    const pairInfo = await getPairInfo();
    const epochInterval = parseInt(pairInfo.epoch_interval);
    const currentTimestamp = await getTimestamp();
    const lastEpochNr = pairInfo.last_epoch;
    console.log("lastEpochNr ", lastEpochNr);

    let lastEpochTimestamp = 0;
    if (lastEpochNr > 0) {
      const lastEpochData = await getEpochData(lastEpochNr);
      lastEpochTimestamp = parseInt(lastEpochData.time);

      const lastEpochPrice = parseInt(lastEpochData.value);
      console.log("lastEpochPrice ", lastEpochPrice);
    }

    let deltaTimestamp = currentTimestamp - lastEpochTimestamp;
    console.log("deltaTimestamp ", deltaTimestamp);
    if (deltaTimestamp >= epochInterval) {
      console.log("Need to update the value");
    } else {
      console.log("Don't need to update the value");
      return;
    }

    const priceData = await getPairPrice("BTCUSDC");
    console.log("fetched priceData ", priceData);

    const updatePairPriceResult = await updatePairPrice(priceData);
    console.log("value setted !");
  } catch (e) {
    console.log("ERROR");
    console.error(e);
  }
};

cron.schedule("*/10 * * * * *", async () => {
  console.log("Running a task every 10 seconds");
  console.log("Current Time: ", new Date());
  await main();
});

