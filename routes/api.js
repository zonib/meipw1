var express = require('express'),
crypto = require('crypto'),
cutter = require('utf8-binary-cutter'),
len = require('object-length'),
ObjectId = require('mongodb').ObjectID,
mongoose = require('mongoose');
User = mongoose.model('User');
Media = mongoose.model('Media');
Experience = mongoose.model('Experience');
Travel = mongoose.model('Travel'),
FriendsRequest = mongoose.model('FriendsRequest'),
formidable = require('formidable'),
fs = require('fs');

var router = express.Router();

/*MODELS SWAGGER*/

/**
* @swagger
* definition:
*       SingleNumberValue:
*         type: object
*         properties:
*           value:
*             type: number
*/

/**
* @swagger
* definition:
*       SingleStringValue:
*         type: object
*         properties:
*           value:
*             type: string
*/

/**
* @swagger
* definition:
*       Rating:
*         type: object
*         properties:
*           value:
*             type: number
*/

/**
* @swagger
* definition:
*       Error:
*         type: object
*         properties:
*           code:
*             type: string
*/

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
*       Rate:
*         type: object
*         properties:
*           description:
*             type: string
*           value:
*             type: number
*             enum: [1, 2, 3]
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
*       User:
*         type: object
*         properties:
*           email:
*             type: string
*           firstName:
*             type: string
*           lastName:
*             type: string
*           birthdate:
*             type: string
*             format: date-time
*           country:
*             type: string
*           city:
*             type: string
*           district:
*             type: string
*           pwd:
*             type: string
*           badges:
*             type: array
*           credits:
*             type: number
*/

/**
* @swagger
* definition:
*       Media:
*         type: object
*         properties:
*           valueobj:
*             type: string
*           typeof:
*             type: string
*             enum: [ photo, video, audio, text]
*           date:
*             type: string
*             format: date-time
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
*       weather:
*         type: string
*         enum: [ 'Rain', 'Sunny']
*       gps:
*         $ref: '#/definitions/GPS'
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
*/

/*END MODELS SWAGGER*/

/*USERS*/
//registuser
/**
* @swagger
* /api/v1/users:
*   post:
*     tags:
*       - Users
*     description: Creates a new user
*     produces:
*       - application/json
*     parameters:
*       - name: body
*         description: user object
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/User'
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add travel
*/
router.post('/v1/users/', function(req, res, next){
  var user = req.body;

  if(len(user) == 0){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  User.create(user, function(err, obj) {
    if(err){
      res.status('500').send(JSON.stringify(err));
    }
    else {
      res.status('201').send({});
    }

    return;
  });
});

//login
/**
* @swagger
* /api/v1/users/login:
*   post:
*     tags:
*       - Users
*     description: Login
*     consumes:
*       - application/x-www-form-urlencoded
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: user email
*         in: formData
*         required: true
*         type: string
*       - name: pwd
*         description: user password
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Successfully login
*       401:
*         description: failed login
*/
router.post('/v1/users/login', function(req, res, next){
  var email = req.body.email;
  var pwd = req.body.pwd;

  User.findOne({ email: email, pwd: pwd }, { friends: 0, __v: 0}, function(err, obj) {
    if(!obj){
      res.status(401).send({});
      return;
    }

    var token = 1;
    res.status(200).send(obj);
    return;
  });

});

//getuser
/**
* @swagger
* /api/v1/users/{id}/:
*   get:
*     tags:
*       - Users
*     description: get user
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: users id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: Successfully return
*       400:
*         description: bad request / missing parameters
*       204:
*         description: failed to get user
*/
router.get('/v1/users/:id', function(req, res, next){
  var id = req.params.id;

  if(len(id) == 0){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  User.findById(id, function(err, obj) {
    if(!obj){
      res.status('204').send({});
    }
    else {
      res.status('201').send(obj);
    }
    return;
  });
});

//getuser by name
/**
* @swagger
* /api/v1/users/{name}/search:
*   get:
*     tags:
*       - Users
*     description: get user
*     produces:
*       - application/json
*     parameters:
*       - name: name
*         description: nome para Pesquisar
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: Successfully return
*       400:
*         description: bad request / missing parameters
*       204:
*         description: failed to get user
*/
router.get('/v1/users/:name/search', function(req, res, next){
  var name = req.params.name;

  if(len(name) == 0){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  User.find({ $or:[ {firstName: new RegExp('^' + name + '$', "i")}, {lastName: new RegExp('^' + name + '$', "i")} ], deleted: { $ne: true } }, function(err, obj) {
    if(!obj){
      res.status('204').send(err);
    }
    else {
      res.status('201').send(obj);
    }
    return;
  });
});

//getuser friends
/**
* @swagger
* /api/v1/users/{id}/friends:
*   get:
*     tags:
*       - Users
*     description: get user
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: users id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: Successfully return
*       400:
*         description: bad request / missing parameters
*       204:
*         description: failed to get user
*/
router.get('/v1/users/:id/friends', function(req, res, next){
  var id = req.params.id;

  if(len(id) == 0){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  User.findById(id, { friends: 1 , _id: 0 }, function(err, obj) {
    if(!obj){
      res.status('204').send({});
    }
    else {
      res.status('201').send(obj);
    }
    return;
  });
});

//getuser friends request
/**
* @swagger
* /api/v1/users/{id}/request:
*   get:
*     tags:
*       - Users
*     description: get user
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: users id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: Successfully return
*       400:
*         description: bad request / missing parameters
*       204:
*         description: failed to get user
*/
router.get('/v1/users/:id/request', function(req, res, next){
  var id = req.params.id;

  if(len(id) == 0){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  FriendsRequest.find( { $and: [ { deleted: {$ne: true} }, { accepted: {$ne: true} }, { receiver: id } ]}, { accepted: 0, deleted: 0 }, function(err, obj){
    if(!obj) res.status(204).send([]);
    else res.status(200).send(obj);
    return;
  });
});

//new request
/**
* @swagger
* /api/v1/users/{id}/request:
*   post:
*     tags:
*       - Users
*     description: insert a friends request
*     consumes:
*       - text
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: user id
*         in: path
*         required: true
*         type: string
*       - name: body
*         description: sender id
*         in: body
*         required: true
*         schema:
*           type: string
*     responses:
*       201:
*         description: Successfully created
*       208:
*         description: already exists
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add request
*/
router.post('/v1/users/:id/request', function(req, res, next){
  var friendrequest;
  friendrequest.receiver = req.params.id;
  friendrequest.requestr = req.body;

  if(len(friendrequest) == 0){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  FriendsRequest.find({
    $or:[
      { $and: [ { receiver: friendrequest.receiver }, { requestr: friendrequest.requestr }] },
      { $and: [ { requestr: friendrequest.receiver }, { receiver: friendrequest.requestr }] }
    ]
  }, function(err, obj){
    if(!obj){
      FriendsRequest.create(friendrequest, function(err, obj) {
        if(err || !obj){
          res.status(500).send(JSON.stringify(err));
        }
        else {
          res.status(201).send(obj);
        }
        return;
      });
    }
    else {
      res.status(208).send({});
      return;
    }
  });
});

//accept/decline request
/**
* @swagger
* /api/v1/users/{id}/request/{idreq}:
*   put:
*     tags:
*       - Users
*     description: accept/decline friendrequest
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: user id
*         in: path
*         required: true
*         type: string
*       - name: idreq
*         description: req id
*         in: path
*         required: true
*         type: string
*     responses:
*       201:
*         description: Successfully accepted/declined
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to accepte/decline
*/
router.put('/v1/users/:id/request/:id', function(req, res, next){
  var id = req.params.id;
  var reqid = req.params.reqid;

  if(cutter.getBinarySize(reqid) != 24 || cutter.getBinarySize(id) != 24){
    res.status(400).send({});
    return;
  }

  FriendsRequest.findById(reqid, function(err, obj){
    obj.accept(function(result) {
      res.status(200).send(obj);
      return;
    });
  });
})

//add/remove credits
/**
* @swagger
* /api/v1/users/{id}/credits:
*   put:
*     tags:
*       - Users
*     description: add / remove credits
*     consumes:
*       - application/json
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: users id
*         in: path
*         required: true
*         type: string
*       - name: body
*         description: credits
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/SingleNumberValue'
*     responses:
*       201:
*         description: Successfully added
*       204:
*         description: user not found
*/
router.put('/v1/users/:id/credits', function(req, res, next){
  var id = req.params.id;
  var creditstoadd = req.body.value;

  console.log(creditstoadd);

  User.findById(id, function(err, obj) {
    if(!obj){
      res.status(204).send();
      return;
    }

    obj.credits += creditstoadd;
    obj.save(function(err, obj){
      if(!err && obj){
        res.status(201).send(obj);
        return;
      }

      res.status(204).send();
      return;
    })
  });
});

//add badges
/**
* @swagger
* /api/v1/users/{id}/badges/:
*   put:
*     tags:
*       - Users
*     description: add / remove credits
*     consumes:
*       - application/json
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: users id
*         in: path
*         required: true
*         type: string
*       - name: body
*         description: credits
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/SingleStringValue'
*     responses:
*       200:
*         description: Successfully added / removed
*       204:
*         description: user not found
*/
router.put('/v1/users/:id/badges/', function(req, res, next){
  var id = req.params.id;
  var badge = req.body.value;

  User.findById(id, function(err, obj) {
    if(!obj){
      res.status(204).send();
      return;
    }

    if(obj.badges.indexOf(badge) < 0)  obj.badges.push(badge);

    obj.save(function(err, obj){
      if(!err){
        res.status(200).send(obj);
        return;
      }

      res.status(500).send();
      return;
    })
  });
});

/*END USERS*/


/*TRAVELS*/
//add new travel to database
/**
* @swagger
* /api/v1/travels:
*   post:
*     tags:
*       - Travels
*     description: Creates a new travel
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add travel
*     deprecated: true
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

  Travel.create(data, function(err, obj) {
    if(err){
      res.status('500').send();
    }
    else {
      res.status('201').send();
    }

    return;
  })

});

//add new travel to database V2
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
*         description: bad request / missing parameters
*       500:
*         description: failed to add travel
*/
router.post('/v2/travels/', function(req, res, next){

  var travel = req.body;

  if(!travel.description || !travel.date || !travel.local){
    res.status('400').send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  Travel.create(travel, function(err, obj) {
    if(err){
      res.status('500').send(JSON.stringify(err));
    }
    else {
      res.status('201').send(obj);
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

  Travel.find({deleted: {$ne: true}}, { "experiences": 0, "deleted": 0, shared: 0}, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    res.send(docs);
    return;
  });
});

//get friend travels
/**
* @swagger
* /api/v1/travels/user/{id}:
*   get:
*     tags:
*       - Travels
*     description: Returns friends travels
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: friend id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: A array of travel
*         schema:
*           $ref: '#/definitions/Travel'
*       204:
*         description: travel not found
*       400:
*         description: bad request / invalid id
*/
router.get('/v1/travels/user/:id', function(req, res, next){
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send({});
    return;
  }

  Travel.find( {deleted: {$ne: true},  shared: true, user: id }, { "experiences": 0, "deleted": 0, shared: 0}, {sort: {date: -1}}, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    res.send(docs);
    return;
  });

});

//get travel firt moment img
/**
* @swagger
* /api/v1/travels/{id}/firstmedia:
*   get:
*     tags:
*       - Travels
*     description: get travel first image type media
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: travels id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: first media
*       204:
*         description: no content / No media
*/
router.get('/v1/travels/:id/firstmedia', function(req, res, next){

  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send({});
    return;
  }

  Travel.findOne({_id: id, deleted: {$ne: true} }, {experiences: 1}, function (err, docs) {
    if(!docs) return res.status(204).send();

    if(!docs.experiences) return res.status(200).send([]);

    var arrExp = docs.experiences;
    var i = 0;

    for(var i = 0, s = arrExp.length; i < s; i++){
      if(!arrExp[i].deleted && arrExp[i].medias.length > 0){
        var arrMed = arrExp[i].medias;
        for(var ii = 0, ss = arrMed.length; ii < ss; ii++){
          if(!arrMed[ii].deleted && arrMed[ii].typeof && arrMed[ii].typeof.indexOf("image") > -1){
            return res.status(200).sendFile(req.defaultUpload + arrMed[ii].path);
          }
        }
      }
    }

    res.status(204).send(docs);
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
*         description: bad request / invalid id
*/
router.get('/v1/travels/:id', function(req, res, next){
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  Travel.findOne({_id:id,  "deleted": { $ne: true }}, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    docs.experiences = undefined;
    res.send(docs);
    return;
  });
});

//update travel
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
*         type: string
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add travel
*     deprecated: true
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

  Travel.findById(id , function (err, obj) {
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

//update travel V2
/**
* @swagger
* /api/v2/travels/{id}:
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
*         type: string
*       - name: travel
*         description: travel coordinates
*         in: body
*         required: false
*         schema:
*           $ref: '#/definitions/Travel'
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
router.put('/v2/travels/:id', function(req, res, next){
  var id = req.params.id;
  var travel = req.body;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  if(len(travel) == 0){
    res.status(400).send();
    return;
  }

  Travel.findById(id , function (err, obj) {
    if(!obj){
      res.status(404).send();
      return;
    }

    // res.status(204).send();
    // return;
    obj.update(travel, function (err, blobID) {
      if(err) res.status(500).send({});
      else res.status(200).send({});

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
*         type: string
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

  Travel.findById(id , function (err, obj) {
    if(!obj){
      res.status(204).send();
      return;
    }

    obj.delete(function () {
      res.status(200).send({});
    });
  });
});

//get travel rates
/**
* @swagger
* /api/v1/travels/{id}/rates:
*   get:
*     tags:
*       - Travels
*     description: Returns a  travel rating
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
*         description: travel ratings
*       204:
*         description: travel not found
*       400:
*         description: bad request / invalid id
*/
router.get('/v1/travels/:id/rates', function(req, res, next){
  var id = req.params.id;

  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  Travel.findOne({_id:id,  "deleted": { $ne: true }}, { classifications: 1 }, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    // var rating = 0;
    // for(var i = 0, s = docs.experiences.length; i < s; i++) if(!docs.experiences[i].deleted) for(var k = 0, ss = docs.experiences[i].classifications.length; k < ss; k++) if(!docs.experiences[i].classifications[k].deleted) rating += eval(docs.experiences[i].classifications[k].value);

    // res.status(200).send("{ value: " + rating + " }");
    res.status(200).send(docs.classifications);
    // 5926f80d81ccd70570c1bbab
    return;
  });
});

//share travel
/**
* @swagger
* /api/v1/travels/{id}/share:
*   put:
*     tags:
*       - Travels
*     description: shares a travel
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: travels id
*         in: path
*         required: true
*         type: string
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
router.put('/v1/travels/:id/share', function(req, res, next){
  var id = req.params.id;


  if(cutter.getBinarySize(id) != 24){
    res.status(400).send();
    return;
  }

  Travel.findById(id , function (err, obj) {
    if(!obj){
      res.status(404).send();
      return;
    }

    obj.shared = true;

    obj.save(function (err, obj) {
      if(err) res.status(500).send({});
      else res.status(200).send(obj);

      return;
    });
  });
});

/*END TRAVELS*/


/*EXPERIENCES*/

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

  Travel.findById(travel, function (err, docs) {
    if(!docs){
      res.status(204).send(docs);
      return;
    }

    var rExp = [];

    for(var i = 0, s = docs.experiences.length; i < s; i++) if(!docs.experiences[i].deleted) {
      docs.experiences[i].medias = undefined;
      docs.experiences[i].classifications = undefined;
      rExp.push(docs.experiences[i]);
    }

    res.send(rExp);
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
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add travel
*     deprecated: true
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

  Travel.findById(travelid, function (err, docs) {
    if(!docs){
      res.status(204).send();
      return;
    }

    docs.experiences.push(data);

    docs.save(function (err) {
      if (err) res.status(500).send();
      res.status(201).send(data);

      return;
    });
  });
});

//add travel a experience V2
/**
* @swagger
* /api/v2/travels/{id}/experiences:
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
*         type: string
*       - name: body
*         description: experience object
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/Experience'
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to create experience
*/
router.post('/v2/travels/:id/experiences/', function(req, res, next){

  var travelid = req.params.id;
  var experience = req.body;

  if(cutter.getBinarySize(travelid) != 24){
    res.status(400).send();
    return;
  }

  if(len(experience) == 0){
    res.status(400).send(JSON.stringify({ error: { code: "0x0001"}}));
    return;
  }

  experienceobj = new Experience(experience);

  Travel.findById(travelid, function (err, docs) {
    if(!docs){
      res.status(204).send({});
      return;
    }

    docs.experiences.push(experienceobj);

    docs.save(function (err) {
      if (err) res.status(500).send(JSON.stringify(err));
      res.status(201).send(experienceobj);

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
*         description: bad request / invalid id's
*/
router.get('/v1/travels/:id/experiences/:eid', function(req, res, next){
  var travelid = req.params.id;
  var experienceid = req.params.eid;

  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24){
    res.status(400).send();
    return;
  }

  Travel.findById(travelid, function(err, obj){
    if(err){
      res.status(204).send(err);
      return;
    }

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true){
      res.status(204).send({});
      return;
    }
    res.status(200).send(exp);
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
*     responses:
*       201:
*         description: Successfully created
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add travel
*     deprecated: true
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

//update experience V2
/**
* @swagger
* /api/v2/travels/{id}/experiences/{eid}:
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
*         type: string
*       - name: eid
*         description: experience id to update
*         in: path
*         required: true
*         type: string
*       - name: body
*         description: experience coordinates
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/Experience'
*     responses:
*       200:
*         description: Successfully updated
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to create experience
*/
router.put('/v2/travels/:id/experiences/:eid', function(req, res, next){
  var travelid = req.params.id;
  var experienceid = req.params.eid;
  var experience = req.body;

  if(cutter.getBinarySize(travelid) != 24 || cutter.getBinarySize(experienceid) != 24){
    res.status(400).send(2);
    return;
  }

  if(len(experience) == 0){
    res.status(400).send();
    return;
  }

  Travel.findById(travelid, function(err, obj){
    if(err){
      res.status(204).send(err);
      return;
    }

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true){
      res.status(204).send({});
      return;
    }

    exp.update(experience, function (err, blobID) {
      if(err) res.status(500).send({});
      else res.status(200).send({});

      return;
    });
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

  Travel.findById(travelid, function(err, obj){
    if(!obj) return res.status(204).send(err);

    exp = obj.experiences.id(experienceid);
    if(!exp)return res.status(204).send({});

    exp.delete(function () {
      res.status(200).send({});
      return;
    });
  });


  // Travel.findOneAndUpdate({ _id: travelid, "experiences._id": mongoose.Types.ObjectId(experienceid) }, {
  //   "$set": {
  //     "experiences.$.deleted": true
  //   }
  // },
  // function (err, docs) {
  //   if(!docs){
  //     res.status(204).send({});
  //     return;
  //   }
  //   res.status(200).send({});
  //   return;
  // });
});

//Rate a experience
/**
* @swagger
* /api/v1/travels/{id}/experiences/{eid}/rate:
*   put:
*     tags:
*       - Experiences
*     description: rate a experience
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: travel id to add experience
*         in: path
*         required: true
*         type: string
*       - name: eid
*         description: experience id to update
*         in: path
*         required: true
*         type: string
*       - name: body
*         description: rate
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/Rate'
*     responses:
*       200:
*         description: Successfully reated
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to rate experience
*/
router.put('/v1/travels/:id/experiences/:eid/rate', function(req, res, next){
  var travelid = req.params.id;
  var experienceid = req.params.eid;
  var rate = req.body;

  if(cutter.getBinarySize(travelid) != 24 || cutter.getBinarySize(experienceid) != 24){
    res.status(400).send(2);
    return;
  }

  if(len(rate) == 0){
    res.status(400).send();
    return;
  }

  Travel.findById(travelid, function(err, obj){
    if(err){
      res.status(204).send(err);
      return;
    }

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true){
      res.status(204).send({});
      return;
    }

    if( obj.classifications.indexOf(rate) < 0) obj.classifications[rate] = [];
    obj.classifications[rate]++;


    exp.classifications.push(rate);

    obj.save(function (err) {
      if (err) res.status(500).send(JSON.stringify(err));
      res.status(201).send({});
      return;
    });
  });
});
/*END EXPERIENCES*/


/*MEDIAS*/

//get experience media
/**
* @swagger
* /api/v1/travels/{id}/experiences/{ide}/medias:
*   get:
*     tags:
*       - Medias
*     description: Returns all  experiences medias
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*       - name: ide
*         description: experience id
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
*             $ref: '#/definitions/Media'
*       204:
*         description: no content / No experiences
*       400:
*         description: bad request / missing parameters
*/
router.get('/v1/travels/:id/experiences/:ide/medias', function(req, res, next){
  var travelid = req.params.id;
  var experienceid = req.params.ide;

  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24){
    res.status(400).send();
    return;
  }

  Travel.findById(travelid, function(err, obj){
    if(err){
      res.status(204).send(err);
      return;
    }

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true){
      res.status(204).send({});
      return;
    }

    exp.getMedias(function(obj){
      res.status(200).send(obj);
    });
  });
});

//add media to experience
/**
* @swagger
* /api/v1/travels/{id}/experiences/{ide}/medias:
*   post:
*     tags:
*       - Medias
*     description: Creates a new media on experience
*     consumes:
*       - application/json
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*       - name: ide
*         description: experience id
*         in: path
*         required: true
*         type: string
*       - name: body
*         description: media object
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/Media'
*     responses:
*       201:
*         description: Successfully created
*       204:
*         description: travel/ experience don't exists
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add media
*/
router.post('/v1/travels/:id/experiences/:ide/medias', function(req, res, next){

  var travelid = req.params.id;
  var experienceid = req.params.ide;
  var media = req.body;

  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24 || len(media) == 0){
    res.status(400).send();
    return;
  }

  Travel.findById(travelid, function(err, obj){
    if(err){
      res.status(204).send(err);
      return;
    }

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true){
      res.status(204).send({});
      return;
    }

    console.log(media.valueobj);
    var buf = Buffer.from(media.valueobj, 'base64');
    media.valueobj = buf;

    mediaobj = new Experience(media);

    exp.medias.push(mediaobj);

    obj.save(function (err) {
      if (err) res.status(500).send(JSON.stringify(err));
      res.status(201).send();
      return;
    });
  });
});

//update media
/**
* @swagger
* /api/v1/travels/{id}/experiences/{ide}/medias/{idm}:
*   put:
*     tags:
*       - Medias
*     description: updates a media
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*       - name: ide
*         description: experience id
*         in: path
*         required: true
*         type: string
*       - name: idm
*         description: media id
*         in: path
*         required: true
*         type: string
*       - name: body
*         description: media object
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/Media'
*     responses:
*       200:
*         description: Successfully updated
*       204:
*         description: travel/ experience / media don't exists
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to create experience
*/
router.put('/v1/travels/:id/experiences/:ide/medias/:idm', function(req, res, next){

  var travelid = req.params.id;
  var experienceid = req.params.ide;
  var mediaid = req.params.idm;
  var media = req.body;

  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24 || cutter.getBinarySize(mediaid) != 24){
    res.status(400).send();
    return;
  }

  Travel.findById(travelid, function(err, obj){
    if(err){
      res.status(204).send(err);
      return;
    }

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true){
      res.status(204).send({});
      return;
    }

    med = exp.medias.id(mediaid);

    if(!med || med.deleted == true){
      res.status(204).send({});
      return;
    }

    med.value = media.value;
    med.date = media.date;

    obj.save(function (err) {
      if (err) res.status(500).send(JSON.stringify(err));
      res.status(201).send({});
      return;
    });
  });
});

//delete media
/**
* @swagger
* /api/v1/travels/{id}/experiences/{ide}/medias/{idm}:
*   delete:
*     tags:
*       - Medias
*     description: delete a media
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*       - name: ide
*         description: experience id
*         in: path
*         required: true
*         type: string
*       - name: idm
*         description: media id
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: Successfully deleted
*       204:
*         description: travel/experience/media not found
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to delete media
*/
router.delete('/v1/travels/:id/experiences/:ide/medias/:idm', function(req, res, next){

  var travelid = req.params.id;
  var experienceid = req.params.ide;
  var mediaid = req.params.idm;

  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24 || cutter.getBinarySize(mediaid) != 24) return res.status(400).send();

  Travel.findById(travelid, function(err, obj){

    if(!obj) return res.status(204).send({});

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true) return res.status(204).send({});

    med = exp.medias.id(mediaid);
    if(!med) return res.status(204).send({});

    med.delete(function(){
      obj.save(function (err) {
        if (err) res.status(500).send({});
        return res.status(201).send({});
      });
    });
  });
});

//add media to experience
/**
* @swagger
* /api/v2/travels/{id}/experiences/{ide}/medias:
*   post:
*     tags:
*       - Medias
*     description: Creates a new media on experience
*     summary: Uploads a file.
*     consumes:
*       - multipart/form-data
*     parameters:
*       - name: id
*         description: Travels id
*         in: path
*         required: true
*         type: string
*       - name: ide
*         description: experience id
*         in: path
*         required: true
*         type: string
*       - in: formData
*         name: media
*         type: file
*         description: The file to upload.
*     responses:
*       201:
*         description: Successfully created
*       204:
*         description: travel/ experience don't exists
*       400:
*         description: bad request / missing parameters
*       500:
*         description: failed to add media
*/
router.post('/v2/travels/:id/experiences/:ide/medias', function(req, res, next){

  var travelid = req.params.id;
  var experienceid = req.params.ide;

  if(!req.files) return res.status(400).send();
  if(cutter.getBinarySize(experienceid) != 24 || cutter.getBinarySize(travelid) != 24 || !req.files) res.status(400).send({});

  var media = {
    path: req.files[0].filename,
    typeof: req.files[0].mimetype,
  };

  var mediaobj = new Media(media);

  Travel.findById(travelid, function(err, obj){
    if(!obj) return res.status(204).send({});

    exp = obj.experiences.id(experienceid);
    if(!exp || exp.deleted == true) return res.status(204).send({});

    exp.medias.push(mediaobj);

    obj.save(function (err) {
      if(err) return res.status(500).send(err);
      else return res.status(201).send(mediaobj);
    });
  });
});

/*END MEDIAS*/

module.exports = router;
