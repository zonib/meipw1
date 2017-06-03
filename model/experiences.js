var mongoose = require('mongoose');
var mediaSchema = require('./medias');

var experienceSchema = new mongoose.Schema({
  date: Date,
  narrative: String,
  gps: { lat: Number, lng: Number},
  medias: [mediaSchema],
  deleted: Boolean,
  weather: { type: String, enum : ['Rain','Sunny'] }
  classifications: {type: Array, default:[]}
}, { _id: true } );

experienceSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

module.exports = experienceSchema;
mongoose.model('Experience', experienceSchema);
