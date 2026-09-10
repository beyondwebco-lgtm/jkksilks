import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || 'dummy-account-id';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'dummy-access-key';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'dummy-secret-key';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
