var mongoose = require('mongoose');

var friendsSchema = new mongoose.Schema({
  requester: String,
  receiver: String,
  accepted: Boolean,
  deleted: Boolean
});

friendsSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

friendsSchema.methods.accept = function(callback){

  User.findById(this.requester, function(err, obj){
    obj.friends.push(this.receiver);
  });

  this.accepted = true;
  callback();
}

friendsSchema.methods.reject = function(callback){
  this.accepted = false;
  callback();
}

mongoose.model('Friends', friendsSchema);

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
