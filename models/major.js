var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var MajorSchema = Schema({
   majorName: String 
});

MajorSchema
.virtual("url")
.get(function () {
  return "/catalog/major/" + this._id;
});

module.exports = mongoose.model("Major", MajorSchema);