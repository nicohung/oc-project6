const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //to validate email before saving to db

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, // the user's email address, unique
    password: { type: String, required: true } // hash of the user's password
});

//checks any field with unique set to true and validate them before saving to db.
userSchema.plugin(uniqueValidator);

//Create a model for sauces collection. Pass the name of the collection, and the schema. 
//Export the model to other files into our app and use it to save, find, get a list of things, etc.
module.exports = mongoose.model('User', userSchema);