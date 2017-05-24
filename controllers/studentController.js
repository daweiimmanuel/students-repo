var Student = require("../models/student"),
    Counsellor = require("../models/counsellor"),
    Country = require("../models/country"),
    Event = require("../models/event"),
    Major = require("../models/major"),
    Rating = require("../models/rating"),
    School = require("../models/school"),
    University = require("../models/university");
    
var async = require("async");
var moment = require("moment");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

exports.index = function(req, res, next) {
    async.parallel({
       student_count: function(callback){
           Student.count(callback);
       },
       counsellor_count: function(callback){
           Counsellor.count(callback);
       },
       country_count: function(callback){
           Country.count(callback);
       },
       event_count: function(callback){
           Event.count(callback);
       },
       major_count: function(callback){
           Major.count(callback);
       },
       rating_count: function(callback){
           Rating.count(callback);
       },
       school_count: function(callback){
           School.count(callback);
       },
       university_count: function(callback){
           University.count(callback);
       }
    }, function(err, results){
        if(err){
            console.log(err);
        } else{
            res.render("index", {data: results});
        }
    });
};

// Display list of all Students
exports.student_list = function(req, res, next) {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all students from DB
      Student.find({name: regex},'name date_of_birth email rating').populate('rating').sort([["name", "ascending"]]).exec(function(err, list_students){
        if(err){
            console.log(err);
         } else {
            res.render("students/index",{list_students: list_students});
            // res.status(200).json(list_students);
         }
      });
  } else {
      // Get all students from DB
      Student.find({},'name date_of_birth email rating').populate('rating').sort([["name", "ascending"]]).exec(function(err, list_students){
        if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(list_students);
            } else {
              res.render("students/index",{list_students: list_students});
            }
         }
      });
  }
};

// Display detail page for a specific Student
exports.student_detail = function(req, res, next) {
    async.parallel({
        student: function(callback) {
            Student.findById(req.params.id).populate("currentSchool").populate("country").populate("major").populate("university").populate("counsellor").populate("rating").populate("event").exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("students/detail", {student: results.student});
        }
    });
};

// Display Student create form on GET
exports.student_create_get = function(req, res, next) {
    async.parallel({
        counsellors: function(callback) {
            Counsellor.find(callback);
        },
        countries: function(callback) {
            Country.find(callback);
        },
        events: function(callback) {
            Event.find(callback);
        },
        majors: function(callback) {
            Major.find(callback);
        },
        ratings: function(callback) {
            Rating.find(callback);
        },
        schools: function(callback) {
            School.find(callback);
        },
        universities: function(callback) {
            University.find(callback);
        }
    }, function(err, results) {
        if(err){
            return next(err);
        } else {
            res.render("students/create", {counsellors: results.counsellors, countries: results.countries, events: results.events, majors: results.majors, ratings: results.ratings, schools: results.schools, universities: results.universities});
        }
    });
};

// Handle Student create on POST
exports.student_create_post = function(req, res, next) {
    //check fields
    req.checkBody({
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        },
        "date_of_birth": {
            optional: {
                options: {
                    checkFalsy: true
                }
            },
            isDate: true,
            errorMessage: "Invalid date"
        },
        "city": {
            optional: true,
            errorMessage: "Invalid city"
        },
        "telephone": {
            optional: true,
            errorMessage: "Invalid telephone"
        },
        "mobile": {
            notEmpty: true,
            errorMessage: "Mobile is required"
        },
        "bbPin": {
            optional: true,
            errorMessage: "Invalid pin"
        },
        "lineId": {
            optional: true,
            errorMessage: "Invalid id"
        },
        "email": {
            notEmpty: true,
            errorMessage: "Invalid email"
        },
        "parentName": {
            optional: true,
            errorMessage: "Invalid parent name"
        },
        "parentMobile": {
            optional: true,
            errorMessage: "Invalid parent mobile"
        },
        "currentSchool": {
            optional: true,
            errorMessage: "Invalid school"
        },
        "currentGrade": {
            optional: true,
            errorMessage: "Invalid grade"
        },
        "englishScore": {
            optional: true,
            errorMessage: "Invalid score"
        },
        "notes": {
            optional: true,
            errorMessage: "Invalid notes"
        },
        "country": {
            optional: true,
            errorMessage: "Invalid country"
        },
        "major": {
            optional: true,
            errorMessage: "Invalid major"
        },
        "university": {
            optional: true,
            errorMessage: "Invalid university"
        },
        "counsellor": {
            notEmpty: true,
            errorMessage: "Counsellor is required"
        },
        "rating": {
            optional: true,
            errorMessage: "Invalid rating"
        },
        "status": {
            optional: true,
            errorMessage: "Invalid status"
        },
        "event": {
            optional: true,
            errorMessage: "Invalid event"
        }
    });
    // req.checkBody("name", "Name is required").notEmpty();
    // req.checkBody("date_of_birth").optional({checkFalsy: true}).isDate();
    // req.checkBody("city").optional({checkFalsy:true});
    // req.checkBody("telephone").optional({checkFalsy:true});
    // req.checkBody("mobile", "Mobile Phone is required").notEmpty();
    // req.checkBody("bbPin").optional({checkFalsy:true});
    // req.checkBody("lineId").optional({checkFalsy:true});
    // req.checkBody("email", "E-mail is required").notEmpty();
    // req.checkBody("parentName").optional({checkFalsy:true});
    // req.checkBody("parentMobile").optional({checkFalsy:true});
    // req.checkBody("currentSchool").optional({checkFalsy:true});
    // req.checkBody("currentGrade").optional({checkFalsy:true});
    // req.checkBody("englishScore").optional({checkFalsy:true});
    // req.checkBody("notes").optional({checkFalsy:true});
    // req.checkBody("country").optional({checkFalsy:true});
    // req.checkBody("major").optional({checkFalsy:true});
    // req.checkBody("university").optional({checkFalsy:true});
    // req.checkBody("counsellor", "Counsellor is required").notEmpty();
    // req.checkBody("rating").optional({checkFalsy:true});
    // req.checkBody("status").optional({checkFalsy:true});
    // req.checkBody("event").optional({checkFalsy:true});
    
    //trim and escape data
    req.sanitize("date_of_birth").toDate();
    req.sanitize("name").escape();
    req.sanitize("name").trim();
    req.sanitize("address").escape();
    req.sanitize("address").trim();
    req.sanitize("city").escape();
    req.sanitize("city").trim();
    req.sanitize("telephone").escape();
    req.sanitize("telephone").trim();
    req.sanitize("mobile").escape();
    req.sanitize("mobile").trim();
    req.sanitize("bbPin").escape();
    req.sanitize("bbPin").trim();
    req.sanitize("lineId").escape();
    req.sanitize("lineId").trim();
    req.sanitize("email").escape();
    req.sanitize("email").trim();
    req.sanitize("parentName").escape();
    req.sanitize("parentName").trim();
    req.sanitize("parentMobile").escape();
    req.sanitize("parentMobile").trim();
    req.sanitize("currentSchool").escape();
    req.sanitize("currentSchool").trim();
    req.sanitize("currentGrade").escape();
    req.sanitize("currentGrade").trim();
    req.sanitize("englishScore").escape();
    req.sanitize("englishScore").trim();
    req.sanitize("notes").escape();
    req.sanitize("notes").trim();
    req.sanitize("country").escape();
    req.sanitize("country").trim();
    req.sanitize("major").escape();
    req.sanitize("major").trim();
    req.sanitize("university").escape();
    req.sanitize("university").trim();
    req.sanitize("counsellor").escape();
    req.sanitize("counsellor").trim();
    req.sanitize("rating").escape();
    req.sanitize("rating").trim();
    req.sanitize("status").escape();
    req.sanitize("status").trim();
    req.sanitize("event").escape();
    req.sanitize("event").trim();
    
    //create a student object with escaped and trimmed data
    var student = new Student({
       name: (typeof req.body.name==='undefined') ? '' : req.body.name,
       address: (typeof req.body.address==='undefined') ? '' : req.body.address,
       date_of_birth: (typeof req.body.date_of_birth==='undefined') ? Date.now() : req.body.date_of_birth,
       city: (typeof req.body.city==='undefined') ? '' : req.body.city,
       telephone: (typeof req.body.telephone==='undefined') ? '' : req.body.telephone,
       mobile: (typeof req.body.mobile==='undefined') ? '' : req.body.mobile,
       bbPin: (typeof req.body.bbPin==='undefined') ? '' : req.body.bbPin,
       lineId: (typeof req.body.lineId==='undefined') ? '' : req.body.lineId,
       email: (typeof req.body.email==='undefined') ? '' : req.body.email,
       parentName: (typeof req.body.parentName==='undefined') ? '' : req.body.parentName,
       parentMobile: (typeof req.body.parentMobile==='undefined') ? '' : req.body.parentMobile,
       currentSchool: (typeof req.body.currentSchool==='undefined') ? null : req.body.currentSchool,
       currentGrade: (typeof req.body.currentGrade==='undefined') ? '' : req.body.currentGrade,
       englishScore: (typeof req.body.englishScore==='undefined') ? '' : req.body.englishScore,
       notes: (typeof req.body.notes==='undefined') ? '' : req.body.notes,
       country: (typeof req.body.country==='undefined') ? [] : req.body.country.split(","),
       major: (typeof req.body.major==='undefined') ? [] : req.body.major.split(","),
       university: (typeof req.body.university==='undefined') ? [] : req.body.university.split(","),
       counsellor: (typeof req.body.counsellor==='undefined') ? null : req.body.counsellor,
       rating: (typeof req.body.rating==='undefined') ? null : req.body.rating,
       status: (typeof req.body.status==='undefined') ? '' : req.body.status,
       event: (typeof req.body.event==='undefined') ? null : req.body.event
    });
    console.log(student);
    
    //run validators
    var errors = req.validationErrors();
    
    if(errors){
        ////If there are errors render the form again, passing the previously entered values and errors
        
        //Get all counsellors, countries, events, majors, ratings, schools, universities for form
        async.parallel({
        counsellors: function(callback) {
            Counsellor.find(callback);
        },
        countries: function(callback) {
            Country.find(callback);
        },
        events: function(callback) {
            Event.find(callback);
        },
        majors: function(callback) {
            Major.find(callback);
        },
        ratings: function(callback) {
            Rating.find(callback);
        },
        schools: function(callback) {
            School.find(callback);
        },
        universities: function(callback) {
            University.find(callback);
        }
        }, function(err, results) {
            if(err){
                console.log(err.errors);
                return next(err);
            } else {
                res.render("students/create", {counsellors: results.counsellors, countries: results.countries, events: results.events, majors: results.majors, ratings: results.ratings, schools: results.schools, universities: results.universities, student: student, errors: errors});
            }
        });
    }
    else {
        //Data from form is valid
        //Check if Student is already exists
        Student.findOne({"name": req.body.name}).exec(function(err, foundStudent){
           if(err){
               return next(err);
           }
           
           if(foundStudent) {
               //Student exists redirect to 
               res.redirect(foundStudent.url);
           } else {
               student.save(function(err){
                   if(err) {console.log(err.errors); return next(err);}
                   else{
                       //Student saved. Redirect to Student page
                   res.redirect("../students/");
                   }
                   
               });
           }
        });
    }
};

// Display Student delete form on GET
exports.student_delete_get = function(req, res, next) {
    async.parallel({
        student: function(callback) {
            Student.findById(req.params.id).populate("currentSchool").populate("country").populate("major").populate("university").populate("counsellor").populate("rating").populate("event").exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("students/delete", {student: results.student});
        }
    });
};

// Handle Student delete on POST
exports.student_delete_post = function(req, res, next) {
    req.checkBody('studentid', 'Student id must exist').notEmpty();  
    
    async.parallel({
        student: function(callback) {
            Student.findById(req.body.studentid).populate("currentSchool").populate("country").populate("major").populate("university").populate("counsellor").populate("rating").populate("event").exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        //Delete object and redirect to the list of students.
        Student.findByIdAndRemove(req.body.studentid, function deleteStudent(err) {
            if (err) { return next(err); }
            //Success - got to student list
            res.redirect('/catalog/students');
        });
    });
};

// Display Student update form on GET
exports.student_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get student, counsellors, countries, events, majors, ratings, schools, universities for form
    async.parallel({
        student: function(callback) {
            Student.findById(req.params.id).populate("currentSchool").populate("country").populate("major").populate("university").populate("counsellor").populate("rating").populate("event").exec(callback);
        },
        counsellors: function(callback) {
            Counsellor.find(callback);
        },
        countries: function(callback) {
            Country.find(callback);
        },
        events: function(callback) {
            Event.find(callback);
        },
        majors: function(callback) {
            Major.find(callback);
        },
        ratings: function(callback) {
            Rating.find(callback);
        },
        schools: function(callback) {
            School.find(callback);
        },
        universities: function(callback) {
            University.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        
        var country_list = [];
        var major_list = [];
        var university_list = [];

        for(var i=0 ; i<results.student.country.length; i++) {
            country_list.push(results.student.country[i]._id);
        }
        
        for(var j=0 ; j<results.student.major.length; j++) {
            major_list.push(results.student.major[j]._id);
        }
        
        for(var k=0 ; k<results.student.university.length; k++) {
            university_list.push(results.student.university[k]._id);
        }
        
        res.render('students/edit', { country_list: country_list, major_list:major_list, university_list:university_list, counsellors: results.counsellors, countries: results.countries, events: results.events, majors: results.majors, ratings: results.ratings, schools: results.schools, universities: results.universities, student: results.student });
    });
};

// Handle Student update on POST
exports.student_update_post = function(req, res, next) {
    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody({
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        },
        "date_of_birth": {
            optional: {
                options: {
                    checkFalsy: true
                }
            },
            isDate: true,
            errorMessage: "Invalid date"
        },
        "city": {
            optional: true,
            errorMessage: "Invalid city"
        },
        "telephone": {
            optional: true,
            errorMessage: "Invalid telephone"
        },
        "mobile": {
            notEmpty: true,
            errorMessage: "Mobile is required"
        },
        "bbPin": {
            optional: true,
            errorMessage: "Invalid pin"
        },
        "lineId": {
            optional: true,
            errorMessage: "Invalid id"
        },
        "email": {
            notEmpty: true,
            errorMessage: "Invalid email"
        },
        "parentName": {
            optional: true,
            errorMessage: "Invalid parent name"
        },
        "parentMobile": {
            optional: true,
            errorMessage: "Invalid parent mobile"
        },
        "currentSchool": {
            optional: true,
            errorMessage: "Invalid school"
        },
        "currentGrade": {
            optional: true,
            errorMessage: "Invalid grade"
        },
        "englishScore": {
            optional: true,
            errorMessage: "Invalid score"
        },
        "notes": {
            optional: true,
            errorMessage: "Invalid notes"
        },
        "country": {
            optional: true,
            errorMessage: "Invalid country"
        },
        "major": {
            optional: true,
            errorMessage: "Invalid major"
        },
        "university": {
            optional: true,
            errorMessage: "Invalid university"
        },
        "counsellor": {
            notEmpty: true,
            errorMessage: "Counsellor is required"
        },
        "rating": {
            optional: true,
            errorMessage: "Invalid rating"
        },
        "status": {
            optional: true,
            errorMessage: "Invalid status"
        },
        "event": {
            optional: true,
            errorMessage: "Invalid event"
        }
    });
    
    req.sanitize("date_of_birth").toDate();
    req.sanitize("name").escape();
    req.sanitize("name").trim();
    req.sanitize("address").escape();
    req.sanitize("address").trim();
    req.sanitize("city").escape();
    req.sanitize("city").trim();
    req.sanitize("telephone").escape();
    req.sanitize("telephone").trim();
    req.sanitize("mobile").escape();
    req.sanitize("mobile").trim();
    req.sanitize("bbPin").escape();
    req.sanitize("bbPin").trim();
    req.sanitize("lineId").escape();
    req.sanitize("lineId").trim();
    req.sanitize("email").escape();
    req.sanitize("email").trim();
    req.sanitize("parentName").escape();
    req.sanitize("parentName").trim();
    req.sanitize("parentMobile").escape();
    req.sanitize("parentMobile").trim();
    req.sanitize("currentSchool").escape();
    req.sanitize("currentSchool").trim();
    req.sanitize("currentGrade").escape();
    req.sanitize("currentGrade").trim();
    req.sanitize("englishScore").escape();
    req.sanitize("englishScore").trim();
    req.sanitize("notes").escape();
    req.sanitize("notes").trim();
    req.sanitize("country").escape();
    req.sanitize("country").trim();
    req.sanitize("major").escape();
    req.sanitize("major").trim();
    req.sanitize("university").escape();
    req.sanitize("university").trim();
    req.sanitize("counsellor").escape();
    req.sanitize("counsellor").trim();
    req.sanitize("rating").escape();
    req.sanitize("rating").trim();
    req.sanitize("status").escape();
    req.sanitize("status").trim();
    req.sanitize("event").escape();
    req.sanitize("event").trim();
    
    var student = new Student({
       name: (typeof req.body.name==='undefined') ? '' : req.body.name,
       address: (typeof req.body.address==='undefined') ? '' : req.body.address,
       date_of_birth: (typeof req.body.date_of_birth==='undefined') ? Date.now() : req.body.date_of_birth,
       city: (typeof req.body.city==='undefined') ? '' : req.body.city,
       telephone: (typeof req.body.telephone==='undefined') ? '' : req.body.telephone,
       mobile: (typeof req.body.mobile==='undefined') ? '' : req.body.mobile,
       bbPin: (typeof req.body.bbPin==='undefined') ? '' : req.body.bbPin,
       lineId: (typeof req.body.lineId==='undefined') ? '' : req.body.lineId,
       email: (typeof req.body.email==='undefined') ? '' : req.body.email,
       parentName: (typeof req.body.parentName==='undefined') ? '' : req.body.parentName,
       parentMobile: (typeof req.body.parentMobile==='undefined') ? '' : req.body.parentMobile,
       currentSchool: (typeof req.body.currentSchool==='undefined') ? null : req.body.currentSchool,
       currentGrade: (typeof req.body.currentGrade==='undefined') ? '' : req.body.currentGrade,
       englishScore: (typeof req.body.englishScore==='undefined') ? '' : req.body.englishScore,
       notes: (typeof req.body.notes==='undefined') ? '' : req.body.notes,
       country: (typeof req.body.country==='undefined') ? [] : req.body.country.split(","),
       major: (typeof req.body.major==='undefined') ? [] : req.body.major.split(","),
       university: (typeof req.body.university==='undefined') ? [] : req.body.university.split(","),
       counsellor: (typeof req.body.counsellor==='undefined') ? null : req.body.counsellor,
       rating: (typeof req.body.rating==='undefined') ? null : req.body.rating,
       status: (typeof req.body.status==='undefined') ? '' : req.body.status,
       event: (typeof req.body.event==='undefined') ? null : req.body.event,
        _id:req.params.id //This is required, or a new ID will be assigned!
       });
    
    var errors = req.validationErrors();
    if (errors) {
        // Re-render book with error information
        // Get all data for form
        async.parallel({
        student: function(callback) {
            Student.findById(req.params.id).populate("currentSchool").populate("country").populate("major").populate("university").populate("counsellor").populate("rating").populate("event").exec(callback);
        },
        counsellors: function(callback) {
            Counsellor.find(callback);
        },
        countries: function(callback) {
            Country.find(callback);
        },
        events: function(callback) {
            Event.find(callback);
        },
        majors: function(callback) {
            Major.find(callback);
        },
        ratings: function(callback) {
            Rating.find(callback);
        },
        schools: function(callback) {
            School.find(callback);
        },
        universities: function(callback) {
            University.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        
        var country_list = [];
        var major_list = [];
        var university_list = [];

        for(var i=0 ; i<results.student.country.length; i++) {
            country_list.push(results.student.country[i]._id);
        }
        
        for(var j=0 ; j<results.student.major.length; j++) {
            major_list.push(results.student.major[j]._id);
        }
        
        for(var k=0 ; k<results.student.university.length; k++) {
            university_list.push(results.student.university[k]._id);
        }
        
        res.render('students/edit', { country_list: country_list, major_list:major_list, university_list:university_list, counsellors: results.counsellors, countries: results.countries, events: results.events, majors: results.majors, ratings: results.ratings, schools: results.schools, universities: results.universities, student: results.student });
    });

    } 
    else {
        // Data from form is valid. Update the record.
        Student.findByIdAndUpdate(req.params.id, student, {}, function (err,thestudent) {
            if (err) { return next(err); }
            //successful - redirect to student detail page.
            res.redirect(thestudent.url);
        });
    }
};