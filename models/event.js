var mongoose = require("mongoose");
var moment = require("moment");

var Schema = mongoose.Schema;

var EventSchema = Schema({
   eventName: String,
   eventDate: {type: Date, default: Date.now}
});

EventSchema
.virtual("url")
.get(function () {
  return "/catalog/event/" + this._id;
});

EventSchema
.virtual("event_date_formatted")
.get(function () {
  return moment(this.eventDate).format('MMMM Do, YYYY');
});

EventSchema
.virtual('event_date_yyyy_mm_dd')
.get(function () {
  return moment(this.eventDate).format('YYYY-MM-DD');
});

module.exports = mongoose.model("Event", EventSchema);