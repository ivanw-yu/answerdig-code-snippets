var router = require('express').Router();
var {Question} = require('.././models/question');
var {ObjectID} = require('mongodb');
var {authenticate} = require('.././middlewares/authenticate');
var _ = require('lodash');

// get a specific question based on its id
router.get('/:id', (req, res) => {
  Question.findById(req.params.id).populate('replies.user').populate('user').exec().then( (question) => {
    if(!question){
      return res.status(404).send();
    }
    res.send({question});
  }).catch((e) => {
    res.status(400).send();
  });
});

// find all questions based on keyword
router.get('/', (req, res) => {

  Question.findByTagsPaginated(req.query.search, req.query.page || 1, 5)
          .then((questionsAndButtons) => {
            if(!questionsAndButtons.questions || questionsAndButtons.questions.length === 0){
              return res.status(404).send();
            }
            res.send(questionsAndButtons);
          }).catch( (e) => {
            if(e.status)
              return res.status(e.status).send();
            res.status(400).send();
          });
});

// get all questions by a user, which is paginated.
router.get('/user/:id',authenticate, (req, res) => {
  var page = req.query.page;
  if(req.params.id != req.user._id){
    return res.status(401).send({success: false, message: "401 Unauthorized. You are not allowed to access this resource."});
  }

  Question.findByUserId(req.params.id, page || 1, 5).then((result) => {
    if(!result.questions || result.questions.length == 0){
      return res.status(404).send({success: false, message: "404 Not Found"});
    }
    res.send(result);
  }).catch((e) => {
    if(e.status){
      return res.status(e.status).send({message: e.message});
    }
    res.status(500).send({message : 'internal server err', id : req.params.id})
  });

});

// create new question
router.post('/', authenticate, (req, res) => {
  var user = req.user._id;
  var question = new Question({
    subject: req.body.subject,
    content: req.body.content,
    tags: req.body.tags || [],
    user
  });

  question.save().then( (question) => {
    res.send({success: true, question});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// edit question
router.patch('/:id', authenticate, (req, res) => {
  var question = _.pick(req.body, ['subject', 'content', 'tags']);
  var user = req.user._id;
  var _id = req.params.id;
  if(req.body.tags){
    question.tags = req.body.tags;
  }
  Question.findOneAndUpdate({_id, user},
                            {$set : question},
                            {new: true})
                            .then((question) => {
                              res.send({question, success: true});
                            }).catch((e) => {
                              res.status(400).send({question, success: false});
                            });
});

router.delete('/:id', authenticate, (req, res) => {
    var user = req.user._id;
    var _id = req.params.id;
    if(!ObjectID.isValid(user) || !ObjectID.isValid(_id)){
      return res.status(400).send();
    }
    Question.findOneAndRemove({_id, user}).then((question) => {
      if(!question){
        return res.status(404).send({success: false});
      }
      res.send({question, success: true});
    }).catch( (e) => res.status(400).send({success: false}));
});


// replies
// adds a reply to a question
router.post('/:id/replies', (req, res) => {

  // req.body.user is an ObjectId string
  var reply = {user : req.body.user ? req.body.user : null,
              content : req.body.content}
  var _id = req.params.id;
  if(!ObjectID.isValid(_id)){
    return res.status(400).send();
  }

  Question.findByIdAndUpdate(_id, {$push : {replies: reply}}, {new: true})
          .populate('replies.user')
          .then( (question) => {
            res.send({success: true, question: question, reply: question.replies[question.replies.length - 1], user: req.user});
          }).catch( (e) => {
            res.status(400).send();
          });
});

// edit reply of question
router.patch('/:questionId/replies/:replyId', authenticate, (req, res) => {
  var questionId = req.params.questionId;
  var replyId = req.params.replyId;
  if(!ObjectID.isValid(questionId) || !ObjectID.isValid(replyId)){
    return res.status(400).send();
  }

  Question.findOneAndUpdate({_id : questionId,
                            'replies._id': replyId},
                            {$set: { 'replies.$.content' : req.body.content,
                                     'replies.$.timeEdited': Date.now()}},
                            {new: true})
          .populate('replies.user')
          .then( (question) => {
            var index = question.replies.map(e => e._id.toHexString()).indexOf(replyId);
            var reply;
            question.replies.forEach(e => {
              if(e._id.toHexString() == replyId){
                reply = e;
              }
            });
            res.send({success: true, question, reply});
          }).catch( (e) => {
            res.status(400).send({success: false});
          });
});


// body should have vote: 1 or -1, this adds votes to the reply.
router.patch('/:questionId/replies/:replyId/votes', authenticate, (req, res) => {
  var userId = req.body.userId;
  var vote = req.body.vote;
  if(userId != req.user._id){
    return res.status(401).send({success: false, message: "401 Unauthorized. You are unauthorized to vote"});
  }
  if(!vote){
    return res.status(400).send({success: false, message: "400 Bad Request, missing 'vote: (1 or -1)' in body"});
  }
  var updateQuery = vote > 0 ? {$push : { 'replies.$.votes' : userId }} : {$pull : { 'replies.$.votes' : userId }};
  Question.findOneAndUpdate({_id: req.params.questionId,
                               'replies._id': req.params.replyId},
                                updateQuery,
                                {new: true})
          .populate('replies.user')
          .then( (question) => {
            res.send({success: true, question, replyId: req.params.replyId});
          })
          .catch( (e) => {
            res.status(400).send({success: false, message: "400 bad request"})
          });
});

// update views of specific question
router.patch('/:questionId/views', (req, res) => {
  var questionId = req.params.questionId;
  if(!questionId || !ObjectID.isValid(questionId)){
    return res.status(400).send({success: false});
  }
  Question.findByIdAndUpdate(questionId,
                             {$inc : {views : 1}},
                              {new: true})
                              .then((question) => {
                                res.send({success: true, question});
                              }).catch((err) => {
                                res.status(400).send({success: false, err, message: "Failed to update votes"});
                              });
});

// delete reply of a question
router.delete('/:questionId/replies/:replyId', authenticate, (req, res) => {
  var questionId = req.params.questionId,
      replyId = req.params.replyId;
  if(!questionId || !replyId){
    return res.status(400).send({success: false, message: '400 Bad Request'});
  }

  Question.findOneAndUpdate({_id: questionId, 'replies._id': replyId }, {$pull : {replies: {_id: replyId}}}, {new: true})
          .then( (question) => {
            res.send({question, success: true, message: 'Reply ' + replyId + ' has been deleted.'});
          }).catch( (e) =>  res.status(400).send({success: false, message: '400 Bad Request'}));
});

module.exports = router;
