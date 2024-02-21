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

  const publicKeyData = inputData.toString();
  const publicKey = publicKeyData.substring(publicKeyData.indexOf(':') + 1).trim();

  console.log(publicKeyData);

  const user = await getUser(publicKey);
  if (!user) {
    throw new Error("User is not found! Check the public key!");
  }

  const isPublicKeyValid = await validatePublicKey(publicKey);
  if (!isPublicKeyValid) {
    throw new Error("Public key validation failed! Check the public key!");
  }

  const challenge = getCurrentChallenge(user);
  if (!challenge) {
    throw new Error("Challenge with progress is not found!");
  }

  const isContractIdValid = await validateContractId(challenge.contractId);
  if (!isContractIdValid) {
    throw new Error("Contract validation failed! Check the contract id!");
  }

  const isProductionLinkValid = await validateProductionLink(challenge.url);
  if (!isProductionLinkValid) {
    throw new Error("Production link validation failed! Check the production link!");
  }

  const isTvlValid = validateTvl(challenge.totalValueLocked);
  if (!isTvlValid) {
    throw new Error("Total value locked validation failed! Total value locked must be greater than 0!");
  }

  await sendCompleteChallengeRequest(publicKey);
})

/**
 * Get user with challenges.
 *
 * @param {string} publicKey The user's public key (id).
 * @returns {any} User with challenges.
 */
async function getUser(publicKey) {
  try {
    const response = await axios.get(`${challengeApiUrl}/users?userId=${publicKey}`);
    return response.data;
  } catch (error) {
    console.error(`An error occurred while retrieving user ${publicKey}: ${error.message}`);
    return null;
  }
}

/**
 * Get current challenge with progress.
 *
 * @param {any} user User with challenges.
 * @returns {any} Challenge with progress.
 */
function getCurrentChallenge(user) {
  const challenges = user.challenges || [];
  return challenges.find(challenge => challenge.id === challengeId) || null;
}


/**
 * Public key validation.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} publicKey The user public key
 * @returns {boolean} True if the public key passed the validation.
 */
async function validatePublicKey(publicKey) {
  for (const horizonUrl of stellarHorizonUrls) {
    try {
      await axios.get(`${horizonUrl}/accounts/${publicKey}`);
      return true;
    } catch (error) {
      console.error(`An error occurred while validating public key ${publicKey} on network ${horizonUrl}: ${error.message}`);
    }
  }

  console.log(`Public key ${publicKey} does not exist`);
  return false;
}

/**
 * Contract ID validation.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} contractId The contract id received from the challenge.
 * @returns {boolean} True if the contract id passed the validation.
 */
async function validateContractId(contractId) {
  if (!contractId) {
    return false;
  }

  let isContractIdValid = contractId.length === 56;

  for (const explorerUrl of stellarExplorerUrls) {
    try {
      const response = await axios.get(`${explorerUrl}/contract/${contractId}?_data=routes%2Fcontract.%24contractId`);
      if (response.data.contractDetails) {
        return isContractIdValid;
      }
    } catch (error) {
      console.error(`An error occurred while validating contract ID on Stellar Explorer ${explorerUrl}: ${error.message}`);
    }
  }

  return false;
}

/**
 * Production link validation received from the challenge.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} productionLink The production link from the challenge's checkpoint.
 * @returns {boolean} True if the production link passed the validation.
 */
async function validateProductionLink(productionLink) {
  if (!productionLink) {
    return false;
  }

  const isProductionLinkValid = await isLinkValid(productionLink);
  return productionLink.includes("vercel.app") && isProductionLinkValid;
}

/**
 * Validate total value locked received from the challenge.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} totalValueLocked total value locked.
 * @returns {boolean} True if total value locked is greater than 0.
 */
function validateTvl(totalValueLocked) {
  return totalValueLocked && totalValueLocked > 0;
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
    await axios.head(link);
    return true;
  } catch (error) {
    console.error(`Error occurred while validating link ${link}: ${error.message}`);
    return false;
  }
}
