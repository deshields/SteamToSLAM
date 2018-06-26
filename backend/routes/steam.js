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
    appid: Number,
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

//router.param('id', function (req, res, next, value){
router.get('/:id', function(req, res, next) {
    userData.id = req.params.id
    Steam.ready(function(err) {
        if (err) return console.log(err);
        
        var steam = new Steam();
        
        // Retrieve the steam ID from a steam username/communityID
        steam.resolveVanityURL({vanityurl:req.params.id}, function(err, data) {
            userData.ObtainedID = data.steamid
            data.count = 5; // receive a max of 5 recent games

            steam.getRecentlyPlayedGames(data, function(err, gamedata){
                userData.recentGamesRaw = gamedata;

                let loop, i;
                for ( loop = 0; loop < userData.recentGamesRaw.total_count; loop++){
                    userData.recentGames[loop] = userData.recentGamesRaw.games[loop]
                    gameNames[loop] = userData.recentGamesRaw.games[loop].name

                    const cur_id = userData.recentGames[loop].appid
                    const cur_name = userData.recentGames[loop].name

                    GameDB.findOne({appid: cur_id}, { _id: 0, appid: 1, name:1, genres:1}, function(err, results){
                        if(err){
                            console.error("Nope.")
                        }

                        if(!results) {
                            console.log("Object not found; making new instance...")
                            
                            storeData = request('http://store.steampowered.com/api/appdetails?appids=' + cur_id + '&filters=genres', { json: true }, (err, res, body) => {
                                if (err) { return console.log(err); }

                                let t = Object.keys(body)[0]
                                let genData = body[t].data.genres
                                let forInit = []
                                let gen;
                                
                                for (gen = 0; gen < genData.length; gen++){
                                    
                                    if(!forInit.includes(genData[gen].description)) {
                                        forInit.push(genData[gen].description)
                                    }

                                    if (userData.genres.hasOwnProperty(genData[gen].description)) { 
                                        userData.genres[genData[gen].description] += 1;

                                    } else { userData.genres[genData[gen].description] = 1}
                                }
                                
                                //console.log("User genres: " + Object.keys(userData.genres) + " " + Object.values(userData.genres))

                                newGame = new GameDB({appid: cur_id, name: cur_name, genres: forInit})
                                
                                newGame.save(function(err, newGame){
                                    if(err) return console.error("Error when saving")
                                    console.log("Saved")
                                })
                            })


                        }

                        else{
                            
                            //console.log("Object found.")
                            //console.log(results.genres)
                            for(let genre in results.genres){
                                //console.log("Current: " + results.genres[genre])
                                if (userData.genres.hasOwnProperty(results.genres[genre])) { 
                                    userData.genres[results.genres[genre]] += 1;

                                } else { userData.genres[results.genres[genre]] = 1}
                            }

                        }

                    }).lean()

                } // out of the for loop so we don't get the HTTP HEADERS ALREADY SENT error

                console.log("Waiting for calculatons...")
                setTimeout(function(){
                    console.log("Done waiting.")
                    res.redirect('/recommendations')
                }, 20000)
                
            
            })
    
        });

    
    });
    
})

router.get('/', function(req, res, next) {
    //res.render('index', {title: "Homework 2", yum: "This is the directory for homework 2. Please type a string into the URI."})
    GameDB.find({}, '-_id -__v', function(err, results) {
        if (err) return console.error("Nuh-uh");
        console.log(results)
        res.json(results)
    })
})  

//for cleaning purposes

router.delete('/', function (req, res, next) {
    GameDB.deleteMany({}, function (err, result) {
        if(!result) {res.json({message: 'String not found!'})}

        if(err) {res.json({message: 'Something went wrong while deleting'});}
        
        else {res.json({message: 'Successfully deleted.'});}
      })
})


  
  
  module.exports = {router, userData};