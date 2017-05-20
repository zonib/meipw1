var express = require('express');
var crypto = require('crypto');
var cutter = require('utf8-binary-cutter');
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
  collection.find({deleted: null},{},function(e,docs){
    if(!docs){
      res.status(404).send();
      return;
    }

    res.send(JSON.stringify(docs));
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
  collection.findOne({"_id" : id},{},function(e,docs){
    if(!docs){
      res.status(404).send();
      return;
    }

    res.send(JSON.stringify(docs));
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







router.post('/v1/experience', function(req, res, next){

  // var travelid = req.body.travelid;
  // var

});


module.exports = router;
