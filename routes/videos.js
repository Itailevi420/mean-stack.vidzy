// Importing 'express' exposing it's methods and invoking built-in  'Router()' method.
const express = require('express');
// 'Express' returns an object.
const router = express.Router();

// Importing 'Monk' to read end write documents to MongoDB . (There is another popular persistence module for working with 'Mongo' called 'Mongoose'. )
const monk = require('monk');
// 'Monk' returns a method. 
// We call it to get access to our database.
const db = monk('localhost:27017/vidzy');

// Router handler to grt info from db.
router.get('/', (req, res) => {
  const collection = db.get('videos');
  collection.find({}, (err, videos) => {
    if (err) throw err;
    res.json(videos);
  });
});

// Router handler to post new data to db.
router.post('/', (req, res) => {
  // First we get a reference to the 'videos' collection.
  const collection = db.get('videos');
  // Then use the 'insert' method to add a new document to Mongo.
  // The first argument to this method is a JSON object with two properties: 'title' and 'description'. We read the values for these properties using req.'body'. This object represents the data that will be posted in the body of the request.
  collection.insert({
    title: req.body.title,
    description: req.body.description,
  }, (err, video) => {
    if(err) throw err;
    // we use the json method of the response (res) to return a JSON representation of the new video document.
    res.json(video);
  });
});

// Router handler to GET /api/videos/{id}.
// Note that here we have a route parameter, indicated by a colon (:id). You can access the value of this parameter using 'req.params.id'.
router.get('/:id', (req, res) => {
  const collection = db.get('videos');
  // findOne method of the collection to return only one object.
  // The first argument to this method is the criteria object. So, we’re looking for a document with _id equal to req.params.id.
  collection.findOne({ _id: req.params.id }, (err, video) => {
    if (err) throw err;

    res.json(video);
  });
});

//Router handler to PUT /api/videos/{id}
// Note that we’ve defined this route using router.put. This handler will be called only when there is an HTTP PUT request to this endpoint.
router.put('/:id', (req, res) => {
  // We use the update method of the collection object to update a document.
  const collection = db.get('videos');
  //  We’re trying to update only the document with _id equal to req.params.id
  // The first argument is the criteria object.
  collection.update({
    _id: req.params.id
  },
  //  The second argument represents the values to update.
  // Note if you don't $set it crashes
  { $set: {
    title: req.body.title,
    description: req.body.description,
  }}, (err, video) => {
    if (err) throw err;

    res.json(video);
  });
});

// Trying  to DELETE 
router.delete('/:id', (req, res) => {
  const collection = db.get('videos');
  collection.remove( {
    _id: req.params.id
  }, (err, video) => {
    if (err) throw err;

    res.json(video);
  })
})

module.exports = router;