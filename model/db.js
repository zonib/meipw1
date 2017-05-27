var mongoose = require('mongoose');
try {
  // mongoose.connect('localhost:27017');
  mongoose.connect('zzonib:Ipca2017!..@cluster0-shard-00-00-0ye1h.mongodb.net:27017,cluster0-shard-00-01-0ye1h.mongodb.net:27017,cluster0-shard-00-02-0ye1h.mongodb.net:27017/<DATABASE>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');
} catch (err) {
  console.log(err);
}
