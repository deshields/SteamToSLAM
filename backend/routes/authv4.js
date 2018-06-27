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
            let p_body = JSON.parse(body)
            MVDBuser = p_body.username 
            res.redirect('http://localhost:3000/auth');
        })
    });
        
    
    })

    // END OF V3 ----------------------------------- START V4

router.get('/auth', function(req, res, next) { 

    console.log('Page reached.')
    
    var options = { method: 'POST',
        url: 'https://api.themoviedb.org/4/auth/request_token',
        headers: 
        { 'content-type': 'application/json;charset=utf-8',
            authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjMyNDY2NGUxZDAwYTVjYmJkNzc5NTY2OTczN2U4MSIsInN1YiI6IjViMTE2NDVjOTI1MTQxNWVhMDAxMmNkMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4VSomGB25dt1rkn0SrfSpyzCk3aE-TKQq2Kh4DqsVY' },
        body: { redirect_to: 'http://localhost:3000/authenticated' },
        json: true };

        request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        requestTok = body.request_token
        res.redirect("https://www.themoviedb.org/auth/access?request_token=" + requestTok)
        
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
       console.log("access: " + body.access_token)
        accessTok = body.access_token
        let mili = Date.now()
        let toDate = Date(mili).toString()
        let listid = 0;
        let NewList = { method: 'POST',
                        url: 'https://api.themoviedb.org/4/list',
                        headers: { 'content-type': 'application/json;charset=utf-8',
                                    authorization: 'Bearer ' + accessTok },
                        body: 
                        { name: 'Movie: ' + rec.genresOUT[0] + '/' +rec.genresOUT[1] + ' TV: ' + rec.genresOUT[2] + '/' + rec.genresOUT[3] + " --MADE " + toDate,
                            "iso_639_1": "en"},
                        json: true };
    
        request(NewList, function (error, response, body) {
        if (error) throw new Error(error);
        
        listid = body.id
        console.log("list: " + listid)
        console.log(body);

        let newMedia = [];
        for(let mid in rec.IDforMList){
            console.log(rec.IDforMList[mid])
            newMedia.push({media_type: 'movie', media_id: rec.IDforMList[mid]})
        }
        for(let tid in rec.IDforTList){
            newMedia.push({media_type: 'tv', media_id: rec.IDforMList[tid]})
        }
        
    
        let addRecom = { method: 'POST',
                        url: 'https://api.themoviedb.org/4/list/' + listid +"/items",
                        headers: { 'content-type': 'application/json;charset=utf-8',
                                    authorization: 'Bearer ' + accessTok },
                        body: { items: newMedia },
                        json: true }
    
    
            request(addRecom, function (error, response, body) {
                if (error) throw new Error(error);
                console.log(body)
                
                res.redirect("https://www.themoviedb.org/u/" + MVDBuser + "/lists")
            })


        });
    });
       
    })


  module.exports = router;