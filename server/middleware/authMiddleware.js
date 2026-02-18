const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // In a real Supabase setup, we would verify the JWT with Supabase secret
        // For this custom auth flow (if we sign our own tokens), we verify with JWT_SECRET
        // If we use Supabase returned session access_token, we can verify it too.

        // For simplicity/demo with custom login endpoint returning a signed token:
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
