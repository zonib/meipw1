var mongoose = require('mongoose');

var experienceSchema = new mongoose.Schema({
  date: Date,
  narrative: String,
  gps: { lat: Number, lng: Number},
  details: { type: Array, default: []},
  deleted: Boolean,
  classifications: {type: Array, default:[]}
}, { _id: true } );

experienceSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

module.exports = experienceSchema;
mongoose.model('Experience', experienceSchema);
