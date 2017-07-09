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
  shared: { type: Boolean, default: false },
  classifications: [],
  deleted: Boolean
});


travelSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

mongoose.model('Travel', travelSchema);
