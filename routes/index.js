var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Login 2', errMessage : req.flash('error')});
});


router.post('/', function(req, res, next){

})

module.exports = router;
