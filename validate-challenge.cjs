const fs = require('fs');
const axios = require('axios');

//TODO: Hide the link to the environment variables after testing phase (local and repository)
const challengeApiUrl = 'https://soroban-dapps-challenge-wrangler.julian-martinez.workers.dev';
const challengeId = 3;

const stellarHorizonUrls = [
  "https://horizon-testnet.stellar.org",
  "https://horizon-futurenet.stellar.org"
]
const stellarExplorerUrls = [
  "https://testnet.steexp.com",
  "https://futurenet.steexp.com"
]

/**
 * Read the data from the output file and update
 * the user progress on data validation.
 */
fs.readFile('./challenge/output.txt', async (err, inputData) => {
  if (err) throw err;

  const outputData = inputData.toString().split('\n');
  const publicKeyData = outputData[0];
  const contractIdData = outputData[1];
  const productionLinkData = outputData[2];

  console.log(publicKeyData);
  console.log(contractIdData);
  console.log(productionLinkData);

  const publicKey = publicKeyData.split(": ")[1];
  const contractId = contractIdData.split(": ")[1];
  const productionLink = productionLinkData.split(": ")[1];

  const isPublicKeyValid = await validatePublicKey(publicKey);
  if (!isPublicKeyValid) {
    throw new Error("Public key validation failed! Check the public key!");
  }

  const isContractIdValid = await validateContractId(contractId);
  if (!isContractIdValid) {
    throw new Error("Contract validation failed! Check the contract id!");
  }

  const isProductionLinkValid = await validateProductionLink(productionLink);
  if (!isProductionLinkValid) {
    throw new Error("Production link validation failed! Check the production link!");
  }

  const isTvlValid = await validateTvl(publicKey);
  if (!isTvlValid) {
    throw new Error("Total value locked validation failed! Total value locked must be greater than 0");
  }

  await sendCompleteChallengeRequest(publicKey);
})

/**
 * Public key validation.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} publicKey The user public key
 * @returns {boolean} True if the public key passed the validation.
 */
async function validatePublicKey(publicKey) {
  try {
    for (const horizonUrl of stellarHorizonUrls) {
      const response = await axios.get(`${horizonUrl}/accounts/${publicKey}`)

      if (response.status === 200) {
        return true;
      }
    }

    console.log(`Public key ${publicKey} does not exist`);
    return false;
  } catch (error) {
    console.error(`Error checking public key existence: ${error.message}`);
    return false;
  }
}

/**
 * Contract ID validation.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} contractId The contract id received from the challenge.
 * @returns {boolean} True if the contract id passed the validation.
 */
async function validateContractId(contractId) {
  try {
    let isContractIdValid = false;
    for (const explorerUrl of stellarExplorerUrls) {
      const response = await axios.get(`${explorerUrl}/contract/${contractId}`);

      if (response.status === 200) {
        isContractIdValid = true;
      }
    }

    return contractId.length === 56 && isContractIdValid;
  } catch (error) {
    console.error(`Error validating contract ID: ${error.message}`);
    return false;
  }
}

/**
 * Production link validation received from the challenge.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} productionLink The production link from the challenge's checkpoint.
 * @returns {boolean} True if the production link passed the validation.
 */
async function validateProductionLink(productionLink) {
  const isProductionLinkValid = await isLinkValid(productionLink);
  return productionLink.startsWith("https") && productionLink.includes("vercel.app") && isProductionLinkValid;
}

/**
 * Validate total value locked received from the challenge.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} publicKey The user's public key (id).
 * @returns {boolean} True if total value locked is greater than 0.
 */
async function validateTvl(publicKey) {
  try {
    const response = await axios.get(`${challengeApiUrl}/users?userId=${publicKey}`);
    for (const challenge of response.data.challenges || []) {
      if (challenge.id === challengeId && challenge.totalValueLocked && challenge.totalValueLocked > 0) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error validating TVL: ${error.message}`);
    return false;
  }
}

/**
 * Update the user progress. Mark the challenge as completed.
 *
 * @param {string} publicKey The user's public key (id).
 */
async function sendCompleteChallengeRequest(publicKey) {
  console.log(`The complete challenge request is sending to the user=${publicKey}`);
  await axios({
    method: 'put',
    url: challengeApiUrl,
    data: {
      userId: `${publicKey}:${challengeId}`,
      isCompleted: true
    }
  });
  console.log("The request was sent!");
}

/**
 * Check that link is valid and exists
 *
 * @param {string} link The public link.
 * @returns {boolean} True if the link exists and is valid.
 */
async function isLinkValid(link) {
  try {
    const response = await axios.head(link);
    if (response.status === 200) {
      return true;
    } else {
      console.log(`The link ${link} is not valid: status code ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking link ${link}: ${error.message}`);
    return false;
  }
}