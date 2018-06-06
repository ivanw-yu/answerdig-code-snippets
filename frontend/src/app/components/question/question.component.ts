import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, AfterViewInit } from '@angular/core';

import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {RequestService} from '../.././services/request.service';
import {Question} from '../.././models/question';
import {Subscription} from 'rxjs/Rx';
import * as io from 'socket.io-client';
import { NgModel, NgForm } from '@angular/forms';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css', '.././question-delete/question-delete.component.css', '.././questions-listing/questions-listing.component.css']
})
export class QuestionComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatScroll') chatScroll : ElementRef;
  @ViewChild('replyForm') replyForm : NgForm;
  initiallyViewed : boolean; // used to not allow chat box to scroll on next AfterViewChecked hooks
  question : Question;
  user;
  socket;
  guest : boolean;
  user$ : Subscription;
  bestAnswers : Object[];
  userId;
  deleteMode : boolean;
  repliesEditing : Object = {}; // Format is {_id: string, content: string}[] = [];

  constructor(private route : ActivatedRoute,
              private requestService : RequestService,
              private router : Router) { }

  ngOnInit() {
    this.initiallyViewed = false;
    this.user$ = this.route.paramMap.switchMap( (params : ParamMap) =>
      this.requestService.getQuestionById(params.get('id'))
    ).subscribe( (result) => {
      var user = localStorage.getItem('user');
      if(user)
        this.userId = JSON.parse(user)._id;
      this.question = result['question'];
      this.requestService.incrementViews(this.question._id).subscribe((data) => {
        this.question.views = data['question'].views;
      });
      this.getBest();
      this.user = JSON.parse(localStorage.getItem('user'));
      this.socket = io();
      this.socket.emit('join', this.question._id);

      this.socket.on('newReply', (function(data){
        this.question.replies.push(data['reply']);
        this.scrollToBottom();
      }).bind(this));

      this.socket.on('newVote', (function(data){
        var replyId = data['replyId'];
        console.log("newVote", replyId);
        var index = this.question.replies.map(e => e._id).indexOf(replyId);
        this.question.replies[index].votes.push(data['userId']);
        this.getBest();
      }).bind(this));

      this.socket.on('deleteVote', (function(data){
        var index = this.question.replies.map(e => e._id).indexOf(data['replyId']);
        this.question.replies = data['question'].replies;
        console.log("update vote:",this.question.replies[index].votes)
      }).bind(this));

      this.socket.on('deletedReply', (function(data){
        this.question.replies = this.question.replies.filter( e => e._id != data['replyId']);
      }).bind(this));

      this.socket.on('deletedQuestion', (function(data){
        this.question.deleted = true;
      }).bind(this));

      this.socket.on('editedReply', (function(data){
        var index = this.question.replies.map(e => e._id ).indexOf(data['reply']['_id']);
        this.question.replies[index] = data['reply'];
      }).bind(this));
    });
  }

  // scroll down the chat only after the first time the page is loaded through ngAfterViewChecked.
  ngAfterViewChecked(){
    if(!this.initiallyViewed){
      this.scrollToBottom();
      setTimeout( () => {
        this.initiallyViewed = true;
      }, 5000);
    }
  }

  scrollToBottom(){
    try{
      this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
    }catch(e){
      console.log("doesnt scroll", e);
    }
  }

  refresh(){
    this.router.navigate(['/questions', this.question._id]);
  }

  sendReply(reply){
    var content = this.guest ? reply + "<br/> -" + this.user.username : reply;
    this.requestService.saveReply({content: this.changeNewLineToBreakTag(content),
                                  user: this.user._id || null}, this.question._id)
                        .subscribe( (data) => {
                          if(data['success']){
                            this.replyForm.reset();
                            this.scrollToBottom();
                            this.socket.emit('createReply', {reply: data['reply']});
                          }
                        });
  }

  changeNewLineToBreakTag(text : string){
    return text.replace(/\n/g, '<br/>');
  }

  checkVote(index : number){
    if(!this.user)
      return false;
    try{
      return (this.question.replies[index]['votes'].indexOf(this.userId) < 0) ? true :  false;
    }catch(e){
      return false;
    }
  }

  vote(replyId : string, vote : number){
    this.requestService.voteReply(replyId, this.userId, this.question._id, vote).subscribe( (data) => {
      if(data['success'] && vote > 0){
        this.socket.emit('createVote', {reply: data['question']['reply'], question: data['question'], replyId: data['replyId'], userId: this.userId});
      }else if(data['success'] && vote < 0){
        this.socket.emit('pullVote', {reply: data['question']['reply'], question: data['question'], replyId: data['replyId'], userId: this.userId});
      }
    });
  }

  unvote(replyId : string){
    this.vote(replyId, -1);
  }

  getBest(){
    this.bestAnswers = [];
    if(!this.hasReplies()){
      return;
    }
    var arr = this.question.replies.slice().sort(this.compareVotes);
    var max = arr[0]['votes'].length;
    for(var i = 0; i < arr.length; i++){
      if(arr[i]['votes'].length == max){
        this.bestAnswers.push(arr[i]);
        var index = this.question.replies.map(e => e['_id']).indexOf(arr[i]);
      }
      if(this.bestAnswers.length > 2){
        break;
      }
    }
  }

  compareVotes(a,b){
    if(a['votes'].length < b['votes'].length){
      return 1;
    }else if(a['votes'].length > b['votes'].length){
      return -1;
    }else{
      return 1;
    }
  }

  hasReplies(){
    return this.question && this.question['replies'] && this.question['replies'].length > 0;
  }

  deleteReply(id){
    this.requestService.deleteReply(this.question._id, id).subscribe((data) => {
      if(data['success']){
        this.socket.emit('deleteReply', {question: data['question'], questionId: this.question._id, replyId: id});
      }
    });
  }

  editReply(_id, content){
    this.repliesEditing[_id] = content;
  }

  saveEditReply(_id, user){
    var reply = {
      _id,
      content: this.repliesEditing[_id],
      user
    };
    this.requestService.saveEditedReply(reply, this.question._id).subscribe( (data) => {
      if(data['success']){
        this.socket.emit('editReply', {reply: data['reply']});
        delete this.repliesEditing[_id];
      }
    });
  }

  joinAsGuest(guestName){
    this.user = {username: guestName};
    this.guest = true;
  }

  goToEdit(){
    this.router.navigate(['/profile','questions', this.question._id, 'edit']);
  }

  openDeleteForm(){
    this.deleteMode = true;
  }

  deleteCompletion(isDeleted : boolean){
    if(isDeleted){
      this.socket.emit('deleteQuestion', {question: this.question, message: "The question '" + this.question.subject +"' has been deleted."});
      this.router.navigate(['/profile']);
    }
  }

  ngOnDestroy(){
    this.user$.unsubscribe();
  }

}
