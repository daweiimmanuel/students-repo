var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SchoolSchema = Schema({
   schoolName: String
});

SchoolSchema
.virtual("url")
.get(function () {
  return "/catalog/school/" + this._id;
});

module.exports = mongoose.model("School", SchoolSchema);