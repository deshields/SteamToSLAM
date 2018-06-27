const express = require('express');
const request = require("request");
const router = express.Router();
const result = require('./steam')
const rec = require('./rec') 
const KEYS = require('../APIKEY')

const bodyParser = require('body-parser');
const cors = require('cors');
router.use(bodyParser.urlencoded({ extended: false }))
router.use(cors());
router.use(bodyParser.json());

let reqv3, requestTok, accessTok;
let MVDBuser = "", sessid = "";


  router.get('/authV3', function(req, res, next) { 
    let v3token = { method: 'GET',
    url: 'https://api.themoviedb.org/3/authentication/token/new',
    qs: { api_key: KEYS.MOVIEDBKEY },
    body: '{}' };

  request(v3token, function (error, response, body) {
    if (error) throw new Error(error);
    const chec = JSON.parse(body)
    reqv3 = chec.request_token

    res.redirect('https://www.themoviedb.org/authenticate/' + chec.request_token + "?redirect_to=http://localhost:3000/authenticatedV3")

  })
})

  
  router.get('/authenticatedV3', function(req, res, next){
    
    // THIS IS FOR V3 BUT WE WANT THE USERNAME
    const sess = { 
        method: 'GET',
        url: 'https://api.themoviedb.org/3/authentication/session/new',
        qs: { request_token: reqv3,
              api_key: KEYS.MOVIEDBKEY },
        body: '{}' };
    

    request(sess, function (error, response, body) {
        if (error) throw new Error(error);
        console.log("Sess: " + body)
        let p_body = JSON.parse(body)
        sessid = p_body.session_id
        console.log("id: " + sessid)

        const MVDBAccount = { method: 'GET',
            url: 'https://api.themoviedb.org/3/account',
            qs: { session_id: sessid, 
                api_key: KEYS.MOVIEDBKEY },
            body: '{}' };
  
        request(MVDBAccount, function (error, response, body) {
            if (error) throw new Error(error);
            console.log("username: " + body)
            MVDBuser = body.username 
            res.redirect('http://localhost:3000/auth');
        })
    });

    // const MVDBAccount = request("https://api.themoviedb.org/3/account?api_key=" + KEYS.MOVIEDBKEY +"&session_id=" + sessid, { json: true }, (err, res, body) => {
    //     if (err) { return console.log(err); }
    //     console.log(body.url);
    //     console.log(body);
    //     console.log("username: " + body)
    //     MVDBuser = body.username 
    // })

    
        

        
    
    })

    // END OF V3 ----------------------------------- START V4

router.get('/auth', function(req, res, next) { 

    console.log('Page reached.')// true
    
    let token = { method: 'POST',
        url: 'https://api.themoviedb.org/4/auth/request_token',
        headers: 
        { 'content-type': 'application/json;charset=utf-8',
        authorization: 'Bearer ' + KEYS.READV4KEY},
        body: { redirect_to:'https://google.com'}, //this is a pain in the butt and takes forever to approve and redirect and it sucks
        json: true };
    
        request(token, function (error, response, body) {
        if (error) throw new Error(error);
        
        requestTok = body.request_token
        //res.redirect("http://localhost:3000/authenticated")
        
        });
    });   
    
 router.get('/authenticated', function(req, res, next){
    const reque = { 
            method: 'POST',
            url: 'https://api.themoviedb.org/4/auth/access_token',
            headers: 
                { 'content-type': 'application/json;charset=utf-8',
                authorization: 'Bearer ' + KEYS.READV4KEY},
            body: { request_token: requestTok },
            json: true };

    request(reque, function (error, response, body) {
      if (error) throw new Error(error);
    //   console.log(body)
      accessTok = body.access_token

        let listid = 0;
        let NewList = { method: 'POST',
                        url: 'https://api.themoviedb.org/4/list',
                        headers: { 'content-type': 'application/json;charset=utf-8',
                                    authorization: 'Bearer ' + KEYS.READV4KEY },
                        body: 
                        { name: 'Movie: ' + rec.genresOUT[0] + '/' +rec.genresOUT[1] + ' TV: ' + rec.genresOUT[2] + '/' + rec.genresOUT[3] + " --MADE " + Date.now,
                            "iso_639_1": "en"},
                        json: true };
    
        request(NewList, function (error, response, body) {
        if (error) throw new Error(error);
        
        listid = body.id
        console.log(body);

        let newMedia = [];
        for(let mid in rec.IDforMList){
            newMedia.push({media_type: 'movie', media_id: rec.IDforMList[mid]})
        }
        for(let tid in rec.IDforTList){
            newMedia.push({media_type: 'tv', media_id: rec.IDforMList[tid]})
        }
        
    
        let addRecom = { method: 'POST',
                        url: 'https://api.themoviedb.org/4/list',
                        headers: { 'content-type': 'application/json;charset=utf-8',
                                    authorization: 'Bearer ' + KEYS.READV4KEY },
                        body: { items: newMedia },
                        json: true }
    
    
            request(addRecom, function (error, response, body) {
                if (error) throw new Error(error);
                
                res.redirect("https://www.themoviedb.org/u/" + MVDBuser + "/lists")
            })


        });
    });
       
    })


  module.exports = router;