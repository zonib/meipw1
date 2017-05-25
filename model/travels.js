var mongoose = require('mongoose');

var travelSchema = new mongoose.Schema({
  date: Date,
  user: String,
  description: String,
  local: {
    country: String,
    city: String,
    gps: { lat: Number, lng: Number}},
    active: Boolean
  });

mongoose.model('Travel', travelSchema);

  // -Local
  //   -Pais
  //   -Cidade
  //   -GPS
  // -Descrição
  // -Data
  // -Utilizador
  // -Experiencias
