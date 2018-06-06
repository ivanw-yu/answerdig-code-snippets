var User = require('.././models/user.js');

/* This is how the authenticate middleware works:
    1. If user is logged in, the token can be found in the local storage
      from the client side code of the application, the token is placed
      on the x-auth header of the request. Also, the user document in the
      User collection of the database is updated with the token upon logging in
      properly.

    2. This middleware checks if the x-auth header has the token and if the token is
      in the user document in the database. If not, a 401 Unauthorized response is sent.
      Otherwise, the user is authenticated and the middleware attaches the user and token
      to the req variable for the next middleware to access.

*/
var authenticate = (req, res, next) => {
  var token = req.header('x-auth');
  User.findByToken(token).then((user) => {
    if(!user){
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send({"success" : "false"});
  });
}

module.exports = {authenticate};
