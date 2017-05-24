var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RatingSchema = Schema({
   rating: Number 
});

RatingSchema
.virtual("url")
.get(function () {
  return "/catalog/rating/" + this._id;
});

module.exports = mongoose.model("Rating", RatingSchema);