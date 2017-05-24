var Major = require("../models/major");
var Student = require("../models/student");
var async = require("async");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Display list of all majors
exports.major_list = function(req, res, next) {
    Major.find().sort([["majorName","ascending"]]).exec(function(err, allMajors){
       if(err){
           console.log(err);
       } else{
           res.render("majors/index", {majors: allMajors});
       }
    });
};

// Display detail page for a specific major
exports.major_detail = function(req, res, next) {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      
      async.parallel({
        major: function(callback) {
            Major.findById(req.params.id).exec(callback);
        },
        major_students: function(callback) {
            Student.find({
                $and: [
                    {"major": req.params.id},
                    {"name": regex}
                    ]}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("majors/detail", {major: results.major, major_students: results.major_students});
        }
    });
    } else {
      async.parallel({
        major: function(callback) {
            Major.findById(req.params.id).exec(callback);
        },
        major_students: function(callback) {
            Student.find({"major": req.params.id}).exec(callback);
      }
        }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("majors/detail", {major: results.major, major_students: results.major_students});
        }
      });
    }
};

// Display major create form on GET
exports.major_create_get = function(req, res, next) {
    res.render("majors/create");
};

// Handle major create on POST
exports.major_create_post = function(req, res, next) {
    //check that the major name field is not empty
    req.checkBody("majorName","Major Name is required").notEmpty();
    
    //trim and escape the major name field
    req.sanitize("majorName").escape();
    req.sanitize("majorName").trim();
    
    //run the validators
    var errors = req.validationErrors();
    
    //create a major object with escaped and trimmed data
    var major = new Major(
            {majorName: req.body.majorName}
        );
        
    if(errors){
        //If there are errors render the form again, passing the previously entered values and errors
        res.render("majors/create", {major: major, errors: errors});
        return;
    } else {
        //Data from form is valid
        //Check if Major with the same name already exists
        Major.findOne({"majorName": req.body.majorName}).exec(function(err, foundMajor){
           if(err){
               return next(err);
           }
           
           if(foundMajor) {
               //major exists redirect to 
               res.redirect(foundMajor.url);
           } else {
               major.save(function(err){
                   if(err) return next(err);
                   //Major saved. Redirect to majors page
                   res.redirect("../majors/");
               })
           }
        });
    }
};

// Display major delete form on GET
exports.major_delete_get = function(req, res, next) {
    async.parallel({
        major: function(callback) {     
            Major.findById(req.params.id).exec(callback);
        },
        majors_students: function(callback) {
          Student.find({ 'major': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('majors/delete', { major: results.major, major_students: results.majors_students } );
    });
};

// Handle major delete on POST
exports.major_delete_post = function(req, res, next) {
    req.checkBody('majorid', 'Major id must exist').notEmpty();  
    
    async.parallel({
        major: function(callback) {     
            Major.findById(req.body.majorid).exec(callback);
        },
        majors_students: function(callback) {
          Student.find({ 'major': req.body.majorid },'name').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.ratings_students>0) {
            //Major has students. Render in same way as for GET route.
            res.render('majors/delete', { major: results.major, major_students: results.majors_students } );
            return;
        }
        else {
            //Major has no students. Delete object and redirect to the list of majors.
            Major.findByIdAndRemove(req.body.majorid, function deleteMajor(err) {
                if (err) { return next(err); }
                //Success - got to major list
                res.redirect('/catalog/majors');
            });

        }
    });
};

// Display major update form on GET
exports.major_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    Major.findById(req.params.id, function(err, major) {
        if (err) { return next(err); }
        //On success
        res.render('majors/edit', { major: major });
    });
};

// Handle major update on POST
exports.major_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    //Check that the name field is not empty
    req.checkBody('majorName', 'Major name required').notEmpty();
    //Trim and escape the name field.
    req.sanitize('majorName').escape();
    req.sanitize('majorName').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a major object with escaped and trimmed data (and the old id!)
    var major = new Major(
      {
      majorName: req.body.majorName,
      _id: req.params.id
      }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('majors/edit', { major: major, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        Major.findByIdAndUpdate(req.params.id, major, {}, function (err,themajor) {
            if (err) { return next(err); }
               //successful - redirect to major detail page.
               res.redirect(themajor.url);
            });
    }
};