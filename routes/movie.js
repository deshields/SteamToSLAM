var express = require('express');
var request = require("request");
var session = require('express-session')
var router = express.Router();
const result = require('./steam') 

var gen1, gen2, key;
const MovieGenres = { "genres": [ 
      { "id": 28, "name": "Action"},
      { "id": 12, "name": "Adventure"},
      { "id": 16, "name": "Animation"},
      { "id": 35, "name": "Comedy"},
      { "id": 80, "name": "Crime"},
      { "id": 99, "name": "Documentary"},
      { "id": 18, "name": "Drama"},
      { "id": 10751, "name": "Family"},
      { "id": 14, "name": "Fantasy"},
      { "id": 36, "name": "History"},
      { "id": 27, "name": "Horror"},
      { "id": 10402, "name": "Music"},
      { "id": 9648, "name": "Mystery"},
      { "id": 10749, "name": "Romance"},
      { "id": 878, "name": "Science Fiction"},
      { "id": 10770, "name": "TV Movie"},
      { "id": 53, "name": "Thriller"},
      { "id": 10752, "name": "War"},
      { "id": 37, "name": "Western"}
    ]
  }

var TVGenres = { "genres": [
      { "id": 10759, "name": "Action & Adventure"},
      { "id": 16, "name": "Animation"},
      { "id": 35, "name": "Comedy"},
      { "id": 80, "name": "Crime"},
      { "id": 99, "name": "Documentary"},
      { "id": 18, "name": "Drama"},
      { "id": 10751, "name": "Family"},
      { "id": 10762, "name": "Kids"},
      { "id": 9648, "name": "Mystery"},
      { "id": 10763, "name": "News"},
      { "id": 10764, "name": "Reality"},
      { "id": 10765, "name": "Sci-Fi & Fantasy"},
      { "id": 10766, "name": "Soap"},
      { "id": 10767, "name": "Talk"},
      { "id": 10768, "name": "War & Politics"},
      { "id": 37,"name": "Western"}
    ]
  }


/* GET home page. */
router.get('/recommendations', function(req, res, next) {

  console.log('Page reached.')// true

  var token = { method: 'GET',
      url: 'https://api.themoviedb.org/3/authentication/token/new',
      qs: { api_key: '4b324664e1d00a5cbbd7795669737e81' },
      body: '{}' };

    request(token, function (error, response, body) {
      if (error) throw new Error(error);
      const chec = JSON.parse(body)
      key = chec.request_token
      console.log("Check1: " + body);
      console.log("Check1.5: " + chec.request_token);

      res.redirect("https://www.themoviedb.org/authenticate/" + chec.request_token + "?redirect_to=http://localhost:3000/recommendations/authenticated")

    });
 

});

router.get('/recommendations/authenticated', function(req, res, next){
  console.log("key: " + key)
  var sess = { 
    method: 'GET',
    url: 'https://api.themoviedb.org/3/authentication/session/new',
    qs: { request_token: key,
          api_key: '4b324664e1d00a5cbbd7795669737e81' },
    body: '{}' };
  
  request(sess, function (error, response, body) {
    if (error) throw new Error(error);
  
    console.log("Check2:" + body);
  });


  console.log('user authenticated');
  next()

})

router.get('/recommendations/movie', function(req, res, next){

  var sorted = []
  for (var item in result.userData.genres){
    sorted.push([item, result.userData.genres[item]])
  }

  sorted.sort(function(a, b) { // decreasing order
    return b[1] - a[1];
  })

  gen1 = sorted[0][0] // most popular genre of game to user
  gen2 = sorted[1][0] // second-most popular genre of game to user

  console.log("most popular: " + gen1 + " 2nd most: " + gen2)


})


module.exports = router;