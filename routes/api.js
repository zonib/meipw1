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

//Login method
router.post('/v1/login', function(req, res, next){
  var username = req.body.username;
  var pw = req.body.pw;

  if(!username || !pw){
    res.status(400).send(JSON.stringify({ error:{ code: "0x0001"}}));
    return;
  }

  var db = req.db;
  var collection = db.get('usercollection');
  collection.findOne({"username" : username, "pw": crypto.createHash('md5').update(pw).digest("hex") },{},function(e,docs){
    if(!docs){
      res.status(401).send(JSON.stringify({ error:{ code: "0x0002"}}));
      return;
    }

    req.session.userid = docs._id;
    req.session.name = docs.name;

    res.send(JSON.stringify({userid: docs._id, name: docs.name, age: docs.age}));
    return;
  });
});



/**
* @swagger
* definition:
*   Travel:
*     definition:
*       date:
*         type: Date
*       user:
*         type: String
*       description:
*         type: String
*       local:
*         definition:
*           city:
*             type: String
*           country:
*             type: String
*           gps:
*             definition:
*               lat:
*                 type: Number
*               lng:
*                 type: Number
*       deleted:
*         type: Boolean
*/



//add new travel to database
router.post('/v1/travels', function(req, res, next){

  //enable later! disabled while development
  // if(!req.session.userid){
  //   res.status('403').send(JSON.stringify({error: { code: "0x0000"}}));
  //   return;
  // }

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
      res.status('409').send();
    }
    else {
      res.status('201').send();
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
*/
router.get('/v1/travels', function(req, res, next){

  mongoose.model('Travel').find({deleted: {$ne: true}}, function (err, docs) {
    if(!docs){
      res.status(404).send();
      return;
    }

    res.send(docs);
    return;
  });
});

//get single travel
router.get('/v1/travels/:id', function(req, res, next){
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  mongoose.model('Travel').findById(id , function (err, docs) {
    if(!docs){
      res.status(404).send();
      return;
    }

    res.send(docs);
    return;
  });
});

//update travel
router.put('/v1/travels/:id', function(req, res, next){
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  var fields = 0;
  var data = { };
  data.local = {};

  if(req.body.description) data.description = req.body.description;
  if(req.body.country) data.local.country = req.body.country;
  if(req.body.city) data.local.city = req.body.city;
  if(req.body.gps) data.local.gps = req.body.gps;


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
      if(err) res.status(501).send();
      else res.status(200).send();

      return;
    });
  });
});

//delete travel
router.delete('/v1/travels/:id', function(req, res, next) {
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  mongoose.model('Travel').findById(id , function (err, obj) {
    if(!obj){
      res.status(404).send();
      return;
    }

    obj.update({deleted: true}, function (err, blobID) {
      if(err) res.status(501).send();
      else res.status(200).send();

      return;
    });
  });
});

//get travel experiences
router.get('/v1/travels/:travel/experiences/', function(req, res, next){
  var travel = req.params.travel;

  if(cutter.getBinarySize(travel) != 24){
    res.status(400).send();
    return;
  }

  mongoose.model('Travel').findById(travel , function (err, docs) {
    if(!docs){
      res.status(404).send();
      return;
    }

    res.send(docs.experiences);
    return;
  });
});

//add travel a experience
router.post('/v1/travels/:travel/experiences/', function(req, res, next){

  var travelid = req.params.travel;

  if(cutter.getBinarySize(travelid) != 24){
    res.status(400).send();
    return;
  }

  var date = req.body.date;
  var name = req.body.name;
  var narrative = req.body.narrative;
  var gps = req.body.gps;

  if(!date || !name){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
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
      res.status(404).send();
      return;
    }

    docs.experiences.push(data);

    docs.save(function (err) {
      if (err) res.status('409').send();
      res.status('201').send();

      return;
    });
  });
});

//get single experience
router.get('/v1/travels/:travel/experiences/:experience', function(req, res, next){
  var travelid = req.params.travel;
  var experienceid = req.params.experience;

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
router.put('/v1/travels/:travel/experiences/:experience', function(req, res, next){
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
      res.status(404).send();
      return;
    }

    res.send(docs);
    return;
  });
});

//delete experience
router.delete('/v1/travels/:travel/experiences/:experience', function(req, res, next){
  var travelid = req.params.travel;
  var experienceid = req.params.experience;

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
      res.status(404).send();
      return;
    }
    res.send(docs);
    return;
  });
});

module.exports = router;
