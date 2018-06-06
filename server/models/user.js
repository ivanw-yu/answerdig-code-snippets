var mongoose = require('mongoose');
var validator = require('validator');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var utils = require('.././utils/dbhelper');
var Schema = mongoose.Schema, ObjectId = mongoose.Types.ObjectId;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    minlength: 2,
    required: true,
    lowercase: true,
    unique: true
  },
  name: {
    first: {type: String, trim: true, required: true},
    last: {type: String, trim: true, required: true},
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
    validate : {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true
  },
  tokens : [{
    access: {type: String, required: true},
    token: {type: String, required: true}
  }]
},
{runSettersOnQuery: true});

// whenever user.save() is called, the callback function executes before the user is updated in database.
userSchema.pre('save', function(next){
  var user = this;
  user.name.first = utils.capitalizeFirstLowerCaseElse(this.name.first);
  user.name.last = utils.capitalizeFirstLowerCaseElse(this.name.last);

  // checks if the password was modified
  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  }else{
    next();
  }
});

userSchema.statics.findByToken = function(token){
  var User = this;
  var decoded;

  try{
    decoded = jwt.verify(token, 'secretkey');
  } catch(e){
    return new Promise((resolve, reject) => reject());
  }
  return User.findOne({ '_id': decoded._id,
                        'tokens.token': token,
                        'tokens.access': 'auth'});
}

// prevents password from being sent when res.send() is called
userSchema.methods.toJSON = function(){
  var user = this;
  return _.pick(user, ['_id', 'username', 'email', 'name']);
}

userSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'secretkey').toString();
  user.tokens.push({access, token});
  return user.save().then(() => {
    return {token, user};
  });
}

userSchema.methods.removeToken = function(token){
  var user = this;

  if(!token){
      return Promise.reject();
  }

  return user.update({
    $pull: {
      tokens : {token}
    }
  });
}

var passwordMatch = (password, actual, user) => {

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, actual, (err,res) => {
      if(res){
        resolve(user);
      }else{
        reject();
      }
    });
  });
}

userSchema.statics.findByCredentials = function(usernameOrEmail, password){
  var User = this;
  return User.findOne({username: usernameOrEmail}).then( (user) => {
    if(!user){
      return User.findOne({email: usernameOrEmail}).then( (user) => {
        if(!user){
          return Promise.reject();
        }
        return passwordMatch(password, user.password, user);
      });
    }
    return passwordMatch(password, user.password, user);
  });
};

module.exports = mongoose.model('User', userSchema);
