const Sauce = require('../models/sauces'); //import the model
const multer = require('multer'); //used to handle uploading files
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    //file is the uplaoded file, cb is the callback function called once the filename is determined
    filename: function(req, file, cb) {
        //cs takes an error object (null if no error), and the filename.
        //file.fieldname is the name of the field in the HTML form. 
        //Date.now() generates a timestamp.
        //path.extname takes the file extension of uploaded file.
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image'); //only a single image is accepted, with the field name 'image'

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    //use extname function within the path module, to extract the file extension from file.originalname, convert it to lowercase, test for filetypes, results in TRUE or FALSE
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //tests the MIME type of the file - more accurate, as extension names can be manipulated
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); //pass argument TRUE
    } else {
        cb('Error: Images only!');
    }
}


exports.getAllSauce = (req, res, next) => {
    //leave find() empty to search all the things
    Sauce.find().then(
        //receive an array of sauces if there are any
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};


exports.createSauce = (req, res, next) => {
    
    upload(req, res, (err) => {
        const parsedReq = JSON.parse(req.body.sauce);
        const sauce = new Sauce({
            userId: parsedReq.userId,
            name: parsedReq.name,
            manufacturer: parsedReq.manufacturer,
            description: parsedReq.description,
            mainPepper: parsedReq.mainPepper,
            imageUrl: req.file ? '//localhost:3000/public/uploads/' + req.file.filename : '', //if req.file exits, set imageUrl to req.file.filename
            heat: parsedReq.heat,
        });

        // console.log("request body:", parsedReq);
        // console.log("name:", parsedReq.name);
        // console.log(sauce);

        sauce.save().then(() => {
            res.status(201).json({ message: 'Sauce saved successfully!' });
        }).catch((error) => {
            res.status(400).json({ error: error });
            console.log(error);
        });
    });
};


exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
            // console.log(sauce);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
            console.log(error);
        }
    );
};


exports.modifySauce = (req, res, next) => {
    
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: 'Failed to upload file' });
        };

        // when an image is uploeaded, req.body format changes and needs to be JSON parsed first. 
        if (req.file) {
            const parsedReq = JSON.parse(req.body.sauce);
    
            // Construct updated sauce object
            const updatedSauce = {
                userId: parsedReq.userId,
                name: parsedReq.name,
                manufacturer: parsedReq.manufacturer,
                description: parsedReq.description,
                mainPepper: parsedReq.mainPepper,
                heat: parsedReq.heat,
                imageUrl: '//localhost:3000/public/uploads/' + req.file.filename,
            };

            console.log(req.body.sauce);
            console.log(parsedReq);
    
            // Update sauce in the database
            Sauce.updateOne({_id: req.params.id}, updatedSauce)
                .then(() => {
                    res.status(201).json({ message: 'Sauce updated successfully!' });
                })
                .catch((error) => {
                    res.status(400).json({ error: error });
                    console.log(error);
                });
    
        } else {
    
            // Construct updated sauce object
            const updatedSauce = {
                userId: req.body.userId,
                name: req.body.name,
                manufacturer: req.body.manufacturer,
                description: req.body.description,
                mainPepper: req.body.mainPepper,
                heat: req.body.heat,
            };
    
            // Update sauce in the database
            Sauce.updateOne({_id: req.params.id}, updatedSauce)
                .then(() => {
                    res.status(201).json({ message: 'Sauce updated successfully!' });
                })
                .catch((error) => {
                    res.status(400).json({ error: error });
                    console.log(error);
                });
        }
    });
};


exports.deleteSauce = (req, res, next) => {
    Sauce.deleteOne({_id: req.params.id}).then(
        () => {
          res.status(200).json({
            message: 'Deleted!'
          });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};


exports.likeSauce = (req, res, next) => {
    console.log(req.body);

    const likeValue = req.body.like;
    const userId = req.body.userId;

    let updateLike; 

    if (likeValue === 1) {
        updateLike = {
            $inc: {'likes': 1},
            $push: {'usersLiked': userId},
            $pull: {'usersDisliked': userId}
        };

    // if likeValue = 0, check if the userId is in usersLiked or usersDisliked. 
    // if userId is in usersLiked, increment likes -1
    // if userId is in usersDisliked, increment dislikes -1
    } else if (likeValue === 0) {

        Sauce.findOne({_id: req.params.id})
            .then(sauce => {
                if (sauce.usersLiked.includes(userId)) {
                    updateLike = {
                        $inc: {'likes': -1},
                        $pull: {'usersLiked': userId}
                    };
                } else if (sauce.usersDisliked.includes(userId)) {
                    updateLike = {
                        $inc: {'dislikes': -1},
                        $pull: {'usersDisliked': userId}
                    };
                } else {
                    // If userId is not found in either array, do nothing
                    updateLike = {};
                }

                // Update the document
                Sauce.updateOne({_id: req.params.id}, updateLike)
                    .then(() => {
                        res.status(200).json({
                            message: 'Updated!'
                        });
                    })
                    .catch((error) => {
                        res.status(400).json({
                            error: error
                        });
                        console.log(error);
                    });
            })
            .catch(error => {
                res.status(400).json({
                    error: error
                });
                console.log(error);
            });

    } else if (likeValue === -1) {
        updateLike = {
            $inc: {'dislikes': 1},
            $push: {'usersDisliked': userId},
            $pull: {'usersLiked': userId}
        };
    }

    //update the Sauce if livevalue = 1 or -1
    if (likeValue !== 0) {
        // Update the document
        Sauce.updateOne({_id: req.params.id}, updateLike)
            .then(() => {
                res.status(200).json({
                    message: 'Updated!'
                });
            })
            .catch((error) => {
                res.status(400).json({
                    error: error
                });
                console.log(error);
            });
    }
};