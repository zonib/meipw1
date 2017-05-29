var express = require('express'),
crypto = require('crypto'),
cutter = require('utf8-binary-cutter'),
len = require('object-length'),
ObjectId = require('mongodb').ObjectID,
mongoose = require('mongoose');
Travel = mongoose.model('Travel');
// var Travels = require('../model/travel');
// var ObjectID = require('mongodb').ObjectID;
var router = express.Router();

/**
* @swagger
* definition:
*       GPS:
*         type: object
*         properties:
*           lat:
*             type: number
*           lng:
*             type: number
*/

/**
* @swagger
* definition:
*   Local:
*     type: object
*     properties:
*       city:
*         type: string
*       country:
*         type: string
*       gps:
*         $ref: '#/definitions/GPS'
*/

/**
* @swagger
* definition:
*   Experience:
*     type: object
*     properties:
*       date:
*         type: string
*         format: date-time
*       narrative:
*         type: string
*       gps:
*         $ref: '#/definitions/GPS'
*       deleted:
*         type: boolean
*/

/**
* @swagger
* definition:
*   Travel:
*     type: object
*     properties:
*       date:
*         type: string
*         format: date-time
*       user:
*         type: string
*       description:
*         type: string
*       local:
*         $ref: '#/definitions/Local'
*       experiences:
*         type: array
*         items:
*           $ref: '#/definitions/Experience'
*       deleted:
*         type: boolean
*/

//add new travel to database
/**
* @swagger
* /api/v1/travels:
*   post:
*     tags:
*       - Travels
*     description: Creates a new travel
*     produces:
*       - application/json
*     parameters:
*       - name: description
*         description: travel description
*         in: body
*         required: true
*       - name: date
*         description: travel date
*         in: body
*         required: true
*       - name: city
*         description: travel city destination
*         in: body
*         required: true
*       - name: country
*         description: travel country destination
*         in: body
*         required: true
*       - name: gps
*         description: travel coordinates
*         in: body
*         required: false
*         schema:
*           $ref: '#/definitions/GPS'
*     deprecated: true
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad requeste / missing parameters
*       500:
*         description: failed to add travel
*/
router.post('/v1/travels/', function(req, res, next){

  var description = req.body.description;
  var date = req.body.date;
  var city = req.body.city;
  var country = req.body.country;
  var gps = req.body.gps;

  if(((!city && !country) && !gps ) || !description || !date){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  var data = {};
  data.date = date;
  data.user = req.session.userid ? req.session.userid: "1";
  data.description = description;


  data.local = {};
  if(gps) data.local.gps = gps;
  if(country) data.local.country = country;
  if(city) data.local.city = city;

  mongoose.model('Travel').create(data, function(err, obj) {
    if(err){
      res.status('500').send();
    }
    else {
      res.status('201').send();
    }

    return;
  })

});

//add new travel to database
/**
* @swagger
* /api/v2/travels:
*   post:
*     tags:
*       - Travels
*     description: Creates a new travel
*     produces:
*       - application/json
*     parameters:
*       - name: travel
*         description: travel object
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/Travel'
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad requeste / missing parameters
*       500:
*         description: failed to add travel
*/
router.post('/v2/travels/', function(req, res, next){

  var travel = req.body;

  if(!travel.description || !travel.date || !travel.local){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  mongoose.model('Travel').create(travel, function(err, obj) {
    if(err){
      res.status('500').send(JSON.stringify(err));
    }
    else {
      res.status('201').send({});
    }

    return;
  })

});

//get all travels
/**
* @swagger
* /api/v1/travels:
*   get:
*     tags:
*       - Travels
*     description: Returns all Travels
*     produces:
*       - application/json
*     responses:
*       200:
*         description: An array of travels
*         schema:
*           $ref: '#/definitions/Travel'
*       204:
*         description: no content / No travels
*/
router.get('/v1/travels', function(req, res, next){

  mongoose.model('Travel').find({deleted: {$ne: true}}, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    res.send(docs);
    return;
  });
});

//get single travel
/**
* @swagger
* /api/v1/travels/{id}:
*   get:
*     tags:
*       - Travels
*     description: Returns a single travel
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: A single travel
*         schema:
*           $ref: '#/definitions/Travel'
*       204:
*         description: travel not found
*       400:
*         description: bad requeste / invalid id
*/
router.get('/v1/travels/:id', function(req, res, next){
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  mongoose.model('Travel').findOne({_id:id,  "deleted": { $ne: true }}, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    res.send(docs);
    return;
  });
});

//update travel
//add new travel to database
/**
* @swagger
* /api/v1/travels/{id}:
*   put:
*     tags:
*       - Travels
*     description: updates a travel
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: travels id
*         in: path
*         required: true
*       - name: description
*         description: travel description
*         in: body
*         required: false
*       - name: local
*         description: travel coordinates
*         in: body
*         required: false
*         schema:
*           $ref: '#/definitions/Local'
*     responses:
*       200:
*         description: Successfully updated
*       204:
*         description: travel not found
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to update travel
*/
router.put('/v1/travels/:id', function(req, res, next){
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  var fields = 0;
  var data = { };

  if(req.body.description) data.description = req.body.description;
  if(req.body.country) data.local.country = req.body.country;
  if(req.body.city) data.local.city = req.body.city;
  if(req.body.local) data.local.local = req.body.local;


  if(data.length == 0){
    res.status(400).send();
    return;
  }

  mongoose.model('Travel').findById(id , function (err, obj) {
    if(!obj){
      res.status(404).send();
      return;
    }

    obj.update(data, function (err, blobID) {
      if(err) res.status(500).send();
      else res.status(200).send();

      return;
    });
  });
});

//delete travel
/**
* @swagger
* /api/v1/travels/{id}:
*   delete:
*     tags:
*       - Travels
*     description: delete a travel
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: travels id
*         in: path
*         required: true
*     responses:
*       200:
*         description: Successfully deleted
*       204:
*         description: travel not found
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to delete travel
*/
router.delete('/v1/travels/:id', function(req, res, next) {
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  mongoose.model('Travel').findById(id , function (err, obj) {
    if(!obj){
      res.status(204).send();
      return;
    }

    obj.update({deleted: true}, function (err, blobID) {
      if(err) res.status(500).send();
      else res.status(200).send();

      return;
    });
  });
});

//get travel experiences
/**
* @swagger
* /api/v1/travels/{id}/experiences:
*   get:
*     tags:
*       - Experiences
*     description: Returns all Travel experiences
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*     produces:
*       - application/json
*     responses:
*       200:
*         description: An array of travel experiences
*         schema:
*           type: array
*           items:
*             $ref: '#/definitions/Experience'
*       204:
*         description: no content / No experiences
*       400:
*         description: bad request / missing parameters
*/
router.get('/v1/travels/:id/experiences/', function(req, res, next){
  var travel = req.params.id;

  if(cutter.getBinarySize(travel) != 24){
    res.status(400).send();
    return;
  }

  mongoose.model('Travel').findById(travel , function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    res.send(docs.experiences);
    return;
  });
});

//add travel a experience
/**
* @swagger
* /api/v1/travels/{id}/experiences:
*   post:
*     tags:
*       - Experiences
*     description: Creates a new experience on travel
*     consumes:
*       - application/json
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: travel id to add experience
*         in: path
*         required: true
*       - name: narrative
*         description: experience description
*         in: body
*         required: true
*       - name: date
*         description: experience date
*         in: body
*         required: true
*       - name: gps
*         description: experience coordinates
*         in: body
*         required: false
*         schema:
*           $ref: '#/definitions/GPS'
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad requeste / missing parameters
*       500:
*         description: failed to create experience
*/
router.post('/v1/travels/:id/experiences/', function(req, res, next){

  var travelid = req.params.id;

  if(cutter.getBinarySize(travelid) != 24){
    res.status(400).send();
    return;
  }

  var date = req.body.date;
  var name = req.body.name;
  var narrative = req.body.narrative;
  var gps = req.body.gps;

  if(!date || !name){
    res.status(400).send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  var data = {};
  data._id = mongoose.Types.ObjectId(),
  data.date = date;
  data.name = name;
  if(narrative) data.narrative = narrative;
  if(gps) data.gps = gps;

  mongoose.model('Travel').findById(travelid, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    docs.experiences.push(data);

    docs.save(function (err) {
      if (err) res.status(500).send();
      res.status(201).send();

      return;
    });
  });
});

//get single experience
/**
* @swagger
* /api/v1/travels/{id}/experiences/{eid}:
*   get:
*     tags:
*       - Experiences
*     description: Returns a single experience
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*       - name: eid
*         description: experience id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: A single experience
*         schema:
*           $ref: '#/definitions/Experience'
*       204:
*         description: travel/experience not found
*       400:
*         description: bad requeste / invalid id's
*/
router.get('/v1/travels/:id/experiences/:eid', function(req, res, next){
  var travelid = req.params.id;
  var experienceid = req.params.eid;

  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24){
    res.status(400).send();
    return;
  }

  Travel.findOne({ _id: travelid, "experiences._id": mongoose.Types.ObjectId(experienceid), "experiences.deleted": { $ne: true} }, { "experiences.$" : 1}, function (err, docs) {
    if(!docs.experiences[0]){
      res.status(404).send();
      return;
    }
    res.send(docs.experiences[0]);
    return;
  });
});

//update experience
/**
* @swagger
* /api/v1/travels/{id}/experiences/{eid}:
*   put:
*     tags:
*       - Experiences
*     description: updates a experience
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: travel id to add experience
*         in: path
*         required: true
*       - name: eid
*         description: experience id to update
*         in: path
*         required: true
*       - name: narrative
*         description: experience description
*         in: body
*         required: true
*       - name: date
*         description: experience date
*         in: body
*         required: true
*       - name: gps
*         description: experience coordinates
*         in: body
*         required: false
*         schema:
*           $ref: '#/definitions/GPS'
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad requeste / missing parameters
*       500:
*         description: failed to create experience
*/
router.put('/v1/travels/:id/experiences/:eid', function(req, res, next){
  var travelid = req.params.travel;
  var experienceid = req.params.experience;

  if(cutter.getBinarySize(travelid) != 24 || cutter.getBinarySize(experienceid) != 24){
    res.status(400).send();
    return;
  }

  var date = req.body.date;
  var name = req.body.name;
  var narrative = req.body.narrative;
  var gps = req.body.gps;

  var data = {};
  if(date) data.date = date;
  if(name) data.name = name;
  if(narrative) data.narrative = narrative;
  if(gps) data.gps = gps;

  if(len(data) == 0){
    res.status(400).send();
    return;
  }

  Travel.findOneAndUpdate({ _id: travelid, "experiences._id": mongoose.Types.ObjectId(experienceid) }, {
    "$set": {
      "experiences.$": data
    }
  },
  function (err, docs) {
    if(!err){
      res.status(204).send();
      return;
    }

    res.send(docs);
    return;
  });
});

//delete experience
/**
* @swagger
* /api/v1/travels/{id}/experiences/{eid}:
*   delete:
*     tags:
*       - Experiences
*     description: delete a experience
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*       - name: eid
*         description: experience id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: Successfully deleted
*       204:
*         description: travel/experience not found
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to delete travel
*/
router.delete('/v1/travels/:id/experiences/:eid', function(req, res, next){
  var travelid = req.params.id;
  var experienceid = req.params.eid;

  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24){
    res.status(400).send();
    return;
  }

  Travel.findOneAndUpdate({ _id: travelid, "experiences._id": mongoose.Types.ObjectId(experienceid) }, {
    "$set": {
      "experiences.$.deleted": true
    }
  },
  function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }
    res.send(docs);
    return;
  });
});

module.exports = router;
