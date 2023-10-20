const jwt = require('jsonwebtoken');

const jwtDecode = {
    getUserIdFromToken(JWT_KEY, token) {
        return new Promise(function(resolve, reject) {
            token = token.substring(7);

            jwt.verify(token, JWT_KEY, {
                algorithms: ['HS256']
            }, (err, decoded) => {
                if (err) {
                    reject(err);
                }

                resolve(decoded);
            });
        });
    },
};

module.exports = jwtDecode;
