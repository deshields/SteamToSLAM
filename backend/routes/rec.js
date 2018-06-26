const express = require('express');
const request = require("request");
const router = express.Router();
const result = require('./steam') 
const KEYS = require('../APIKEY')

const bodyParser = require('body-parser');
const cors = require('cors');
router.use(bodyParser.urlencoded({ extended: false }))
router.use(cors());
router.use(bodyParser.json());

let gen1, gen2, key;
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

const TVGenres = { "genres": [
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

const SteamGenres = { // [[MovieGenre], [TVGenre]]
  "Videos": [["TV Movie"], ['News', 'Talk']],
  "Action":  [['Action'], ['Action & Adventure']],
  "Strategy": [['War', 'Crime'], ['War & Politics']],
  "Indie": [['Thriller', 'Horror', 'Mystery', 'Comedy'], ['Comedy', 'Mystery']],
  "RPG": [['Fantasy', 'Science Fiction'], ["Sci-Fi & Fantasy", 'Western']],
  "Video Production": [['Documentary'], ['Documentary', 'Reality']],
  "Free to Play": [['TV Movie'], ['Talk', 'Soap']], 
  "Adventure": [['Adventure'],['Action & Adventure']],
  "Simulation": [['Science Fiction', 'Romance', 'History'], ["Sci-Fi & Fantasy", 'Western']],
  "Animation & Modeling": [["Animation"],["Animation", 'Kids', 'Family']],
  "Casual": [["Family"], ['Family', 'Kids']],
  "Massively Multiplayer": [['Drama'], ['Drama', 'Soap']],
  "Early Access": [['Adventure'],['Action & Adventure', 'News']],
  "Audio Production": [['Music', 'Documentary'], ['Documentary']],
  "Web Publishing": [['Family'], ['Family']],
  "Education": [['Documentary', 'History'], ['Documentary']],
  "Accounting": [['Crime'], ['Crime', 'Reality', 'Talk']] 
}

router.get('/recommendations/', function(req, res, next){

  let sorted = []

  //console.log(result.userData)
  for (let item in result.userData.genres){
    sorted.push([item, result.userData.genres[item]])
  }

  sorted.sort(function(a, b) { // decreasing order
    return b[1] - a[1];
  })

  gen1 = sorted[0][0] // most popular genre of game to user
  gen2 = sorted[1][0] // second-most popular genre of game to user

  console.log("most popular: " + gen1 + " 2nd most: " + gen2)

  MovieRec1 = SteamGenres[gen1][0]
  MovieRec2 = SteamGenres[gen2][0]
  TVRec1 = SteamGenres[gen1][1]
  TVRec2 = SteamGenres[gen2][1]

  MGen1 = MovieRec1[Math.floor(Math.random() * MovieRec1.length)]
  MGen2 = MovieRec2[Math.floor(Math.random() * MovieRec2.length)]
  TVGen1 = TVRec1[Math.floor(Math.random() * TVRec1.length)]
  TVGen2 = TVRec2[Math.floor(Math.random() * TVRec2.length)]

  console.log("MG1: " + MGen1 + " MG2: " + MGen2)

  let movieIDS = [], TVIDS = [];

  for(let movie in MovieGenres['genres']){
    if(MovieGenres['genres'][movie]['name'] == MGen1 || MovieGenres['genres'][movie]['name'] == MGen2){ movieIDS.push(MovieGenres['genres'][movie]['id']) }   
  }
  
  for(let tv in TVGenres['genres']){
    if(TVGenres['genres'][tv]['name'] == TVGen1 || TVGenres['genres'][tv]['name'] == TVGen2){ TVIDS.push(TVGenres['genres'][tv]['id']) }   
  }
  console.log(TVIDS)

  //attach items in list into a string like in line 145

  let MVRecByID = { method: 'GET',
          url: 'https://api.themoviedb.org/3/discover/movie',
          qs: { with_genres: movieIDS.toString(),
                page: '1',
                include_video: 'false',
                include_adult: 'false',
                sort_by: 'popularity.desc',
                language: 'en-US',
                api_key: KEYS.MOVIEDBKEY },
          body: '{}' };

  let TVRecByID = { method: 'GET',
          url: 'https://api.themoviedb.org/3/discover/tv',
          qs: { with_genres: TVIDS.toString(),
                page: '1',
                include_video: 'false',
                include_adult: 'false',
                sort_by: 'popularity.desc',
                language: 'en-US',
                api_key: KEYS.MOVIEDBKEY },
          body: '{}' };
    
    let movie_names = [], tv_names = [], IDforList = [];

    request(MVRecByID, function (error, response, body) {
        if (error) throw new Error(error);
        
        const parsed = JSON.parse(body)

        for(let object in parsed.results){
          
          movie_names.push(parsed.results[object].title)
          IDforList.push(parsed.results[object].id)
        }
        console.log(movie_names);
    });

    request(TVRecByID, function (error, response, body) {
      if (error) throw new Error(error);

      
      const parsed2 = JSON.parse(body)

      for(let object2 in parsed2.results){  
        tv_names.push(parsed2.results[object2].name)
        IDforList.push(parsed2.results[object2].id)
      }

      console.log(tv_names);
      
});
setTimeout(function(){
    res.render('game', {title: result.userData.id, movies: movie_names, tv: tv_names})},
    15000)
})




module.exports = router;