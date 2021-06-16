const Step = require('./step.model');
const ReadPreference = require('mongodb').ReadPreference;
const https = require('https');
const azure = require('azure-storage');
const { BlobServiceClient } = require('@azure/storage-blob');
const util = require('util')
//const request = require("request");



let imagesOnAzure = new Map()

require('./mongo').connect();

function scrapeContent(req, response) {
  var url = req.body.url.toString();
  if (url.includes("//www.googleapis"))
    url+=`&key=${process.env.youtubeapikey}`

  var request = https.get(url, ( res) => {
    if (res.statusCode !== 200) {
      console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
      res.resume();
      return;
    }
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
      });
    res.on('close', () => {
        response.status(200).json(data);
      });
  });
  request.on('error', (e) => {
    console.log('Error'+e);
    response.status(200).json("{}");
  });
}

 async function setImageBlob(sourceUrl, imageName, ){
  process.env['AZURE_STORAGE_ACCOUNT'] = `${process.env.azurestorageimageaccount}`
  process.env['AZURE_STORAGE_ACCESS_KEY'] = `${process.env.azurestorageimageaccountkey}`
  var request = require('request').defaults({ encoding: null });
  const requestPromise = util.promisify(request);
  const response = await requestPromise(sourceUrl);
  var body = response.body;
  const blobServiceClient = BlobServiceClient.fromConnectionString(`${process.env.azurestorageimageconnectionstring}`);
  const containerClient = blobServiceClient.getContainerClient(`${process.env.azurestorageimageacontainername}`);
  const blockBlobClient = containerClient.getBlockBlobClient(imageName);
  blockBlobClient.upload(body, body.length)
}

function getImageBlobUrl(imageName){
  process.env['AZURE_STORAGE_ACCOUNT'] = `${process.env.azurestorageimageaccount}`
  process.env['AZURE_STORAGE_ACCESS_KEY'] = `${process.env.azurestorageimageaccountkey}`
  var blobService = azure.createBlobService();
  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
      Start: azure.date.minutesFromNow(-5),
      Expiry: azure.date.daysFromNow(365),
    },
  };
  var sasToken = blobService.generateSharedAccessSignature(`${process.env.azurestorageimageacontainername}`, imageName, sharedAccessPolicy);
  var sasUrl = blobService.getUrl(`${process.env.azurestorageimageacontainername}`, imageName, sasToken);
  return sasUrl;
}

function getPaths(req, res) {
  const docquery = Step.find({}).read(ReadPreference.NEAREST);
  console.log("GETPATHS")
  docquery
    .exec()
    .then(paths => {
        console.log("SETTING MAP")
        for (const p in paths) {
          if (!imagesOnAzure.has(paths[p].uid))
            imagesOnAzure.set(paths[p].uid, getImageBlobUrl( paths[p].uid ))
        }
      for (const p in paths) {
          paths[p].Thumb = imagesOnAzure.get(paths[p].uid);
      }
      res.status(200).json(paths);
    })
    .catch(error => {
      console.log("Error"+error)
      res.status(500).send(error);
      return;
    });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function postStep(req, res) {
  const originalStep = {
    Title: req.body.Title,
    Description: req.body.Description,
    Thumb: req.body.Thumb,
    Url: req.body.Url,
    Type: req.body.Type,
    Tree: req.body.Tree,
    Tags: req.body.Tags,
    Recommender: req.body.Recommender,
    ip: req.body.ip,
  };
  originalStep.uid=uuidv4();

  console.log("ORIGN THUMB1 "+  originalStep.Thumb)
//  if (!originalStep.Thumb)
//    originalStep.Thumb = "https://s2.googleusercontent.com/s2/favicons?domain="+originalStep.Url;

  if (originalStep.Thumb){
    setImageBlob(originalStep.Thumb, originalStep.uid)
    imagesOnAzure.delete(originalStep.uid )
    originalStep.Thumb = originalStep.uid
  }
  const step = new Step(originalStep);
  step.save(error => {
    if (checkServerError(res, error)) return;
    res.status(201).json(step);
    console.log('Step created successfully!');
  });
}

function putStep(req, res) {
  const originalStep = {
    uid: req.params.uid,
    Title: req.body.Title,
    Description: req.body.Description,
    Thumb: req.body.Thumb,
    Url: req.body.Url,
    Type: req.body.Type,
    Tree: req.body.Tree,
    Tags: req.body.Tags,
    Recommender: req.body.Recommender,
  };

  if (originalStep.Thumb && !originalStep.Thumb.includes("blob.core.windows.net")){
    console.log("SETTING THUMB")
    setImageBlob(originalStep.Thumb, originalStep.uid)
    imagesOnAzure.delete(originalStep.uid);
  }
  if (originalStep.Thumb)
    originalStep.Thumb = originalStep.uid

  Step.findOne({ uid: originalStep.uid }, (error, step) => {
    if (checkServerError(res, error)) return;
    if (!checkFound(res, step)) return;

    step.uid = originalStep.uid,
    step.Title = originalStep.Title,
    step.Description = originalStep.Description,
    step.Thumb = originalStep.Thumb,
    step.Url = originalStep.Url,
    step.Type = originalStep.Type,
    step.Tree = originalStep.Tree,
    step.Tags = originalStep.Tags,
    step.ip = originalStep.ip,

    step.Recommender= originalStep.Recommender,
    step.save(error => {
      if (checkServerError(res, error)) return;
      res.status(200).json(step);
      console.log('Step updated successfully!');
    });
  });
}

function deleteStep(req, res) {
  const uid = req.params.uid;
  Step.findOneAndRemove({ uid: uid })
    .then(step => {
      if (!checkFound(res, step)) return;
      res.status(200).json(step);
      console.log('Step deleted successfully!');
    })
    .catch(error => {
      if (checkServerError(res, error)) return;
    });
}

function checkServerError(res, error) {
  if (error) {
    res.status(500).send(error);
    return error;
  }
}

function checkFound(res, step) {
  if (!step) {
    res.status(404).send('Step not found.');
    return;
  }
  return step;
}

module.exports = {
  getPaths,
  postStep,
  putStep,
  deleteStep,
  scrapeContent
};
