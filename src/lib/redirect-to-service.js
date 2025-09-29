export class RedirectToService {
    static async handle(c, serviceUrl, pathPrefix, timeout = 5000) {
        const originalPath = c.req.path;
        const servicePath = originalPath.replace(`/api${pathPrefix}`, pathPrefix);
        let url;
        try {
            console.log('RedirectToService params:', { serviceUrl, pathPrefix, timeout, originalPath, servicePath });
            const headers = {};
            for (const [key, value] of Object.entries(c.req.header())) {
                if (!['host', 'content-length', 'connection'].includes(key.toLowerCase())) {
                    headers[key] = value;
                }
            }
            // Ensure required headers for EC2 services
            if (!headers['Authorization'] && c.req.header('Authorization')) {
                headers['Authorization'] = c.req.header('Authorization');
            }
            const hasContentTypeHeader = Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');
            // Only set a default Content-Type if none is provided
            if (!hasContentTypeHeader && c.req.method !== 'GET') {
                const originalContentType = c.req.header('Content-Type') ?? c.req.header('content-type');
                if (originalContentType) {
                    headers['Content-Type'] = originalContentType;
                }
                else {
                    headers['Content-Type'] = 'application/json';
                }
            }
            url = new URL(servicePath, serviceUrl);
            console.log('Final URL:', url.toString());
            if (c.req.queries()) {
                for (const [key, value] of Object.entries(c.req.queries())) {
                    if (Array.isArray(value)) {
                        for (const v of value) {
                            url.searchParams.append(key, String(v));
                        }
                    }
                    else if (value !== undefined && value !== null) {
                        url.searchParams.append(key, String(value));
                    }
                }
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const init = {
                method: c.req.method,
                headers,
                signal: controller.signal,
            };
            if (!['GET', 'HEAD'].includes(c.req.method)) {
                // Preserve the raw body to maintain multipart/form-data formatting
                init.body = await c.req.arrayBuffer();
            }
            console.log('Making fetch request to:', url.toString(), 'with headers:', headers);
            const response = await fetch(url.toString(), init);
            clearTimeout(timeoutId);
            console.log('Response received:', response.status, response.statusText);
            const proxiedResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText
            });
            for (const [key, value] of response.headers.entries()) {
                if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                    proxiedResponse.headers.set(key, value);
                }
            }
            for (const [key, value] of c.res.headers.entries()) {
                proxiedResponse.headers.set(key, value);
            }
            return proxiedResponse;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return c.json({
                    error: 'Request timeout',
                    message: 'Service did not respond within the timeout period'
                }, 504);
            }
            console.error('Service connection error details:', {
                error: error instanceof Error ? error.message : String(error),
                errorName: error instanceof Error ? error.name : 'Unknown',
                errorStack: error instanceof Error ? error.stack : 'No stack',
                serviceUrl,
                servicePath,
                finalUrl: url?.toString() ?? 'URL not constructed',
                cause: error instanceof Error ? error.cause : 'No cause'
            });
            return c.json({
                error: 'Service temporarily unavailable',
                message: 'Failed to connect to target service',
                details: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            }, 503);
        }
    }
}
