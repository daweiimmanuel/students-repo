var Event = require("../models/event");
var Student = require("../models/student");
var async = require("async");

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Display list of all events
exports.event_list = function(req, res, next) {
    Event.find().sort([["eventName","ascending"]]).exec(function(err, allEvents){
       if(err){
           console.log(err);
       } else{
           res.render("events/index", {events: allEvents});
       }
    });
};

// Display detail page for a specific event
exports.event_detail = function(req, res, next) {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      
      async.parallel({
        event: function(callback) {
            Event.findById(req.params.id).exec(callback);
        },
        event_students: function(callback) {
            Student.find({
                $and: [
                    {"event": req.params.id},
                    {"name": regex}
                    ]}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("events/detail", {event: results.event, event_students: results.event_students});
        }
    });
    } else {
      async.parallel({
        event: function(callback) {
            Event.findById(req.params.id).exec(callback);
        },
        event_students: function(callback) {
            Student.find({"event": req.params.id}).exec(callback);
        }
    }, function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render("events/detail", {event: results.event, event_students: results.event_students});
        }
    });
    }
};

// Display event create form on GET
exports.event_create_get = function(req, res, next) {
    res.render("events/create");
};

// Handle event create on POST
exports.event_create_post = function(req, res, next) {
    //check that fields are not empty
    req.checkBody("eventName", "Event Name is required").notEmpty();
    req.checkBody("eventDate", "Invalid date").optional({checkFalsy: true}).isDate();
    
    //trim and escape
    req.sanitize("eventName").escape();
    req.sanitize("eventName").trim();
    req.sanitize("eventDate").toDate();
    
    //run the validators
    var errors = req.validationErrors();
    
    //create an event object with escaped and trimmed data
    var event = new Event({
       eventName: req.body.eventName,
       eventDate: req.body.eventDate
    });
    
    if(errors){
        //If there are errors render the form again, passing the previously entered values and errors
        res.render("events/create", {event: event, errors: errors});
        return;
    } else {
        //Data from form is valid
        //Check if Event with the same name already exists
        Event.findOne({"eventName": req.body.eventName}).exec(function(err, foundEvent){
           if(err){
               return next(err);
           }
           
           if(foundEvent) {
               //country exists redirect to 
               res.redirect(foundEvent.url);
           } else {
               event.save(function(err){
                   if(err) return next(err);
                   //Event saved. Redirect to Event page
                   res.redirect("../events/");
               })
           }
        });
    }
};

// Display event delete form on GET
exports.event_delete_get = function(req, res, next) {
    async.parallel({
        event: function(callback) {     
            Event.findById(req.params.id).exec(callback);
        },
        events_students: function(callback) {
          Student.find({ 'event': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('events/delete', { event: results.event, event_students: results.events_students } );
    });
};

// Handle event delete on POST
exports.event_delete_post = function(req, res, next) {
    req.checkBody('eventid', 'Event id must exist').notEmpty();  
    
    async.parallel({
        event: function(callback) {     
            Event.findById(req.body.eventid).exec(callback);
        },
        events_students: function(callback) {
          Student.find({ 'event': req.body.eventid },'name').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.events_students>0) {
            //Event has students. Render in same way as for GET route.
            res.render('events/delete', { event: results.event, event_students: results.events_students } );
            return;
        }
        else {
            //Event has no students. Delete object and redirect to the list of events.
            Event.findByIdAndRemove(req.body.eventid, function deleteEvent(err) {
                if (err) { return next(err); }
                //Success - got to events list
                res.redirect('/catalog/events');
            });

        }
    });
};

// Display event update form on GET
exports.event_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    Event.findById(req.params.id, function(err, event) {
        if (err) { return next(err); }
        //On success
        res.render('events/edit', { event: event });

    });
};

// Handle event update on POST
exports.event_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    req.checkBody('eventName', 'Event name must be specified.').notEmpty();
    req.checkBody('eventDate', 'Invalid date').optional({ checkFalsy: true }).isDate();
    req.sanitize('eventName').escape();
    req.sanitize('eventName').trim();
    req.sanitize('eventDate').toDate();

    //Run the validators
    var errors = req.validationErrors();

    //Create event object with escaped and trimmed data (and the old id!)
    var event = new Event(
      {
      eventName: req.body.eventName,
      eventDate: req.body.eventDate,
      _id: req.params.id
      }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('events/edit', { event: event, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        Event.findByIdAndUpdate(req.params.id, event, {}, function (err,theevent) {
            if (err) { return next(err); }
               //successful - redirect to event detail page.
               res.redirect(theevent.url);
            });
    }
};