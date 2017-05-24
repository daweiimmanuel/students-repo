var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CountrySchema = Schema({
   countryName: String 
});

CountrySchema
.virtual("url")
.get(function () {
  return "/catalog/country/" + this._id;
});

module.exports = mongoose.model("Country", CountrySchema);