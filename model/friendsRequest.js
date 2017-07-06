var mongoose = require('mongoose');
// User = mongoose.model('User');

var friendsRequestSchema = new mongoose.Schema({
  requester: String,
  receiver: String,
  accepted: Boolean,
  deleted: Boolean
});

friendsRequestSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

friendsRequestSchema.methods.accept = function(callback){

  var req = this.requester;
  var rec = this.receiver;

  User.findById(req, function(err, obj){
    if(obj.friends.indexOf(rec) < 0) {
      obj.friends.push(rec);
      obj.save();
    }
  });

  User.findById(rec, function(err, obj){
    if(!obj.friends.indexOf(req) < 0) {
      obj.friends.push(req);
      obj.save();
    }
  });

  this.accepted = true;
  callback(1);
}

friendsRequestSchema.methods.reject = function(callback){
  this.accepted = false;
  callback();
}

mongoose.model('FriendsRequest', friendsRequestSchema);

/**
* @swagger
* definition:
*       Friends:
*         type: object
*         properties:
*           requester:
*             type: string
*           receiver:
*             type: string
*           accepted:
*             type: string
*           deleted:
*             type: string
*/
