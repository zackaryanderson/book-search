const jwt = require('jsonwebtoken');

const secret = "secrettt";
const expiration = '2h';

module.exports = {
    signToken: function({ username, email, _id }) {
        const payload = { username, email, _id };

        return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    },
    authMiddleWare: function({ req }) {
        //allows token to be send via req.body, req.query, or headers
        let token = req.body.token || req.query.token || req.headers.authorization;

        //separate "bearer" from "<tokenval>"
        if (req.headers.authorization) {
            token = token
                .split(' ')
                .pop()
                .trim();
        }

        //if no token return req obj as is
        if (!token) {
            return req;
        }

        try {
            //decode and attach user data to req obj
            const {data} = jwt.verify(token, secret, { maxAge: expiration });
            req.user = data;
        } catch {
            console.log('Invalid token');
        }

        //return updated req obj
        return req;
    }
};