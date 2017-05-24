var express = require("express");
var router = express.Router();

// Require controller modules
var counsellor_controller = require("../controllers/counsellorController");
var country_controller = require("../controllers/countryController");
var event_controller = require("../controllers/eventController");
var major_controller = require("../controllers/majorController");
var rating_controller = require("../controllers/ratingController");
var school_controller = require("../controllers/schoolController");
var student_controller = require("../controllers/studentController");
var university_controller = require("../controllers/universityController");

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

/// STUDENT ROUTES ///

/* GET catalog home page. */
router.get('/', isLoggedIn, student_controller.index);

/* GET request for creating a Student. NOTE This must come before routes that display Student (uses id) */
router.get('/student/create', isLoggedIn, student_controller.student_create_get);

/* POST request for creating Student. */
router.post('/student/create', isLoggedIn, student_controller.student_create_post);

/* GET request to delete Student. */
router.get('/student/:id/delete', isLoggedIn, student_controller.student_delete_get);

// POST request to delete Student
router.post('/student/:id/delete', isLoggedIn, student_controller.student_delete_post);

/* GET request to update Student. */
router.get('/student/:id/update', isLoggedIn, student_controller.student_update_get);

// POST request to update Student
router.post('/student/:id/update', isLoggedIn, student_controller.student_update_post);

/* GET request for one Student. */
router.get('/student/:id', isLoggedIn, student_controller.student_detail);

/* GET request for list of all Student items. */
router.get('/students', isLoggedIn, student_controller.student_list);

/// COUNSELLOR ROUTES ///

/* GET request for creating counsellor. NOTE This must come before route for id (i.e. display counsellor) */
router.get('/counsellor/create', isLoggedIn, counsellor_controller.counsellor_create_get);

/* POST request for creating counsellor. */
router.post('/counsellor/create', isLoggedIn, counsellor_controller.counsellor_create_post);

/* GET request to delete counsellor. */
router.get('/counsellor/:id/delete', isLoggedIn, counsellor_controller.counsellor_delete_get);

// POST request to delete counsellor
router.post('/counsellor/:id/delete', isLoggedIn, counsellor_controller.counsellor_delete_post);

/* GET request to update counsellor. */
router.get('/counsellor/:id/update', isLoggedIn, counsellor_controller.counsellor_update_get);

// POST request to update counsellor
router.post('/counsellor/:id/update', isLoggedIn, counsellor_controller.counsellor_update_post);

/* GET request for one counsellor. */
router.get('/counsellor/:id', isLoggedIn, counsellor_controller.counsellor_detail);

/* GET request for list of all counsellors. */
router.get('/counsellors', isLoggedIn, counsellor_controller.counsellor_list);

/// COUNTRY ROUTES ///

/* GET request for creating a country. NOTE This must come before route that displays country (uses id) */
router.get('/country/create', isLoggedIn, country_controller.country_create_get);

/* POST request for creating country. */
router.post('/country/create', isLoggedIn, country_controller.country_create_post);

/* GET request to delete country. */
router.get('/country/:id/delete', isLoggedIn, country_controller.country_delete_get);

// POST request to delete country
router.post('/country/:id/delete', isLoggedIn, country_controller.country_delete_post);

/* GET request to update country. */
router.get('/country/:id/update', isLoggedIn, country_controller.country_update_get);

// POST request to update country
router.post('/country/:id/update', isLoggedIn, country_controller.country_update_post);

/* GET request for one country. */
router.get('/country/:id', isLoggedIn, country_controller.country_detail);

/* GET request for list of all country. */
router.get('/countries', isLoggedIn, country_controller.country_list);

/// MAJOR ROUTES ///

/* GET request for creating a major. NOTE This must come before route that displays major (uses id) */
router.get('/major/create', isLoggedIn, major_controller.major_create_get);

/* POST request for creating major. */
router.post('/major/create', isLoggedIn, major_controller.major_create_post);

/* GET request to delete major. */
router.get('/major/:id/delete', isLoggedIn, major_controller.major_delete_get);

// POST request to delete major
router.post('/major/:id/delete', isLoggedIn, major_controller.major_delete_post);

/* GET request to update major. */
router.get('/major/:id/update', isLoggedIn, major_controller.major_update_get);

// POST request to update major
router.post('/major/:id/update', isLoggedIn, major_controller.major_update_post);

/* GET request for one major. */
router.get('/major/:id', isLoggedIn, major_controller.major_detail);

/* GET request for list of all major. */
router.get('/majors', isLoggedIn, major_controller.major_list);

/// EVENT ROUTES ///

/* GET request for creating a event. NOTE This must come before route that displays event (uses id) */
router.get('/event/create', isLoggedIn, event_controller.event_create_get);

/* POST request for creating event. */
router.post('/event/create', isLoggedIn, event_controller.event_create_post);

/* GET request to delete event. */
router.get('/event/:id/delete', isLoggedIn, event_controller.event_delete_get);

// POST request to delete event
router.post('/event/:id/delete', isLoggedIn, event_controller.event_delete_post);

/* GET request to update event. */
router.get('/event/:id/update', isLoggedIn, event_controller.event_update_get);

// POST request to update event
router.post('/event/:id/update', isLoggedIn, event_controller.event_update_post);

/* GET request for one event. */
router.get('/event/:id', isLoggedIn, event_controller.event_detail);

/* GET request for list of all event. */
router.get('/events', isLoggedIn, event_controller.event_list);

/// RATING ROUTES ///

/* GET request for creating a rating. NOTE This must come before route that displays rating (uses id) */
router.get('/rating/create', isLoggedIn, rating_controller.rating_create_get);

/* POST request for creating rating. */
router.post('/rating/create', isLoggedIn, rating_controller.rating_create_post);

/* GET request to delete rating. */
router.get('/rating/:id/delete', isLoggedIn, rating_controller.rating_delete_get);

// POST request to delete rating
router.post('/rating/:id/delete', isLoggedIn, rating_controller.rating_delete_post);

/* GET request to update rating. */
router.get('/rating/:id/update', isLoggedIn, rating_controller.rating_update_get);

// POST request to update rating
router.post('/rating/:id/update', isLoggedIn, rating_controller.rating_update_post);

/* GET request for one rating. */
router.get('/rating/:id', isLoggedIn, rating_controller.rating_detail);

/* GET request for list of all rating. */
router.get('/ratings', isLoggedIn, rating_controller.rating_list);

/// SCHOOL ROUTES ///

/* GET request for creating a school. NOTE This must come before route that displays school (uses id) */
router.get('/school/create', isLoggedIn, school_controller.school_create_get);

/* POST request for creating school. */
router.post('/school/create', isLoggedIn, school_controller.school_create_post);

/* GET request to delete school. */
router.get('/school/:id/delete', isLoggedIn, school_controller.school_delete_get);

// POST request to delete school
router.post('/school/:id/delete', isLoggedIn, school_controller.school_delete_post);

/* GET request to update school. */
router.get('/school/:id/update', isLoggedIn, school_controller.school_update_get);

// POST request to update school
router.post('/school/:id/update', isLoggedIn, school_controller.school_update_post);

/* GET request for one school. */
router.get('/school/:id', isLoggedIn, school_controller.school_detail);

/* GET request for list of all school. */
router.get('/schools', isLoggedIn, school_controller.school_list);

/// university ROUTES ///

/* GET request for creating a university. NOTE This must come before route that displays university (uses id) */
router.get('/university/create', isLoggedIn, university_controller.university_create_get);

/* POST request for creating university. */
router.post('/university/create', isLoggedIn, university_controller.university_create_post);

/* GET request to delete university. */
router.get('/university/:id/delete', isLoggedIn, university_controller.university_delete_get);

// POST request to delete university
router.post('/university/:id/delete', isLoggedIn, university_controller.university_delete_post);

/* GET request to update university. */
router.get('/university/:id/update', isLoggedIn, university_controller.university_update_get);

// POST request to update university
router.post('/university/:id/update', isLoggedIn, university_controller.university_update_post);

/* GET request for one university. */
router.get('/university/:id', isLoggedIn, university_controller.university_detail);

/* GET request for list of all university. */
router.get('/universities', isLoggedIn, university_controller.university_list);


module.exports = router;