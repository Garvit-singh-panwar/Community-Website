
// Sanitize function used to sanitize the resources
// remove the $ from the reqests data inside body params or queryparams
export const sanitize = (req, res, next) => {
    const visited = new WeakSet();

    const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        if (visited.has(obj)) return;
        visited.add(obj);

        const dangerousKeys = [
            '__proto__',
            'prototype',
            'constructor'
        ];

        if (Array.isArray(obj)) {
            obj.forEach(sanitizeObject);
            return;
        }

        for (const key of Object.keys(obj)) {
            if (
                key.startsWith('$') ||
                key.includes('.') ||
                dangerousKeys.includes(key)
            ) {
                delete obj[key];
                continue;
            }

            sanitizeObject(obj[key]);
        }
    };

    sanitizeObject(req.body);
    sanitizeObject(req.params);
    sanitizeObject(req.query);

    next();
};