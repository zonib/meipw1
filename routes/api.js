var express = require('express');
var crypto = require('crypto');
var cutter = require('utf8-binary-cutter');
var len = require('object-length');
var ObjectID = require('mongodb').ObjectID;
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

//add new travel to database
router.post('/v1/travels', function(req, res, next){

  //enable later! disabled while development
  // if(!req.session.userid){
  //   res.status('403').send(JSON.stringify({error: { code: "0x0000"}}));
  //   return;
  // }

  var local = req.body.local;
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
  data.userid = req.session.userid ? req.session.userid  : '1';
  data.description = description;
  data.date = date;

  data.local = {};
  if(gps) data.local.gps = gps;
  if(country) data.local.country = country;
  if(city) data.local.city = city;

  var db = req.db,
  collection = db.get("travelcollection"),
  inserted = true;

  try {
    collection.insert(data);
  } catch (err) {
    inserted = false;
  }

  if(inserted) res.status('201').send();
  else res.status('409').send();

  return;
});

//get all travels
router.get('/v1/travels', function(req, res, next){
  var collection = req.db.get('travelcollection');
  collection.find({deleted: null}, "-experiences",function(e,docs){
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

  var collection = req.db.get('travelcollection');
  collection.findOne({ "_id" : id }, '-experiences',function(e,docs){
    if(!docs){
      res.status(204).send();
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

  if(req.body.description) data.description = req.body.description;
  if(req.body.country) data.local.country = req.body.country;
  if(req.body.city) data.local.city = req.body.city;
  if(req.body.gps) data.local.gps = req.body.gps;


  if(data.length == 0){
    res.status(400).send();
    return;
  }

  var updated = true;
  var collection = req.db.get('travelcollection');

  try {
    collection.findOneAndUpdate({"_id" : id},{ $set : data});
  } catch (err) {
    updated = false;

  } finally {

    if(updated) res.status(200).send();
    else res.status(501).send();

    return;
  }

});

//delete travel
router.delete('/v1/travels/:id', function(req, res, next) {
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  var deleted = true;

  var collection = req.db.get('travelcollection');
  try {
    collection.findOneAndUpdate({"_id" : id},{ $set : { deleted: 1 }});
  } catch (err) {
    deleted = false;

  } finally {

    if(deleted) res.status(200).send();
    else res.status(501).send();

    return;
  }
});

//get travel experiences
router.get('/v1/travels/:travel/experiences/', function(req, res, next){
  var travel = req.params.travel;

  if(cutter.getBinarySize(travel) != 24){
    res.status(400).send();
    return;
  }

  var collection = req.db.get('travelcollection');
  collection.find({ "_id": travel}, 'experiences' ,function(e,docs){
    if(!docs){
      res.status(204).send();
      return;
    }

    res.send(docs);
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
  data._id = new ObjectID();
  data.date = date;
  data.name = name;
  if(narrative) data.narrative = narrative;
  if(gps) data.gps = gps;

  collection = req.db.get("travelcollection");
  inserted = true;

  try {
    collection.findOneAndUpdate({"_id" : travelid},{ $push : { "experiences" : data }});
  } catch (err) {
    inserted = false;
  }

  if(inserted) res.status('201').send();
  else res.status('409').send();

  return;
});

//get single experience
router.get('/v1/experiences/:experience', function(req, res, next){
  var id = req.params.experience;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  var collection = req.db.get('travelcollection');
  collection.findOne( { "experiences._id": ObjectID(id)},  "experiences.$" , function(e,docs){
    if(!docs){
      res.status(204).send();
      return;
    }

    res.send(docs.experiences[0]);
    return;
  });

});

//update experience
router.put('/v1/experiences/:experience', function(req, res, next){
  var id = req.params.experience;

  if(cutter.getBinarySize(id) != 24){
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

  var updated = true;
  var collection = req.db.get('travelcollection');
  var error;

  try {
    collection.findOneAndUpdate({ "experiences._id": ObjectID(id)},  { "experiences": data});
  } catch (err) {
    error = err;
    updated = false;
  } finally {

    if(updated) res.status(200).send("");
    else res.status(501).send(JSON.stringify(error));

    return;
  }
});


//delete experience
router.delete('/v1/experiences', function(req, res, next){

});


module.exports = router;
