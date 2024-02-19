//middleware - checks incoming request for a token, validate the token,
//decode it, check if the userId encoded within it is the same as userId in the body of the request.
//if everything is fine, authenticate, everything passes along. Otherwise refuse access.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log('error 0');
    try {
        //get the token from the request, without the 'bearer' keyword. 
        //split at the space between bearer and token.
        console.log('error 1');
        const token = req.headers.authorization?.split(' ')[1];
        console.log(req.headers.authorization);
        console.log(token);

        //decode the token, verify takes token to be verfied and the string used to encode it.
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        console.log(decodedToken);

        //extract user id from the decoded token
        const userId = decodedToken.userId;
        console.log('error 3', userId);

        //if the req body has an user id, AND if the req user id is not the same as the decoded one
        //if not the same, throw error, otherwise allow execution to the next piece of middleware
        if(req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user ID';
        } else {
            next();
        }

    } catch (error){
        res.status(401).json({
            error: new Error('Invalid request')
        });

        console.log(error);
    }
    
};