var express = require('express');
var router = express.Router();

// Steam Web API wrapper: https://github.com/jonbo/node-steam-webapi
var Steam = require('steam-webapi');

// Set global Steam API Key
Steam.key = "F6100AA042122997FB8739C97D50ED6A";

var userData = {
    id: '',
    ObtainedID: '',
    recentGamesRaw: [],
    recentGames: [],

}

/* GET home page. */

router.param('id', function (req, res, next, value){
    userData.id = req.params.id
    Steam.ready(function(err) {
        if (err) return console.log(err);
        
        var steam = new Steam();
        
        // Retrieve the steam ID from a steam username/communityID
        steam.resolveVanityURL({vanityurl:value}, function(err, data) {
            console.log(data);
            userData.ObtainedID = data.steamid
            console.log(userData.ObtainedID)
            // data -> { steamid: '76561197968620915', success: 1 }
            data.count = 5;

            steam.getRecentlyPlayedGames(data, function(err, gamedata){
                userData.recentGamesRaw = gamedata;
                console.log(userData)
                console.log(userData.recentGamesRaw)
                
                var loop;
                for ( loop = 0; loop < userData.recentGamesRaw.games.length; loop++){
                    console.log('in loop ' + userData.recentGamesRaw.games[loop])
                    userData.recentGames[loop] = userData.recentGamesRaw.games[loop]
                    console.log(userData.recentGames[loop])
                }

                console.log('out loop ' + userData.recentGames)

                next();
            
                

            })
    
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