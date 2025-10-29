import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { CloudflareEnv } from '../types';

export const createFileRoute = () => {
  const fileRoute = new Hono<{ Bindings: CloudflareEnv }>();

  fileRoute.get('/:key', async (c) => {
    try {
      const key = c.req.param('key');
      
      if (!key) {
        throw new HTTPException(400, { message: 'File key is required' });
      }

      const bucket = c.env.BUCKET;
      if (!bucket) {
        throw new HTTPException(500, { message: 'R2 bucket not configured' });
      }

      const object = await bucket.get(key);
      
      if (!object) {
        throw new HTTPException(404, { message: 'File not found' });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('cache-control', 'public, max-age=31536000'); // 1 year cache

      // Set Content-Type based on file extension if not present
      if (!headers.get('content-type')) {
        const extension = key.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            headers.set('content-type', 'image/jpeg');
            break;
          case 'png':
            headers.set('content-type', 'image/png');
            break;
          case 'gif':
            headers.set('content-type', 'image/gif');
            break;
          case 'webp':
            headers.set('content-type', 'image/webp');
            break;
          case 'svg':
            headers.set('content-type', 'image/svg+xml');
            break;
          case 'pdf':
            headers.set('content-type', 'application/pdf');
            break;
          default:
            headers.set('content-type', 'application/octet-stream');
        }
      }

      return new Response(object.body, {
        headers,
        status: 200,
      });

    } catch (error) {
      console.error('Error serving file from R2:', error);
      
      if (error instanceof HTTPException) {
        throw error;
      }
      
      throw new HTTPException(500, { message: 'Internal server error' });
    }
  });

  return fileRoute;
};

export default createFileRoute;