var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UniversitySchema = Schema({
   universityName: String 
});

UniversitySchema
.virtual("url")
.get(function () {
  return "/catalog/university/" + this._id;
});

module.exports = mongoose.model("University", UniversitySchema);