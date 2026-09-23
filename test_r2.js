const { S3Client, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');

const envVars = fs.readFileSync('.env.local', 'utf-8')
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
  }, {});

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${envVars.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: envVars.R2_ACCESS_KEY_ID,
    secretAccessKey: envVars.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
  try {
    const data = await r2.send(new ListObjectsV2Command({ Bucket: envVars.R2_BUCKET_NAME, MaxKeys: 5 }));
    console.log("Files in R2:", data.Contents?.map(c => c.Key));
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
