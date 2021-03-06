var mongoose = require('mongoose');

var mediaSchema = new mongoose.Schema({
  path: { type: String },
  date: { type: Date, default: Date.now },
  typeof: { type: String },
  deleted: Boolean,
});

mediaSchema.methods.delete = function(callback){
  this.deleted = true;
  callback();
}

module.exports = mediaSchema;
mongoose.model('Media', mediaSchema);

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
