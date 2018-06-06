var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = mongoose.Schema.Types.ObjectId;
var {ObjectID} = require('mongodb');
var utils = require('.././utils/dbhelper');

var questionSchema = new Schema({
  subject : {
    type: String,
    required: true,
    trim: true,
    match: /[a-zA-Z0-9]+/
  },
  content : {
    type: String,
    required: true,
    trim: true,
    match: /[a-zA-Z0-9]+/
  },
  user : {
    type : ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },

  replies : [
    {
      user : {type: ObjectId,
              ref: 'User'
      },
      content: {
        type: String,
        required: true
      },
      votes : [{
        type : ObjectId,
        ref: 'User'
      }],
      timeEdited : {type: Date,
                    default: null}
    }
  ],

  tags: [{type: String}],
  timeEdited : {type: Date,
                default: null}
});

questionSchema.pre('save', function(next){
  var question = this;
  question.subject = utils.capitalizeFirst(question.subject);
  question.content = utils.capitalizeFirst(question.content);
  if(!question.isNew){
    question.timeEdited = Date.now();
  }
  next();
});

questionSchema.statics.findPaginated = function(query, page, perPage){
  var Question = this;
  try{
    page = parseInt(page);
    if(typeof page != 'number'){
      return Promise.reject();
    }
  }catch(e){
    return Promise.reject();
  }
  return Question.find(query).count().then((count) => {
    if(!count || count === 0){
      return Promise.reject({status: 404, message: "404 Not Found"});
    }
    var totalPages = Math.ceil(count/perPage);
    if(page > totalPages || page < 0){
      return Promise.reject();
    }
    var offset = (page-1) * perPage;
    return Question.find(query).sort({_id : -1})
                               .skip(offset)
                               .limit(perPage)
                               .exec()
                               .then( (questions) => {
                                 var buttons = [];
                                 var startButton = (page > 2 ? page -2 : ((page > 1) ? page-1 : 1));
                                 var endButton;
                                 if(page == 1){
                                   endButton = ((page + 4) <= totalPages) ? page + 4 : totalPages;
                                 }else if(page == 2){
                                   endButton = ((page + 3) <= totalPages) ? page + 3 : totalPages;
                                 }else{
                                   endButton = ((page <= (totalPages - 2)) ? (page + 2) : ((page <= totalPages -1) ? page + 1 :  page));
                                 }

                                 if(page == totalPages){
                                   startButton = (page-4 > 0) ? page-4 : 1;
                                 }else if(page == totalPages - 1){
                                   startButton = (page-3 > 0) ? page-3 : 1;
                                 }
                                 for(var i = startButton; i <= endButton; i++){
                                   buttons.push(i);
                                 }
                                 return {questions, buttons, count};
                               });
  });
}

questionSchema.statics.findByTagsPaginated = function(tags, page, perPage){
  var Question = this;
  var query = {};
  if(tags){
    var tagsArray = tags.split(/[ ]+/);
    var tagsMatch = [];
    tagsArray.forEach( (tag) => {
      tagsMatch.push({tags: new RegExp(".*" + tag + ".*", "gi")});
    });
    query = { $or : tagsMatch};
  }
  return Question.findPaginated(query, page, perPage);
}

questionSchema.statics.findByUserId = function(id, page, perPage){
  var Question = this;
  return Question.findPaginated({user: id}, page, perPage);
}


var Question = mongoose.model('Question', questionSchema);

module.exports = {Question};
