var mongoose = require('mongoose');

var travelSchema = new mongoose.Schema({
  birthdate: Date,
  email: String,
  firstName: String,
  lastName: String,
  country: String,
  city: String,
  district: String,
  pwd: String,
  credits: Number,
  friends: [],
  badges: [],
  deleted: Boolean
});

mongoose.model('User', travelSchema);

/**
* @swagger
* definition:
*       User:
*         type: object
*         properties:
*           email:
*             type: string
*           firstName:
*             type: string
*           lastName:
*             type: string
*           birthdate:
*             type: string
*             format: date-time
*           country:
*             type: string
*           city:
*             type: string
*           district:
*             type: string
*           pwd:
*             type: password
*           credits:
*             type: mumber,
*/
