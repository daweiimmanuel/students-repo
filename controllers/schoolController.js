var School = require("../models/school");
var Student = require("../models/student");
var async = require("async");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Display list of all schools
exports.school_list = function(req, res, next) {
    School.find().sort([["schoolName","ascending"]]).exec(function(err, allSchools){
       if(err){
           console.log(err);
       } else{
           res.render("schools/index", {schools: allSchools});
       }
    });
};

// Display detail page for a specific school
exports.school_detail = function(req, res, next) {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      
      async.parallel({
        school: function(callback) {
            School.findById(req.params.id).exec(callback);
        },
        school_students: function(callback) {
            Student.find({
                $and: [
                    {"currentSchool": req.params.id},
                    {"name": regex}]
                }).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("schools/detail", {school: results.school, school_students: results.school_students});
        }
    });
    } else {
      async.parallel({
        school: function(callback) {
            School.findById(req.params.id).exec(callback);
        },
        school_students: function(callback) {
            Student.find({"currentSchool": req.params.id}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("schools/detail", {school: results.school, school_students: results.school_students});
        }
    });
    }
    
    
};

// Display school create form on GET
exports.school_create_get = function(req, res, next) {
    res.render("schools/create");
};

// Handle school create on POST
exports.school_create_post = function(req, res, next) {
    //check that the school name field is not empty
    req.checkBody("schoolName","School Name is required").notEmpty();
    
    //trim and escape the school name field
    req.sanitize("schoolName").escape();
    req.sanitize("schoolName").trim();
    
    //run the validators
    var errors = req.validationErrors();
    
    //create a school object with escaped and trimmed data
    var school = new School(
            {schoolName: req.body.schoolName}
        );
        
    if(errors){
        //If there are errors render the form again, passing the previously entered values and errors
        res.render("schools/create", {school: school, errors: errors});
        return;
    } else {
        //Data from form is valid
        //Check if School with the same name already exists
        School.findOne({"schoolName": req.body.schoolName}).exec(function(err, foundSchool){
           if(err){
               return next(err);
           }
           
           if(foundSchool) {
               //School exists redirect to 
               res.redirect(foundSchool.url);
           } else {
               school.save(function(err){
                   if(err) return next(err);
                   //School saved. Redirect to schools page
                   res.redirect("../schools/");
               })
           }
        });
    }
};

// Display school delete form on GET
exports.school_delete_get = function(req, res, next) {
    async.parallel({
        school: function(callback) {     
            School.findById(req.params.id).exec(callback);
        },
        schools_students: function(callback) {
          Student.find({ 'currentSchool': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('schools/delete', { school: results.school, school_students: results.schools_students } );
    });
};

// Handle school delete on POST
exports.school_delete_post = function(req, res, next) {
    req.checkBody('schoolid', 'School id must exist').notEmpty();  
    
    async.parallel({
        schoool: function(callback) {     
            School.findById(req.body.schoolid).exec(callback);
        },
        schools_students: function(callback) {
          Student.find({ 'currentSchool': req.body.ratingid },'name').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.schools_students>0) {
            //School has students. Render in same way as for GET route.
            res.render('schools/delete', { school: results.school, school_students: results.schools_students } );
            return;
        }
        else {
            //School has no students. Delete object and redirect to the list of schools.
            School.findByIdAndRemove(req.body.schoolid, function deleteSchool(err) {
                if (err) { return next(err); }
                //Success - got to school list
                res.redirect('/catalog/schools');
            });

        }
    });
};

// Display school update form on GET
exports.school_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    School.findById(req.params.id, function(err, school) {
        if (err) { return next(err); }
        //On success
        res.render('schools/edit', { school: school });
    });
};

// Handle school update on POST
exports.school_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    //Check that the name field is not empty
    req.checkBody('schoolName', 'School name required').notEmpty();
    //Trim and escape the name field.
    req.sanitize('schoolName').escape();
    req.sanitize('schoolName').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a School object with escaped and trimmed data (and the old id!)
    var school = new School(
      {
      schoolName: req.body.schoolName,
      _id: req.params.id
      }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('schools/edit', { school: school, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        School.findByIdAndUpdate(req.params.id, school, {}, function (err,theschool) {
            if (err) { return next(err); }
               //successful - redirect to school detail page.
               res.redirect(theschool.url);
            });
    }
};