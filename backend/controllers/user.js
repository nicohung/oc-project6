const User =  require('../models/users'); //import the model
const bcrypt = require('bcrypt'); //import bcrypt for encryption. installed with npm.
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {
    //get the email and password from the request body, and hash it. 
    //pass it to the hash function, with level of salt (the higher the more time it will take, 10 is enough for most usage)
    //hash function returns a promise, which we resolve with .then and .error
    bcrypt.hash(req.body.password, 10).then(
        //.then receives the hash, used for the password when creating a new user
        (hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
            });
            //save to the db
            //returns another promise
            user.save().then(
                () => {
                    res.status(201).json({
                        message: 'User added successfully!'
                    });
                }
            ).catch(
                (error) => {
                    res.status(500).json({
                        error: error
                    });
                }
            );
        }
    );
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }).then(
        (user) => {
            //if there is no match, return 401 status and error message
            if (!user) {
                //return stops the execution of the function, otherwise the rest of the function will try to run and throw an error
                return res.status(401).json({
                    error: new Error('User not found!')
                });
            }
            //check for the password if email matches, compare hashes. 
            bcrypt.compare(req.body.password, user.password).then(
                (valid) => {
                    if (!valid) {
                        return res.status(401).json({
                            error: new Error('Incorrect password')
                        });
                    }

                    //sign method takes: json object with any data we want to encode into the token,
                    //secret key for hashing - recommended very long and random string - used to insure no-one can guess the string to fake tokens, 
                    //token expiration
                    const token = jwt.sign(
                        { userId: user._id }, 
                        'RANDOM_TOKEN_SECRET', 
                        {expiresIn: '24h'}
                        );
                    
                    //if password matches, send 200 status.
                    //json expects a json object with 2 fields - user id, and a token.
                    res.status(200).json({
                        userId: user._id,
                        token: token, 
                        //need a token to check and verify every request from the frontend is a valid request (after login). Install jasonwebtoken with npm.
                        //token used to check if user is logged in correctly. 
                        //token allows us to check if the user is allowed to modify or delete things. If the user id is not the same as the creator's, then they can't edit.
                    })

                }
            //handle bcrypt error
            ).catch(
                (error) => {
                    res.status(500).json({
                        error: error
                    });
                }
            );
        }
    //handle mongoose error
    ).catch(
        (error) => {
            res.status(500).json({
                error: error
            });
        }
    );

};