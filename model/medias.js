var mongoose = require('mongoose');

var mediaSchema = new mongoose.Schema({
  valueobj: String, //{ data: Buffer, contentType: String },
  date: { type: Date, default: Date.now },
  typeof: { type: String, enum : ['photo', 'audio', 'video', 'text'] },
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
