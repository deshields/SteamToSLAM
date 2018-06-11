var express = require('express');
var router = express.Router();
var request = require('request');

// Steam Web API wrapper: https://github.com/jonbo/node-steam-webapi
var Steam = require('steam-webapi');

// Set global Steam API Key
Steam.key = "F6100AA042122997FB8739C97D50ED6A";

var userData = {
    id: '',
    ObtainedID: '',
    recentGamesRaw: [],
    recentGames: [],
    genres:{}

}

/* GET home page. */

router.param('id', function (req, res, next, value){
    userData.id = req.params.id
    Steam.ready(function(err) {
        if (err) return console.log(err);
        
        var steam = new Steam();
        
        // Retrieve the steam ID from a steam username/communityID
        steam.resolveVanityURL({vanityurl:value}, function(err, data) {
            userData.ObtainedID = data.steamid
            // data -> { steamid: '76561197968620915', success: 1 }
            data.count = 5;

            steam.getRecentlyPlayedGames(data, function(err, gamedata){
                userData.recentGamesRaw = gamedata;
                console.log(userData.recentGamesRaw)
                
                var loop, i;
                for ( loop = 0; loop < userData.recentGamesRaw.games.length; loop++){
                    userData.recentGames[loop] = userData.recentGamesRaw.games[loop]
                    
                    storeData = request('http://store.steampowered.com/api/appdetails?appids=' + userData.recentGames[loop].appid + '&filters=genres', { json: true }, (err, res, body) => {
                        if (err) { return console.log(err); }
                        console.log(Object.keys(body))
                        var t = Object.keys(body)[0]
                        var genData = body[t].data.genres
                        
                        var gen;
                        for (gen = 0; gen < genData.length; gen++){
                            console.log(t + ' gen: ' + genData[gen])
                            console.log(Object.keys(userData.genres))
                            console.log(genData[gen].description)
                            if (userData.genres.hasOwnProperty(genData[gen].description)) { 
                                console.log(' KEY IN USER ' + userData.genres[genData[gen].description])
                                userData.genres[genData[gen].description] += 1;

                            } else { userData.genres[genData[gen].description] = 1}
                        }
                        console.log(userData)



                    })

                }

                
                



                next();
            
                

            })

            // then get game 
    
        });

    
    });
    
})

/// it looks like the get runs before the middleware
router.get('/:id', function(req, res, next) {
    console.log(userData)
    console.log('check id ' + userData.ObtainedID)
    console.log('check recent ' + userData.recentGames)
    res.render('game', {title: userData.ObtainedID, game: userData.recentGames[0].name})
    
  });


  
  
  module.exports = router;