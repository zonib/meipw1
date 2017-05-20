var express = require('express');
var crypto = require('crypto');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next){
  var username = req.body.user;
  var pw = req.body.pw;

  var db = req.db;
  var collection = db.get('usercollection');
  collection.findOne({"username" : username, "pw": crypto.createHash('md5').update(pw).digest("hex") },{},function(e,docs){
    if(!docs){
      req.flash('error', 'Login incorreto!');
      res.redirect('/');
      return;
    }

    res.redirect('/travel/all');
  });
})


module.exports = router;
