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

mongoose.model('Travel', travelSchema);
