'use strict';

const Auth = require('../model/auth');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const basicAuth = require('../lib/basic-auth-middleware');

module.exports = function (router) {
  router.post('/signup', bodyParser, (request,response) => {
    let pw = request.body.password;
    delete request.body.password;

    let user = new Auth(request.body);

    user.generatePasswordHash(pw)
      .then(newUser => newUser.save())
      .then(userRes => userRes.generateToken())
      .then(token => response.status(201).json(token))
      .catch(err => errorHandler(err, response));
  });
  router.get('/signin', basicAuth, (request, response) => {
    Auth.findOne({ username: request.auth.username })
      .then(user =>
        user
          ? user.comparePasswordHash(request.auth.password)
          : Promise.reject(new Error('Authorization Failed. Username required.'))
      )
      .then(user => user.generateToken())
      .then(token => response.status(200).json(token))
      .catch(error => errorHandler(error, response));
  });
};