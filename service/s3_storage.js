const AWS = require("aws-sdk");
const fs = require("fs");
var archiver = require("archiver");
var path = require("path");
var zipfolder = require("zip-a-folder");


AWS.config.update({
  accessKeyId: "DYH22T4REDJ3LK159J3J",
  secretAccessKey: "LHKzBQqvP/ZPCLoa7q+ce+qA9EnG8iv78hMmX2jo",
  signatureVersion: "v4",
  endpoint: "https://s3gw.inet.co.th:8082",
});
const s3 = new AWS.S3();
const myBucket = "testoneconf";

async function uploadtos3(filename, filepath) {
  var myKey = filename;
  let findfile = path.resolve(filepath);
  fs.readFile(findfile, function (err, data) {
    if (err) {
      throw err;
    }
    params = { Bucket: myBucket, Key: myKey, Body: data };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(
          `Successfully uploaded data to Bucket ${myBucket} filename ${myKey}`
        );
      }
    });
  });
}

async function genpresinedurl(filename) {
  const url = s3.getSignedUrl("getObject", {
    Bucket: myBucket,
    Key: filename,
    Expires: 60*60*24*7
  });
  return url;
}

async function zipdirectory(directory, pathtozip) {
  
  await zipfolder.zip(directory, pathtozip);
}

module.exports = { genpresinedurl, uploadtos3  , zipdirectory};
