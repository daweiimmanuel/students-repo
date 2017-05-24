var Country = require("../models/country");
var Student = require("../models/student");
var async = require("async");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Display list of all Countries
exports.country_list = function(req, res, next) {
    Country.find().sort([["countryName","ascending"]]).exec(function(err, allCountries){
       if(err){
           console.log(err);
       } else{
           res.render("countries/index", {countries: allCountries});
       }
    });
};

// Display detail page for a specific Country
exports.country_detail = function(req, res, next) {
    
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      
      async.parallel({
        country: function(callback) {
            Country.findById(req.params.id).exec(callback);
        },
        country_students: function(callback) {
            Student.find({
                $and: [
                    {"country": req.params.id},
                    {"name": regex}
                    ]}).exec(callback);
        }
      }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("countries/detail", {country: results.country, country_students: results.country_students});
        }
      });
    } else {
      async.parallel({
        country: function(callback) {
            Country.findById(req.params.id).exec(callback);
        },
        country_students: function(callback) {
            Student.find({"country": req.params.id}).exec(callback);
        }
      }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("countries/detail", {country: results.country, country_students: results.country_students});
        }
      });
    }
};

// Display Country create form on GET
exports.country_create_get = function(req, res, next) {
    res.render("countries/create");
};

// Handle Country create on POST
exports.country_create_post = function(req, res, next) {
    //check that the country name field is not empty
    req.checkBody("countryName","Country Name is required").notEmpty();
    
    //trim and escape the country name field
    req.sanitize("countryName").escape();
    req.sanitize("countryName").trim();
    
    //run the validators
    var errors = req.validationErrors();
    
    //create a country object with escaped and trimmed data
    var country = new Country(
            {countryName: req.body.countryName}
        );
        
    if(errors){
        //If there are errors render the form again, passing the previously entered values and errors
        res.render("countries/create", {country: country, errors: errors});
        return;
    } else {
        //Data from form is valid
        //Check if Country with the same name already exists
        Country.findOne({"countryName": req.body.countryName}).exec(function(err, foundCountry){
           if(err){
               return next(err);
           }
           
           if(foundCountry) {
               //country exists redirect to 
               res.redirect(foundCountry.url);
           } else {
               country.save(function(err){
                   if(err) return next(err);
                   //Country saved. Redirect to countries page
                   res.redirect("../countries/");
               })
           }
        });
    }
};

// Display Country delete form on GET
exports.country_delete_get = function(req, res, next) {
    async.parallel({
        country: function(callback) {     
            Country.findById(req.params.id).exec(callback);
        },
        countries_students: function(callback) {
          Student.find({ 'country': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('countries/delete', { country: results.country, country_students: results.countries_students } );
    });
};

// Handle Country delete on POST
exports.country_delete_post = function(req, res, next) {
    req.checkBody('countryid', 'Country id must exist').notEmpty();  
    
    async.parallel({
        country: function(callback) {     
            Country.findById(req.body.countryid).exec(callback);
        },
        countries_students: function(callback) {
          Student.find({ 'country': req.body.countryid },'name').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.countries_students>0) {
            //Country has students. Render in same way as for GET route.
            res.render('countries/delete', { country: results.country, country_students: results.countries_students } );
            return;
        }
        else {
            //Country has no students. Delete object and redirect to the list of countries.
            Country.findByIdAndRemove(req.body.countryid, function deleteCountry(err) {
                if (err) { return next(err); }
                //Success - got to country list
                res.redirect('/catalog/countries');
            });

        }
    });
};

// Display Country update form on GET
exports.country_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    Country.findById(req.params.id, function(err, country) {
        if (err) { return next(err); }
        //On success
        res.render('countries/edit', { country: country });
    });
};

// Handle Country update on POST
exports.country_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    //Check that the name field is not empty
    req.checkBody('countryName', 'Country name required').notEmpty();
    //Trim and escape the name field.
    req.sanitize('countryName').escape();
    req.sanitize('countryName').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a country object with escaped and trimmed data (and the old id!)
    var country = new Country(
      {
      countryName: req.body.countryName,
      _id: req.params.id
      }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('countries/edit', { country: country, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        Country.findByIdAndUpdate(req.params.id, country, {}, function (err,thecountry) {
            if (err) { return next(err); }
               //successful - redirect to country detail page.
               res.redirect(thecountry.url);
            });
    }
};