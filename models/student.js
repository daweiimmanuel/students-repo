var mongoose = require("mongoose");
var moment = require("moment");

var Schema = mongoose.Schema;

var StudentSchema = Schema({
    name: {type: String, default: ''},
    address: {type: String, default: ''},
    date_of_birth: {type: Date},
    city: {type: String, default: ''},
    telephone: {type: String, default: ''},
    mobile: {type: String, default: ''},
    bbPin: {type: String, default: ''},
    lineId: {type: String, default: ''},
    email: {type: String, default: ''},
    parentName: {type: String, default: ''},
    parentMobile: {type: String, default: ''},
    currentSchool: {type: Schema.ObjectId, default: null, ref: "School"},
    currentGrade: {type: String, default: ''},
    englishScore: {type: String, default: ''},
    notes: {type: String, default: ''},
    country: [{type: Schema.ObjectId, default: [] ,ref: "Country"}],
    major: [{type: Schema.ObjectId, default: [], ref: "Major"}],
    university: [{type: Schema.ObjectId, default: [], ref: "University"}],
    counsellor: {type: Schema.ObjectId, default: null, ref: "Counsellor"},
    rating: {type: Schema.ObjectId, default: null, ref: "Rating"},
    status: {type: String, default: ''},
    event: {type: Schema.ObjectId, default: null, ref: "Event"}
},{minimize: false});

StudentSchema
.virtual("url")
.get(function () {
  return "/catalog/student/" + this._id;
});

StudentSchema
.virtual("dob_formatted")
.get(function() {
  return moment(this.date_of_birth).format('MMMM Do, YYYY');
});

StudentSchema
.virtual('dob_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_birth).format('YYYY-MM-DD');
});

module.exports = mongoose.model("Student", StudentSchema);