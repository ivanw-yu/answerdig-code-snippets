import { Component, OnInit, OnDestroy } from '@angular/core';
import { Question } from '../../models/question';
import {RequestService} from '../.././services/request.service';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '.././questions-listing/questions-listing.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  questions : Question[];
  buttons : number[];
  user; //: User;
  questions$ : Subscription;
  constructor(private requestService : RequestService) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getNextQuestions();
  }

  getNextQuestions(page ?: number){
    if(this.questions$)
      this.questions$.unsubscribe();
    this.questions$ = this.requestService.getQuestionsByUserId(this.user['_id'], page).subscribe( (data) => {
      this.questions = data['questions'];
      this.buttons = data['buttons'];
    });
  }

  editQuestion(index : number){
    
  }

  ngOnDestroy(){
    this.questions$.unsubscribe();
  }
}
