export function basic(req, res, next) {
    try {
        const authheader = req.headers.authorization;
        if (!authheader) {
            throw new Error('UNAUTH');
        }
        const auth = authheader.split(' ');
        if (!auth || !authheader.startsWith('Basic')) {
            throw new Error('UNAUTH');
        }
        const token = Buffer.from(auth[1].trim(), 'base64').toString();
        if (!token) {
            throw new Error('UNAUTH');
        }

        const [user, pass] = token.split(':');

        if (user === process.env.AUTH_USERNAME && pass === process.env.AUTH_PASSWORD) {
            next();
        } else {
            throw new Error('UNAUTH');
        }
    } catch (e) {
        if(e.message === 'UNAUTH'){
            res.setHeader('WWW-Authenticate', 'Basic');
            res.status(401).send('You are not authenticated!');
            // return next(res);
        } else{
            console.error(e);
        }
    }
}

export default {basic};
