var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express - Travel' });
});

router.get('/all', function(req, res, next){
  var db = req.db;
  var collection = db.get('travelcollection');
  collection.find({},{},function(e,docs){
    res.render('travel', {
      "travellist" : docs,
      "title" : "Travel List"
    });
  });
});

router.get('/alljson', function(req, res, next){
  var db = req.db;
  var collection = db.get('travelcollection');
  collection.find({},{},function(e,docs){
    res.send(JSON.stringify(docs, null, 3));
  });
})



module.exports = router;
