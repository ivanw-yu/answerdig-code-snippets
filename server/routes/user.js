var router = require('express').Router();
var User = require('.././models/user');
var _ = require('lodash');
var {authenticate} = require('.././middlewares/authenticate');
var {ObjectID} = require('mongodb');

// Note: The authenticate middleware decides whether the user will have access to the resources.
// get dashboard of user (information on user without the questions)
router.get('/dashboard', authenticate, (req, res) => {
  res.send({user: req.user});
});

router.get('/', (req, res) => {
  User.find().then((users) => {
    // will automatically call UserSchema.methods.toJSON, since res.send() calls JSON.stringify
    res.send({users});
  }).catch( (err) => {
    res.send(err);
  });
});

router.get('/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  User.findById(id).then((user) => {
    if(!user){
      return res.status(404).send();
    }
    res.send({user});
  }).catch((e) => res.status(400).send(e));
});

//register
router.post('/', (req, res) => {
  var newUser = new User(req.body);
  newUser.save().then(() => {
    //res.send(user);
    return newUser.generateAuthToken();
  }).then((result) => {
    res.header('x-auth', result.token).send({success: true, user: result.user, token: result.token, clear_password: req.body.password});
  }).catch( (err) => {
    res.status(400).send({success: false, err});
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var updatedUser = req.body;

  User.findById(updatedUser._id).then((user) => {
    user.name = updatedUser.name;
    user.email = updatedUser.email;
    user.username = updatedUser.username;
    user.password = updatedUser.password;
    user.save().then((user) => {
      res.send({success:true, user});
    }).catch((err)=>{
      res.status(400).send({success: false, err, message: "Error: Failed to update user information."});
    });
  }).catch((err) => {
    res.status(400).send({success: false, err, message: "Error: Failed to update user information."});
  });
});

router.post('/login', (req, res) => {
  var user = req.body;
  User.findByCredentials(req.body.username || req.body.email, req.body.password)
      .then( (user) => {
        if(!user){
          return res.status(404).send();
        }
        return user.generateAuthToken();
      }).then((result) => {
        res.header('x-auth', result.token).send({token: result.token, user: result.user});
      }).catch((e) => res.status(400).send('bad req'));
});

router.delete('/logout', authenticate, (req, res) => {
  var user = req.user;
  user.removeToken(req.token).then( () => {
    res.status(200).send({success: true});
  }).catch( (e) => {
    res.status(400).send();
  });
});

module.exports = router;
