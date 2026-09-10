import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, BUCKET_NAME } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and contentType are required' }, { status: 400 });
    }

    // Sanitize filename and add a timestamp to prevent overwriting
    const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // Generate the presigned URL valid for 5 minutes
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return NextResponse.json({
      uploadUrl: signedUrl,
      // The public URL where the image will be accessible after upload
      // Note: R2 requires a custom domain or public bucket configuration to access this directly.
      publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFilename}`,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
