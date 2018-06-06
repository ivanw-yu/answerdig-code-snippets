import { Injectable, isDevMode } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Question } from '../models/question';

@Injectable()
export class RequestService {

  private url  = isDevMode() ? 'http://localhost:5000/api/' : 'api/';

  constructor(private http : HttpClient) { console.log("isDevMode:", this.url)}


  getQuestions(page? : number, tags? : string){
    let query = "?";
    if(page){
      query += 'page=' + page;
    }
    if(tags){
      query += query.length > 1 ? '&search=' + tags : 'search=' + tags;
    }
    let url = this.url + 'questions' + ((query.length > 1) ? query : '');
    return this.http.get(url);
  }

  getQuestionById(id : string){
    return this.http.get(this.url + 'questions/' + id);
  }

  getUserById(id : string){
    return this.http.get(this.url + 'users/' + id);
  }

  getQuestionsByUserId(id : string, page? : number){
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'x-auth' : localStorage.getItem('token')
    });
    return this.http.get(this.url + 'questions/user/' + id + (page ? ("?page=" + page) : ''), {headers});
  }

  saveQuestion(question : Question){
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'x-auth': localStorage.getItem('token')
    });
    return this.http.patch(this.url + 'questions/' + question._id, {...question}, {headers});
  }

  createQuestion(question : Question){
    const headers = {
      'Content-Type': 'application/json',
      'x-auth': localStorage.getItem('token')
    };
    return this.http.post(this.url + 'questions', question, {headers});
  }

  deleteQuestion(id : string){
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'x-auth': localStorage.getItem('token')
    });
    return this.http.delete(this.url + 'questions/' + id, {headers});
  }

  saveReply(reply, questionId, replyId ?: string){
    var headers = new HttpHeaders({
      'Content-Type' : 'application/json'
    });
    return this.http.post(this.url + 'questions/' + questionId + '/replies', {content: reply.content, user: reply.user}, {headers} );
  }

  saveEditedReply(reply, questionId){
    var headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-auth' : localStorage.getItem('token')
    });
    return this.http.patch(this.url
                    + questionId
                    + '/replies/'
                    + reply._id,
                    reply,
                    {headers});
  }

  deleteReply(questionId, replyId){
    var headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'x-auth': localStorage.getItem('token')
    });
    return this.http.delete(this.url
                              + 'questions/'
                              + questionId
                              + '/replies/'
                              + replyId,
                              {headers});
  }

  voteReply(replyId :string, userId : string, questionId : string, vote : number){
    var headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'x-auth': localStorage.getItem('token')
    });
    return this.http.patch(this.url
                    + 'questions/'
                    + questionId
                    + '/replies/'
                    + replyId
                    + '/'
                    + 'votes',
                    {vote: vote, userId},
                    {headers});
  }

  incrementViews(questionId){
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json'
    })
    return this.http.patch(this.url
                          + 'questions/'
                          + questionId
                          + '/views',
                            {inc: 1},
                            {headers});
  }

  editUser(user){
    var headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-auth': localStorage.getItem('token')
    });

    return this.http.patch(this.url + 'users/' + user._id, user, {headers});
  }
}
