var mongoose = require('mongoose');
var {url} = require('./../config/config');
mongoose.connect(url);

module.exports = {mongoose};
