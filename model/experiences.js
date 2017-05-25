var mongoose = require('mongoose');

var experienceSchema = new mongoose.Schema({
  date: Date,
  narrative: String,
  gps: { lat: Number, lng: Number},
  details: { type: Array, default: []},
  deleted: Boolean,
  classifications: {type: Array, default:[]}
});

mongoose.model('Experience', experienceSchema);

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
