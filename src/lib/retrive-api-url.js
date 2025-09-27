export function retrieveApiUrl(apiUrl, path, options) {
    const url = new URL(`/api${path}`, apiUrl);
    if (options?.query) {
        for (const [key, value] of Object.entries(options.query)) {
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
    return url.href;
}
