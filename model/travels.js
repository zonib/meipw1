var mongoose = require('mongoose');
var experienceSchema = require('./experiences');

var travelSchema = new mongoose.Schema({
  date: Date,
  user: String,
  description: String,
  local: {
    country: String,
    city: String,
    gps: { lat: Number, lng: Number}
  },
  experiences: [experienceSchema],
  deleted: Boolean
});


travelSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

travelSchema.methods.getExperiences = function(callback){
  // this.experiences.find({"experiences.deleted": { $ne: true}}, function(err, obj){
  //     callback(err, obj);
  // });
}



mongoose.model('Travel', travelSchema);
