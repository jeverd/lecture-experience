const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({
  secretAccessKey: 'Vc8wHUhIOl5eTqYQBKaiHjBqlod2uhF3DDKQvi8m',
  accessKeyId: 'ASIA47SORLJQDLG4YWPN',
});
const s3 = new AWS.S3();

const uploadFiletoS3 = (file, fileName, cb) => {
    const buffer = fs.readFileSync(file.path);
    s3.upload({
      Bucket: 'pysfy',
      ACL: 'public-read',  // important or else people won't be access it
      Key: fileName,
      Body: buffer,
    }, (err, result) => {
      cb(err, result);
    });
  };