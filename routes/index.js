const express = require('express');

const router = express.Router();
const jsonpatch = require('json-patch');
const passport = require('passport');
const fs = require('fs');
const request = require('request');
const imageThumbnail = require('image-thumbnail');
const validUrl = require('valid-url');
const { body, validationResult } = require('express-validator/check');

router.get('/', function(req, res){
    res.status(200).json('Welcome to hackerbay api 1.0');
});

router.post('/json-patch', passport.authenticate('jwt', { session: false }), body('patch').custom((value) => {
  if (!Array.isArray(value) || typeof value !== 'object') {
    throw new Error('patch value is not an array or an object');
  }
  return true;
}), body('object').custom((value) => {
  if (typeof value !== 'object') {
    throw new Error('Value being patched is not an object');
  }
  return true;
}), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { object, patch } = req.body;

  return res.status(200).send(jsonpatch.apply(object, patch));
});

router.post('/thumbnail-create', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!validUrl.isUri(req.body.public_url)) {
    return res.status(422).send('Invalid Url');
  }
  const download = (uri, filename, callback) => {
    request.head(uri, (err, response) => {
      if (!response.headers['content-type'].includes('image')) {
        return callback('unsupported url');
      }
      request(uri).pipe(fs.createWriteStream(`public/images/${filename}`)).on('close', callback);
    });
  };
  download(req.body.public_url, 'thumbnail.png', (err) => {
    if (err) return res.status(415).send('Url not supported');
    const options = { width: 50, height: 50, responseType: 'base64' };
    imageThumbnail('public/images/thumbnail.png', options).then((thumbnail) => {
      res.status(200).end(thumbnail);
    }).catch(err => console.error(err));
  });
});

module.exports = router;
