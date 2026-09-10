import { NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2, BUCKET_NAME } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const { imageUrls } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: 'imageUrls array is required' }, { status: 400 });
    }

    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

    const deletePromises = imageUrls.map(async (url: string) => {
      if (!url || typeof url !== 'string') return;

      let key = url;
      // If full URL is provided, strip domain to get the S3 object key
      if (publicUrlBase && url.includes(publicUrlBase)) {
        key = url.replace(`${publicUrlBase}/`, '');
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        const parts = url.split('/');
        key = parts[parts.length - 1];
      }

      if (!key) return;

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      return r2.send(command);
    });

    await Promise.allSettled(deletePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image from R2:', error);
    return NextResponse.json({ error: 'Failed to delete from storage' }, { status: 500 });
  }
}
