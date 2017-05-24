var University = require("../models/university");
var Student = require("../models/student");
var async = require("async");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Display list of all universitys
exports.university_list = function(req, res, next) {
    University.find().sort([["universityName","ascending"]]).exec(function(err, allUniversities){
       if(err){
           console.log(err);
       } else{
           res.render("universities/index", {universities: allUniversities});
       }
    });
};

// Display detail page for a specific university
exports.university_detail = function(req, res, next) {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      
      async.parallel({
        university: function(callback) {
            University.findById(req.params.id).exec(callback);
        },
        university_students: function(callback) {
            Student.find({
                $and:[
                    {"university": req.params.id},
                    {"name": regex}
                    ]}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("universities/detail", {university: results.university, university_students: results.university_students});
        }
    });
    } else {
      async.parallel({
        university: function(callback) {
            University.findById(req.params.id).exec(callback);
        },
        university_students: function(callback) {
            Student.find({"university": req.params.id}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("universities/detail", {university: results.university, university_students: results.university_students});
        }
    });
    }
};

// Display university create form on GET
exports.university_create_get = function(req, res, next) {
    res.render("universities/create");
};

// Handle university create on POST
exports.university_create_post = function(req, res, next) {
    //check that the university name field is not empty
    req.checkBody("universityName","University Name is required").notEmpty();
    
    //trim and escape the university name field
    req.sanitize("universityName").escape();
    req.sanitize("universityName").trim();
    
    //run the validators
    var errors = req.validationErrors();
    
    //create a university object with escaped and trimmed data
    var university = new University(
            {universityName: req.body.universityName}
        );
        
    if(errors){
        //If there are errors render the form again, passing the previously entered values and errors
        res.render("universities/create", {university: university, errors: errors});
        return;
    } else {
        //Data from form is valid
        //Check if University with the same name already exists
        University.findOne({"universityName": req.body.universityName}).exec(function(err, foundUniversity){
           if(err){
               return next(err);
           }
           
           if(foundUniversity) {
               //university exists redirect to 
               res.redirect(foundUniversity.url);
           } else {
               university.save(function(err){
                   if(err) return next(err);
                   //University saved. Redirect to universities page
                   res.redirect("../universities/");
               })
           }
        });
    }
};

// Display university delete form on GET
exports.university_delete_get = function(req, res, next) {
    async.parallel({
        university: function(callback) {     
            University.findById(req.params.id).exec(callback);
        },
        universities_students: function(callback) {
          Student.find({ 'university': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('universities/delete', { university: results.university, university_students: results.universities_students } );
    });
};

// Handle university delete on POST
exports.university_delete_post = function(req, res, next) {
    req.checkBody('universityid', 'University id must exist').notEmpty();  
    
    async.parallel({
        university: function(callback) {     
            University.findById(req.body.university).exec(callback);
        },
        universities_students: function(callback) {
          Student.find({ 'university': req.body.universityid },'name').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.universities_students>0) {
            //University has students. Render in same way as for GET route.
            res.render('universities/delete', { university: results.university, university_students: results.universities_students } );
            return;
        }
        else {
            //University has no students. Delete object and redirect to the list of universities.
            University.findByIdAndRemove(req.body.universityid, function deleteUniverity(err) {
                if (err) { return next(err); }
                //Success - got to university list
                res.redirect('/catalog/universities');
            });

        }
    });
};

// Display university update form on GET
exports.university_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    University.findById(req.params.id, function(err, university) {
        if (err) { return next(err); }
        //On success
        res.render('universities/edit', { university: university });
    });
};

// Handle university update on POST
exports.university_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    //Check that the name field is not empty
    req.checkBody('universityName', 'University name required').notEmpty();
    //Trim and escape the name field.
    req.sanitize('universityName').escape();
    req.sanitize('universityName').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a university object with escaped and trimmed data (and the old id!)
    var university = new University(
      {
      universityName: req.body.universityName,
      _id: req.params.id
      }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('universities/edit', { university: university, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        University.findByIdAndUpdate(req.params.id, university, {}, function (err,theuniversity) {
            if (err) { return next(err); }
               //successful - redirect to university detail page.
               res.redirect(theuniversity.url);
            });
    }
};