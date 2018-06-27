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

let key;

router.get('/recommendations/auth', function(req, res, next) {

    console.log('Page reached.')// true
  
    let token = { method: 'GET',
        url: 'https://api.themoviedb.org/3/authentication/token/new',
        qs: { api_key: KEYS.MOVIEDBKEY },
        body: '{}' };
  
      request(token, function (error, response, body) {
        if (error) throw new Error(error);
        const chec = JSON.parse(body)
        key = chec.request_token
  
        res.redirect('https://www.themoviedb.org/authenticate/' + chec.request_token + '?redirect_to=http://localhost:3000/recommendations/authenticated')
  
      });
  });
  
  router.get('/recommendations/authenticated', function(req, res, next){ //?request_token=' + key + '&approved=true'
    console.log("key: " + key)
    const sess = { 
          method: 'GET',
          url: 'https://api.themoviedb.org/3/authentication/session/new',
          qs: { request_token: key,
                api_key: KEYS.MOVIEDBKEY },
          body: '{}' };
    let sessid = ""
    request(sess, function (error, response, body) {
      if (error) throw new Error(error);
      console.log(body)
      let p_body = JSON.parse(body)
      sessid = p_body.session_id
    });

    
  
    let listid = 0;
    let NewList = { method: 'POST',
                    url: 'https://api.themoviedb.org/3/list',
                    qs: { session_id: sessid,
                          api_key: KEYS.MOVIEDBKEY },
                    headers: { 'content-type': 'application/json;charset=utf-8' },
                    body: 
                    { name: 'Movie: ' + MGen1 + '/' + MGen2 + ' TV: ' + TVGen1 + '/' + TVGen2,
                      description: 'Made ' + Date.now,
                      language: 'en' },
                    json: true };
  
    request(NewList, function (error, response, body) {
      if (error) throw new Error(error);
      let p_body = JSON.parse(body)
      listid = p_body.list_id
      console.log(body);
    });
  
    let newMedia;
    
    
    console.log('user authenticated');
  
  })

  module.exports = router;