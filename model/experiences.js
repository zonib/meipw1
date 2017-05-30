var mongoose = require('mongoose');

var experienceSchema = new mongoose.Schema({
  date: Date,
  narrative: String,
  gps: { lat: Number, lng: Number},
  details: { type: Array, default: []},
  deleted: Boolean,
  classifications: {type: Array, default:[]}
}, { _id: true } );


module.exports = experienceSchema;
mongoose.model('Experience', experienceSchema);
