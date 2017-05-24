var Counsellor = require("../models/counsellor");
var Student = require("../models/student");
var async = require("async");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Display list of all Counsellors
exports.counsellor_list = function(req, res, next) {
    Counsellor.find().sort([["counsellorName","ascending"]]).exec(function(err, allCounsellors){
       if(err){
           console.log(err);
       } else{
           res.render("counsellors/index", {counsellors: allCounsellors});
       }
    });
};

// Display detail page for a specific Counsellor
exports.counsellor_detail = function(req, res, next) {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      
      async.parallel({
        counsellor: function(callback) {
            Counsellor.findById(req.params.id).exec(callback);
        },
        counsellor_students: function(callback) {
            Student.find({
                $and: [
                    {"counsellor": req.params.id},
                    {"name": regex}
                    ]}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("counsellors/detail", {counsellor: results.counsellor, counsellor_students: results.counsellor_students});
        }
    });
    } else {
      async.parallel({
        counsellor: function(callback) {
            Counsellor.findById(req.params.id).exec(callback);
        },
        counsellor_students: function(callback) {
            Student.find({"counsellor": req.params.id}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("counsellors/detail", {counsellor: results.counsellor, counsellor_students: results.counsellor_students});
        }
    });
    }
};

// Display Counsellor create form on GET
exports.counsellor_create_get = function(req, res, next) {
    res.render("counsellors/create");
};

// Handle Counsellor create on POST
exports.counsellor_create_post = function(req, res, next) {
    //check that the counsellor name is not empty
    req.checkBody("counsellorName", "Counsellor Name is required").notEmpty();
    
    //trim and escape
    req.sanitize("counsellorName").escape();
    req.sanitize("counsellorName").trim();
    
    //run the validators
    var errors = req.validationErrors();
    
    //create a counsellor object with escaped and trimmed data
    var counsellor = new Counsellor({
        counsellorName: req.body.counsellorName
    });
    
    if(errors){
        ////If there are errors render the form again, passing the previously entered values and errors
        res.render("counsellors/create", {counsellor: counsellor, errors: errors});
        return;
    } else {
        //data from form is valid
        //check if counsellor with the same name is already exists
        Counsellor.findOne({"counsellorName": req.body.counsellorName}).exec(function(err, foundCounsellor){
           if(err){
               return next(err);
           }
           
           if(foundCounsellor){
               //counsellor exists redirect to
               res.redirect(foundCounsellor.url);
           } else {
               counsellor.save(function(err, counsellor){
                   if(err){
                       return next(err);
                   } else {
                       //counsellor saved redirect to counsellors page
                       res.redirect("../counsellors/");
                   }
               });
           }
        });
    }
    
    
};

// Display Counsellor delete form on GET
exports.counsellor_delete_get = function(req, res, next) {
    async.parallel({
        counsellor: function(callback) {     
            Counsellor.findById(req.params.id).exec(callback);
        },
        counsellors_students: function(callback) {
          Student.find({ 'counsellor': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('counsellors/delete', { counsellor: results.counsellor, counsellor_students: results.counsellors_students } );
    });
};

// Handle Counsellor delete on POST
exports.counsellor_delete_post = function(req, res, next) {
    req.checkBody('counsellorid', 'Counsellor id must exist').notEmpty();  
    
    async.parallel({
        counsellor: function(callback) {     
            Counsellor.findById(req.body.counsellorid).exec(callback);
        },
        counsellors_students: function(callback) {
          Student.find({ 'counsellor': req.body.counsellorid },'name').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.counsellors_students>0) {
            //Counsellor has students. Render in same way as for GET route.
            res.render('counsellors/delete', { counsellor: results.counsellor, counsellor_students: results.counsellors_students } );
            return;
        }
        else {
            //Counsellor has no students. Delete object and redirect to the list of counsellors.
            Counsellor.findByIdAndRemove(req.body.counsellorid, function deleteCounsellor(err) {
                if (err) { return next(err); }
                //Success - got to counsellor list
                res.redirect('/catalog/counsellors');
            });

        }
    });
};

// Display Counsellor update form on GET
exports.counsellor_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    Counsellor.findById(req.params.id, function(err, counsellor) {
        if (err) { return next(err); }
        //On success
        res.render('counsellors/edit', { counsellor: counsellor });

    });
};

// Handle Counsellor update on POST
exports.counsellor_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    req.checkBody('counsellorName', 'Counsellor name must be specified.').notEmpty();
    req.sanitize('counsellorName').escape();
    req.sanitize('counsellorName').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a Counsellor object with escaped and trimmed data (and the old id!)
    var counsellor = new Counsellor(
      {
      counsellorName: req.body.counsellorName,
      _id: req.params.id
      }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('counsellors/edit', { counsellor: counsellor, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        Counsellor.findByIdAndUpdate(req.params.id, counsellor, {}, function (err,thecounsellor) {
            if (err) { return next(err); }
               //successful - redirect to counsellor detail page.
               res.redirect(thecounsellor.url);
            });
    }
};