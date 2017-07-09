var mongoose = require('mongoose');
var mediaSchema = require('./media');

var experienceSchema = new mongoose.Schema({
  date: Date,
  narrative: String,
  gps: { lat: Number, lng: Number},
  medias: [mediaSchema],
  deleted: Boolean,
  weather: { type: String, enum : ['Rain','Sunny'] },
  classifications: {type: Array, default:[]}
}, { _id: true } );

experienceSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

experienceSchema.methods.getMedias = function(callback){

  var outdata = [];
  for(var i = 0, s = exp.medias.length; i < s; i++){
    if(exp.medias[i].deleted != true) outdata.push(exp.medias[i]);
  }

  callback(outdata);
}

experienceSchema.methods.getMedia = function(id, callback){
  var media = this.medias.id(id);
  if(!media.deleted) callback(media);
  else callback(null);
}

experienceSchema.methods.setMedia = function(media, callback){

}

module.exports = experienceSchema;
mongoose.model('Experience', experienceSchema);
