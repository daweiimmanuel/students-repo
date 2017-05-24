var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CounsellorSchema = Schema({
   counsellorName: String 
});

CounsellorSchema
.virtual("url")
.get(function () {
  return "/catalog/counsellor/" + this._id;
});

module.exports = mongoose.model("Counsellor", CounsellorSchema);