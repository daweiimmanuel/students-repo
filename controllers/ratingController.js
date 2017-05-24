var Rating = require("../models/rating");
var Student =require("../models/student");
var async = require("async");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Display list of all ratings
exports.rating_list = function(req, res, next) {
    Rating.find().sort([["rating","ascending"]]).exec(function(err, allRatings){
       if(err){
           console.log(err);
       } else{
           res.render("ratings/index", {ratings: allRatings});
       }
    });
};

// Display detail page for a specific rating
exports.rating_detail = function(req, res, next) {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      
      async.parallel({
        rating: function(callback) {
            Rating.findById(req.params.id).exec(callback);
        },
        rating_students: function(callback) {
            Student.find({$and: [
                {"rating": req.params.id},
                {"name": regex}
                ]}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("ratings/detail", {rating: results.rating, rating_students: results.rating_students});
        }
    });
    } else {
      async.parallel({
        rating: function(callback) {
            Rating.findById(req.params.id).exec(callback);
        },
        rating_students: function(callback) {
            Student.find({"rating": req.params.id}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("ratings/detail", {rating: results.rating, rating_students: results.rating_students});
        }
    });
    }
};

// Display rating create form on GET
exports.rating_create_get = function(req, res, next) {
    res.render("ratings/create");
};

// Handle rating create on POST
exports.rating_create_post = function(req, res, next) {
    //check that rating field is not empty
    req.checkBody("rating", "Rating is required").notEmpty();
    
    //trim and escape data
    req.sanitize("rating").escape();
    req.sanitize("rating").trim();
    
    //run the validators
    var errors = req.validationErrors();
    
    //create a rating object with trimmed and escaped data
    var rating = new Rating({
       rating: req.body.rating 
    });
    
    if(errors){
        //If there are errors render the form again, passing the previously entered values and errors
        res.render("ratings/create", {rating: rating, errors: errors});
        return;
    } else {
        //Data from form is valid
        //Check if rating with same value is already exists
        Rating.findOne({"rating": req.body.rating}).exec(function(err, foundRating) {
            if(err){
                return next(err);
            }
            
            if(foundRating){
                //rating exists redirect to
                res.redirect(foundRating.url);
            } else {
                rating.save(function(err){
                    if(err) return next(err);
                    //Rating saved redirect to ratings page
                    res.redirect("../ratings/");
                })
            }
        })
    }
    
};

// Display rating delete form on GET
exports.rating_delete_get = function(req, res, next) {
    async.parallel({
        rating: function(callback) {     
            Rating.findById(req.params.id).exec(callback);
        },
        ratings_students: function(callback) {
          Student.find({ 'rating': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('ratings/delete', { rating: results.rating, rating_students: results.ratings_students } );
    });
};

// Handle rating delete on POST
exports.rating_delete_post = function(req, res, next) {
    req.checkBody('ratingid', 'Rating id must exist').notEmpty();  
    
    async.parallel({
        rating: function(callback) {     
            Rating.findById(req.body.ratingid).exec(callback);
        },
        ratings_students: function(callback) {
          Student.find({ 'rating': req.body.ratingid },'name').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.ratings_students>0) {
            //Rating has students. Render in same way as for GET route.
            res.render('ratings/delete', { rating: results.rating, rating_students: results.ratings_students } );
            return;
        }
        else {
            //Rating has no students. Delete object and redirect to the list of ratings.
            Rating.findByIdAndRemove(req.body.ratingid, function deleteRating(err) {
                if (err) { return next(err); }
                //Success - got to rating list
                res.redirect('/catalog/ratings');
            });

        }
    });
};

// Display rating update form on GET
exports.rating_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    Rating.findById(req.params.id, function(err, rating) {
        if (err) { return next(err); }
        //On success
        res.render('ratings/edit', { rating: rating });
    });
};

// Handle rating update on POST
exports.rating_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    //Check that the name field is not empty
    req.checkBody('rating', 'Rating required').notEmpty();
    //Trim and escape the name field.
    req.sanitize('rating').escape();
    req.sanitize('rating').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a rating object with escaped and trimmed data (and the old id!)
    var rating = new Rating(
      {
      rating: req.body.rating,
      _id: req.params.id
      }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('ratings/edit', { rating: rating, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        Rating.findByIdAndUpdate(req.params.id, rating, {}, function (err,therating) {
            if (err) { return next(err); }
               //successful - redirect to rating detail page.
               res.redirect(therating.url);
            });
    }
};