var fs = require('fs');
var axios = require('axios');

var crowdfundChallengeId = 0;

/**
 * Read the data from the output file and update 
 * the user progress on data validation. 
 */
fs.readFile('./crowdfund/challenge/output.txt', async (err, inputData) => {
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
    if (!validateContract(contract)) {
      throw new Error("Contract validation failed! Check the id!");
    }
    if (!validateFinalLink(link)) {
      throw new Error("Production link validation failed! Check the link address!");
    }
    await sendCompleteChallengeRequest(userId);
})

/**
 * Contract validation.
 * Sophisticated validation logic should be added during the project evolution. 
 * 
 * @param {string} contractId The contract Id received from the challenge. 
 * @returns {boolean} True if the contract Id passed the validation.
 */
function validateContract(contractId) {
  var contractData = contractId.split(" ");
  var id = contractData[contractData.length - 1].trim();
  return id.length == 56;
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
      return curString.includes("vercel.app")
    }
  }
  return false;
}

/**
 * Update the user Progress: set the challenge is completed.
 * 
 * @param {string} userId The user's public key (id).  
 */
async function sendCompleteChallengeRequest(userId) {
  //todo: hide the link to the environment variables after testing phase (local and repository)
  var challengeApiUrl = 'https://soroban-dapps-challenge-wrangler.julian-martinez.workers.dev/';
  console.log(`The complete challenge request is sending to the user=${userId}`);
  await axios({
    method: 'put',
    url: challengeApiUrl,
    data: {
      userId: `${userId}:${crowdfundChallengeId}`,
      isCompleted: true
    }
  });
  console.log("The request was sent!");
}
