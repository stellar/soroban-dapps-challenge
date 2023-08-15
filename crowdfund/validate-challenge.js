const fs = require('fs');
const axios = require('axios');

fs.readFile('challenge/output.txt', async (err, inputD) => {
  const challengeId = 0;
  if (err) throw err;
    var lines = inputD.toString().split('\n');
    console.log(lines[0]);
    console.log(lines[1]);
    console.log(lines[2]);
    var userId = lines[0].split(":")[1].trim();
    if (!validateContract(lines[1])) {
      var errorMsg = "Contract validation failed! Check the id!";
      throw new Error(errorMsg);
    }
    if (!validateFinalLink(lines[2])) {
      var errorMsg = "Production link validation failed! Check the link address!";
      throw new Error(errorMsg);
    };
    sendRequest(true, userId);
})

function validateContract(contractId) {
  var contractData = contractId.split(" ");
  var id = contractData[contractData.length - 1].trim();
  return id.length == 56;
};

function validateFinalLink(link) {
  var linkData = link.split(" ");
  for (i = 0; i < linkData.length; i++) {
    var curString = String(linkData[i]);
    if (curString.startsWith("https")) {
      return curString.includes("vercel.app")
    }
  }
  return false;
};

async function sendRequest(isCompleted, userId) {
  var challengeId = 0;
  console.log(`The request is sending to user=${userId} with status isCompleted=${isCompleted}`);
  await axios({
    method: 'put',
    url: 'https://soroban-dapps-challenge-wrangler.julian-martinez.workers.dev/',
    data: {
      userId: `${userId}:${challengeId}`,
      isCompleted: isCompleted
    }
  });
  console.log("The request was sent!");
}
