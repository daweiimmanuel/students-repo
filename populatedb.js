#! /usr/bin/env node

console.log('This script populates a some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

//Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Counsellor = require('./models/counsellor')
var Country = require('./models/country')
var Event = require('./models/event')
var Major = require('./models/major')
var Rating = require('./models/rating')
var School = require('./models/school')
var Student = require('./models/student')
var University = require('./models/university')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var counsellors = []
var countries = []
var events = []
var majors = []
var ratings = []
var schools = []
var students = []
var universities = []

function counsellorCreate(counsellorName, cb) {
  var counsellor = new Counsellor({ counsellorName: counsellorName });
       
  counsellor.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Counsellor: ' + counsellor);
    counsellors.push(counsellor)
    cb(null, counsellor);
  }   );
}

function countryCreate(countryName, cb) {
  var country = new Country({ countryName: countryName });
       
  country.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Country: ' + country);
    countries.push(country)
    cb(null, country);
  }   );
}

function eventCreate(eventName, eventDate, cb) {
    eventdetail = {eventName: eventName}
    
    if(eventDate != false) eventdetail.evenDate = eventDate
    
    var event = new Event(eventdetail);
       
    event.save(function (err) {
        if (err) {
          cb(err, null);
          return;
        }
        console.log('New Event: ' + event);
        events.push(event)
        cb(null, event);
        }   );
}

function majorCreate(majorName, cb) {
  var major = new Major({ majorName: majorName });
       
  major.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Major: ' + major);
    majors.push(major)
    cb(null, major);
  }   );
}

function ratingCreate(rating, cb) {
  var rating = new Rating({ rating: rating });
       
  rating.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Rating: ' + rating);
    ratings.push(rating)
    cb(null, rating);
  }   );
}

function schoolCreate(schoolName, cb) {
    var school = new School({schoolName: schoolName});
       
    school.save(function (err) {
        if (err) {
          cb(err, null);
          return;
        }
        console.log('New School: ' + school);
        schools.push(school)
        cb(null, school);
        }   );
}

function studentCreate(name, address, date_of_birth, city, telephone, mobile, bbPin, lineId, email, parentName, parentMobile, currentSchool, currentGrade, englishScore, notes, country, major, university, counsellor, rating, status, event, cb) {
    studentdetail = {
        name: name,
        address: address,
        city: city,
        telephone: telephone,
        mobile: mobile,
        bbPin: bbPin,
        lineId: lineId,
        email: email,
        parentName: parentName,
        parentMobile: parentMobile,
        currentGrade: currentGrade,
        englishScore: englishScore,
        notes: notes
    }
    if(date_of_birth != false) studentdetail.date_of_birth = date_of_birth
    if(currentSchool != false) studentdetail.currentSchool = currentSchool
    if(country != false) studentdetail.country = country
    if(major != false) studentdetail.major = major
    if(university != false) studentdetail.university = university
    if(counsellor != false) studentdetail.counsellor = counsellor
    if(rating != false) studentdetail.rating = rating
    if(status != false) studentdetail.status = status
    if(event != false) studentdetail.event = event
    
    var student = new Student(studentdetail);
    
    student.save(function(err) {
        if(err){
            cb(err, null)
            return
        }
        console.log('New Student: ' + student);
        students.push(student)
        cb(null, student)
    });
}

function universityCreate(universityName, cb) {
  var university = new University({ universityName: universityName });
       
  university.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New University: ' + university);
    universities.push(university)
    cb(null, university);
  }   );
}

function createCounsellorCountryEventMajorRatingSchoolUniversity(cb) {
    async.parallel([
        function(callback) {
            counsellorCreate("David", callback);
        },
        function(callback) {
            counsellorCreate("Yonathan", callback);
        },
        function(callback) {
            counsellorCreate("Andrew", callback);
        },
        function(callback) {
            counsellorCreate("Imam", callback);
        },
        function(callback) {
            countryCreate("US", callback);
        },
        function(callback) {
            countryCreate("UK", callback);
        },
        function(callback) {
            countryCreate("Australia", callback);
        },
        function(callback){
            countryCreate("Singapore", callback);
        },
        function(callback) {
            countryCreate("New Zealand", callback);
        },
        function(callback) {
            eventCreate("Alfalink Edufair", "2016-08-10", callback);
        },
        function(callback) {
            eventCreate("Loyola Edufair", "2016-09-08", callback);
        },
        function(callback) {
            eventCreate("Sedes Edufair", "2016-09-12", callback);
        },
        function(callback) {
            majorCreate("Computer Science", callback);
        },
        function(callback) {
            majorCreate("Business Management", callback);
        },
        function(callback) {
            majorCreate("Hospitality Management", callback);
        },
        function(callback) {
            majorCreate("Mechanical Engineering", callback);
        },
        function(callback) {
            majorCreate("Architecture", callback);
        },
        function(callback) {
            majorCreate("Chemical Engineering", callback);
        },
        function(callback) {
            ratingCreate(1, callback);
        },
        function(callback) {
            ratingCreate(2, callback);
        },
        function(callback) {
            ratingCreate(3, callback);
        },
        function(callback) {
            schoolCreate("Bina Bangsa School", callback);
        },
        function(callback) {
            schoolCreate("Loyola", callback);
        },
        function(callback) {
            schoolCreate("Karangturi", callback);
        },
        function(callback) {
            schoolCreate("Sedes", callback);
        },
        function(callback) {
            schoolCreate("Krista Mitra", callback);
        },
        function(callback) {
            schoolCreate("SMAN 3", callback);
        },
        function(callback) {
            universityCreate("Harvard", callback);
        },
        function(callback) {
            universityCreate("MIT", callback);
        },
        function(callback) {
            universityCreate("Monash", callback);
        },
        function(callback) {
            universityCreate("Swinburne", callback);
        },
        function(callback) {
            universityCreate("Le Cordon Bleu", callback);
        },
        function(callback) {
            universityCreate("Curtin", callback);
        },
        function(callback) {
            universityCreate("RMIT", callback);
        }
        ],
        //optional callback
        cb);
}

function createStudents(cb) {
    async.parallel([
        function(callback) {
            studentCreate("Ivan Immanuel", "Jl. Permata Semeru B-15", "1996-01-21", "Semarang", "024-8449612", "08123456789", "DB123A", "ivani", "ivanimm@ymail.com", "Yonathan Immanuel", "0816666527", schools[5], "11", "IELTS 6.0", "LALALA", [countries[1], countries[2]], [majors[1], majors[3], majors[5]], [universities[2], universities[4]], counsellors[1], ratings[1], "Active", events[1], callback);
        },
        function(callback) {
            studentCreate("David Immanuel", "Jl. Permata Semeru B-15", "1994-08-16", "Semarang", "024-8449612", "085866621111", "ABCDE1", "davidi", "davidimmanuel@gmail.com", "Yonathan Immanuel", "0816666527", schools[3], "11", "IELTS 6.0", "LALALA", [countries[3], countries[4]], [majors[1], majors[2], majors[4]], [universities[1], universities[3]], counsellors[3], ratings[2], "Active", events[2], callback);
        }
        ],
    //optional callback
    cb);
}

async.series([
    createCounsellorCountryEventMajorRatingSchoolUniversity,
    createStudents
],
// optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Students: '+ students);
        
    }
    //All done, disconnect from database
    mongoose.connection.close();
});