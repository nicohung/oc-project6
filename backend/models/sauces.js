const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true }, // the MongoDB unique identifier for the user who created the sauce
    name: { type: String, required: true }, // name of the sauce
    manufacturer: { type: String, required: true }, // manufacturer of the sauce
    description: { type: String, required: true }, // description of the sauce
    mainPepper: { type: String, required: true }, // the main pepper ingredient in the sauce
    imageUrl: { type: String, required: true }, // the URL for the picture of the sauce uploaded by the user
    heat: { type: Number, required: true, min: 1, max: 10 }, // a number between 1 and 10 describing the sauce
    likes: { type: Number, default: 0 }, // the number of users liking the sauce
    dislikes: { type: Number, default: 0 }, // the number of users disliking the sauce
    usersLiked: { type: [String], default: [] }, // an array of user IDs of those who have liked the sauce
    usersDisliked: { type: [String], default: [] } // an array of user IDs of those who have disliked the sauce
});

//Create a model for sauces collection. Pass the name of the collection, and the schema. 
//Export the model to other files into our app and use it to save, find, get a list of things, etc.
module.exports = mongoose.model('Sauce', sauceSchema);