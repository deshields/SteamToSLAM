var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/wait', function(req, res, next) {
  res.render('wait');
});

module.exports = router;
