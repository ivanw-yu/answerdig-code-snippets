var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var http = require('http');
var bcrypt = require('bcrypt');
var socketIO = require('socket.io');
var users = require('./server/routes/user');
var questions = require('./server/routes/question');
var db = require('./server/db/db');
var port = process.env.PORT || 5000;

var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', function(socket){
  socket.on('join', function(id){
    socket.join(id);

    socket.on('disconnect', function(){
      socket.leave(id);
    });

    socket.on('createReply', function(reply){
      io.to(id).emit('newReply', reply);
    });

    socket.on('editReply', function(reply){
      io.to(id).emit('editedReply', reply);
    });

    socket.on('deleteReply', function(reply){
      io.to(id).emit('deletedReply', reply);
    });

    socket.on('deleteQuestion', function(question){
      io.to(id).emit('deletedQuestion', question);
    });

    socket.on('createVote', function(reply){
      io.to(id).emit('newVote', reply);
    });

    socket.on('pullVote', function(reply){
      io.to(id).emit('deleteVote', reply);
    });
  });

  socket.on('createQuestion', function(question){
    io.emit('newQuestion', question);
  });

});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());


app.use('/api/users',users);
app.use('/api/questions', questions);

server.listen(port, ()=>{
  console.log('listening to port', port);
});
module.exports = {app};
