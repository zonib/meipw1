var mongoose = require('mongoose');
var experience = require('./experiences');

var travelSchema = new mongoose.Schema({
  date: Date,
  user: String,
  description: String,
  local: {
    country: String,
    city: String,
    gps: { lat: Number, lng: Number}
  },
  experiences: [experience],
  deleted: Boolean
});

mongoose.model('Travel', travelSchema);

// viagem
//   -Local
//     -Pais
//     -Cidade
//     -GPS
//   -Descrição
//   -Data
//   -Utilizador
//   -Experiencias
//     -Data
//     -Designação;
//     -Narrativa?
//     -GPS?
//     -Caracteristicas
//       -texto?
//       -fotos?
//       -videos?
//       -audio?
//       -metereologia?
//     -classificações #like
//       -description
//       -user
//       -value
