var express = require('express');
var session = require('express-session')
var router = express.Router();
var request = require('request');


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/steamid');
mongoose.Promise = global.Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connection successful.')
});

const Schema = mongoose.Schema;

// when implementing mongodb, we're gonna store the games we pull from the steam api
// we will store:
//      appid
//      name
//      genres

const GameSchema = new Schema({
    app_id: Number,
    name: String,
    genres: [String]
})

var GameDB = mongoose.model('Game', GameSchema);


// Steam Web API wrapper: https://github.com/jonbo/node-steam-webapi
var Steam = require('steam-webapi');

// Set global Steam API Key
Steam.key = "F6100AA042122997FB8739C97D50ED6A";

const userData = {
    id: '',
    ObtainedID: '',
    recentGamesRaw: [],
    recentGames: [],
    genres:{}

}

const gameNames = []

router.param('id', function (req, res, next, value){
    userData.id = req.params.id
    Steam.ready(function(err) {
        if (err) return console.log(err);
        
        var steam = new Steam();
        
        // Retrieve the steam ID from a steam username/communityID
        steam.resolveVanityURL({vanityurl:value}, function(err, data) {
            userData.ObtainedID = data.steamid
            data.count = 5; // receive a max of 5 recent games

            steam.getRecentlyPlayedGames(data, function(err, gamedata){
                userData.recentGamesRaw = gamedata;

                var loop, i;
                for ( loop = 0; loop < userData.recentGamesRaw.total_count; loop++){
                    userData.recentGames[loop] = userData.recentGamesRaw.games[loop]
                    gameNames[loop] = userData.recentGamesRaw.games[loop].name

                    const cur_id = userData.recentGames[loop].appid
                    const cur_name = userData.recentGames[loop].name

                    GameDB.findOne({app_id: cur_id}, { _id: 0, app_id: 1, name:1, genres:1}, function(err, results){
                        if(err){
                            console.error("Nope.")
                        }

                        if(!results) {
                            console.log("Object not found; making new instance...")
                            
                            storeData = request('http://store.steampowered.com/api/appdetails?appids=' + cur_id + '&filters=genres', { json: true }, (err, res, body) => {
                                if (err) { return console.log(err); }

                                var t = Object.keys(body)[0]
                                var genData = body[t].data.genres
                                var forInit = []
                                var gen;
                                
                                for (gen = 0; gen < genData.length; gen++){
                                    
                                    if(!forInit.includes(genData[gen].description)) {
                                        forInit.push(genData[gen].description)
                                    }

                                    if (userData.genres.hasOwnProperty(genData[gen].description)) { 
                                        userData.genres[genData[gen].description] += 1;

                                    } else { userData.genres[genData[gen].description] = 1}
                                }

                                newGame = new GameDB({appid: cur_id, name: cur_name, genres: forInit})
                            })


                        }

                        else{
                            console.log("Object found.")
                            console.log(results)
                        }

                    })

                } // out of the for loop so we don't get the HTTP HEADERS ALREADY SENT error

                next();
            
            })
    
        });

    
    });
    
})

router.get('/:id', function(req, res, next) {
    console.log("Final check: " + userData) 
    res.redirect('/recommendations')
  });
  
  
  module.exports = {router, userData};