var fs = require('fs');
var axios = require('axios');

var challengeId = 0;

var stellarHorizonUrls = [
  "https://horizon-testnet.stellar.org",
  "https://horizon-futurenet.stellar.org"
]

var stellarExplorerUrls = [
  "https://testnet.steexp.com",
  "https://futurenet.steexp.com"
]

//todo: hide the link to the environment variables after testing phase (local and repository)
var challengeApiUrl = 'https://soroban-dapps-challenge-wrangler.julian-martinez.workers.dev/';

/**
 * Read the data from the output file and update
 * the user progress on data validation.
 */
fs.readFile('./challenge/output.txt', async (err, inputData) => {
  if (err) throw err;
  var outputData = inputData.toString().split('\n');
  var user = outputData[0];
  var contract = outputData[1];
  var link = outputData[2];
  console.log(user);
  console.log(contract);
  console.log(link);
  //todo: Discover if it is needed to check the user existence in the system by http GET request.
  var userId = user.split(":")[1].trim();
  if (!validatePublicKey(userId)) {
    throw new Error("Public key validation failed! Check the public key!");
  }
  if (!validateContract(contract)) {
    throw new Error("Contract validation failed! Check the contract id!");
  }
  if (!validateFinalLink(link)) {
    throw new Error("Production link validation failed! Check the link address!");
  }
  if (!validateTvl(link)) {
    throw new Error("Total value locked validation failed! Total value locked must be greater than 0");
  }
  await sendCompleteChallengeRequest(userId);
})

/**
 * Public key validation.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} publicKey The user public key
 * @returns {boolean} True if the public key passed the validation.
 */
function validatePublicKey(publicKey) {
  try {
    for (const horizonUrl of stellarHorizonUrls) {
      const response = axios.get(`${horizonUrl}/accounts/${publicKey}`);

      if (response.status === 200) {
        return true;
      }
    }

    console.log(`Stellar account ${publicKey} does not exist`);
    return false;
  } catch (error) {
    console.error(`Error checking account existence: ${error.message}`);
    return false;
  }
}

/**
 * Contract validation.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} contractId The contract Id received from the challenge.
 * @returns {boolean} True if the contract Id passed the validation.
 */
function validateContract(contractId) {
  try {
    var contractData = contractId.split(" ");
    var id = contractData[contractData.length - 1].trim();
    var correctLength = id.length === 56;

    var validContractId = false;
    for (const explorerUrl of stellarExplorerUrls) {
      const response = axios.get(`${explorerUrl}/contract/${publicKey}`);

      if (response.status === 200) {
        validContractId = true;
      }
    }

    return correctLength && validContractId;
  } catch (error) {
    console.error(`Error validating contract: ${error.message}`);
    return false;
  }
}

/**
 * Public url validation received from the challenge.
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} link The public link from the challenge's checkpoint.
 * @returns {boolean} True if the link passed the validation.
 */
function validateFinalLink(link) {
  var linkData = link.split(" ");
  for (i = 0; i < linkData.length; i++) {
    var curString = String(linkData[i]);
    if (curString.startsWith("https")) {
      return curString.includes("vercel.app") && isLinkValid(curString)
    }
  }
  return false;
}

/**
 * Validate total value locked
 * Sophisticated validation logic should be added during the project evolution.
 *
 * @param {string} userId The user's public key (id).
 * @returns {boolean} True if total value locked is greater than 0.
 */
function validateTvl(userId) {
  try {
    const response = axios.get(`${challengeApiUrl}users?userId=${userId}`);
    response.data.challanges.forEach(function(challenge) {
      if (challenge.id === challengeId && challenge?.totalValueLocked > 0){
        return true;
      }
    })
    return false;
  } catch (error) {
    console.error(`Error validating TVL: ${error.message}`);
    return false;
  }
}

/**
 * Update the user Progress: set the challenge is completed.
 *
 * @param {string} userId The user's public key (id).
 */
async function sendCompleteChallengeRequest(userId) {
  console.log(`The complete challenge request is sending to the user=${userId}`);
  await axios({
    method: 'put',
    url: challengeApiUrl,
    data: {
      userId: `${userId}:${challengeId}`,
      isCompleted: true
    }
  });
  console.log("The request was sent!");
}

/**
 * Check that link is valid and exists
 *
 * @param {string} link The public link from the challenge's checkpoint.
 * @returns {boolean} True if the link exists and is valid.
 */
function isLinkValid(link) {
  try {
    const response = axios.head(link);
    if (response.status === 200) {
      return true;
    } else {
      console.log(`The link ${link} is not valid (Status Code: ${response.status}).`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking link ${link}: ${error.message}`);
    return false;
  }
}
