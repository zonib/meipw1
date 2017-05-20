var express = require('express');
var crypto = require('crypto');
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
router.post('/v1/travel', function(req, res, next){

  //enable later! disabled while development
  // if(!req.session.userid){
  //   res.status('403').send(JSON.stringify({error: { code: "0x0000"}}));
  //   return;
  // }

  var local = req.body.local;
  var description = req.body.description;
  var date = req.body.date;

  if(!local || ((!local.city && !local.country) && !local.gps )|| !description || !date){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  var db = req.db;
  var collection = db.get("travelcollection");

  var inserted = true;

  try {
    collection.insert({userid: req.session.userid ? req.session.userid  : '1', description: description, date: date, local: local });
  } catch (err) {
    inserted = false;
  }

  if(inserted) res.status('201').send();
  else res.status('409').send();

  return;
});


module.exports = router;
