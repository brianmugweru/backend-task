const express = require('express');

const router = express.Router();
const jsonpatch = require('json-patch');
const passport = require('passport');
const fs = require('fs');
const request = require('request');
const imageThumbnail = require('image-thumbnail');
const validUrl = require('valid-url');
const { body, validationResult } = require('express-validator/check');

/* GET home page. */
router.post('/json-patch', passport.authenticate('jwt', { session: false }), body('patch').custom((value) => {
  if (!Array.isArray(value)) {
    throw new Error('patch value is not an array');
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
  const { document, patch } = req.body;
  return res.status(200).send(jsonpatch.apply(document, patch));
});

router.post('/thumbnail-create', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!validUrl.isUri(req.body.public_url)) {
    return res.status(422).send('Invalid Url');
  }
  const download = function (uri, filename, callback) {
    request.head(uri, (err, response, body) => {
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
