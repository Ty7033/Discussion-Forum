import '../App.js';
import React from 'react';
import QuestionTable from './QuestionTable.js'
import '../stylesheets/App.css';
import QuestionForm from './QuestionForm.js';
import TagsPage from "./TagsPage.js";
import AnswerTable from './AnswerTable.js';
import AnswerForm from './AnswerForm.js';
import ProfilePage from "./ProfilePage.js"
import axios from 'axios';

class Right extends React.Component{
  constructor(props){
    super(props);
    this.state= {
        currQu: [], currAns: [], currUser:null, pressed: false
    };
    this.handleCurrQuestion = this.handleCurrQuestion.bind(this);
    this.handleCurrAns = this.handleCurrAns.bind(this);
    this.handleCurrUser = this.handleCurrUser.bind(this);
}
  handleCurrQuestion(q){
    this.setState({currQu: q});
  }
  handleCurrAns(a){
    this.setState({currAns: a});
  }
  handleCurrUser(u){
    this.setState({currUser: u});
  }
  handleDate =(date)=>{
    let dateobj = new Date(date)
    return this.formatMeta(dateobj);
  }
  formatDate=(date, format)=>{
    console.log(typeof(date))
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let month = months[date.getMonth()];
    let day = date.getDate();
    let year= date.getFullYear();
    let hour = date.getHours();
    let min = date.getMinutes();
    min = min < 10 ? "0" + min : min;
    hour = hour < 10 ? "0" + hour : hour;  
    day = day < 10 ? "0" + day : day;
    if (format) {
      if (month !== undefined && day !== undefined && year !== undefined && hour !== undefined && min !== undefined) {
        return month + " " + day + ", " + year + " at " + hour + ":" + min;
      }
    }
    if (month !== undefined && day !== undefined && hour !== undefined && min !== undefined) {
      return month + " " + day + " at " + hour + ":" + min;
    }
  }

  formatMeta=(date)=>{
     let current = new Date();
     let difference = Math.abs(current - date);
     let day = 24 * 60 * 60 * 1000;
     let hr = 60 * 60 * 1000;
     let min = 60 * 1000;
     let sec= 1000;
     let yr = 365 * 24 * 60 * 60 * 1000;
     if(difference < min){ //less than a min
         let d= Math.floor(difference/sec);
         return d === 1 ? d + " sec" : d + " secs";
     }
     else if (difference < hr){ //less than an hour
         let d = Math.floor(difference/min);
         return d === 1 ? d + " min" : d + " mins";
     }
     else if (difference < day) //on the same day
     {
         let d = Math.floor(difference/hr);
         return d === 1 ? d + " hr" : d + " hrs";
     }
     if(difference >= yr){
        return this.formatDate(date, true);
     }
     return this.formatDate(date, false);
  }
  userQs(questions, user){
    console.log(questions);
    console.log("finding questions user asked");
    let userQs = [];
    for(let i=0; i<questions.length;i++){
      console.log(questions[i].asked_by.email + " " + user.email);
      if((questions[i].asked_by.email === user.email)){ //display all questions user asked
        userQs.push(questions[i]);
      }
    }
    console.log(userQs);
    return userQs;
 }
  userAs(questions, user){
    console.log(questions);
    console.log("finding questions user answered");
    let userAs = [];
    for(let i=0; i<questions.length;i++){
      let alreadyAdded = false;
      for(let j=0;j<questions[i].answers.length;j++){
        if(!alreadyAdded && (questions[i].answers[j].ans_by.email === user.email)){
          userAs.push(questions[i]);
          alreadyAdded = true;
        }
      }
    }
    return userAs;
  }
  render(){
    console.log(this.props.quest);
    console.log(this.props.currPage);
    console.log(this.props.user);
    console.log(this.state.currQu);
    console.log(this.props.userType);
    console.log(this.props.currentUser);
    let user=this.props.user;
    if(this.props.adminState===true){
      user=this.state.currUser;
    }
    console.log(this.props.userType);
    console.log(user);
    console.log("here again");
      return (
        <div className="right" id="right">
            {/* If the currPage is all_question */}
            {((this.props.currPage === "all_question" || this.props.currPage==="search" || this.props.currPage==="filterTags")) && (
            <QuestionTable setErr= {this.props.setErr} questions={this.props.quest} answers={this.props.answers} onQuestion={this.handleCurrQuestion} updatePage = {this.props.updatePage} currPage={this.props.currPage} setCurrPage={this.setCurrPage} display={this.props.updateQuest} handle={this.handleDate} allquest = {this.props.allquest} allans = {this.props.allans} userType={this.props.userType} user={user} updatePopulateForm={this.props.updatePopulateForm} userQs={this.userQs}/>
            )}
            {(this.props.currPage==="user_tags" || this.props.currPage==="user_questions" || this.props.currPage==="list_users" || this.props.currPage==="Answers" || this.props.currPage==="user_tags") && (
            <ProfilePage setErr= {this.props.setErr}  updateUsers={this.props.updateUsers} user= {user} questions={this.props.quest} answers={this.props.answers} onQuestion={this.handleCurrQuestion} updatePage = {this.props.updatePage} currPage={this.props.currPage} setCurrPage={this.props.setCurrPage} display={this.props.updateQuest} handle={this.handleDate} allquest = {this.props.allquest} allans = {this.props.allans} userType={this.props.userType}  updatePopulateForm={this.props.updatePopulateForm} users={this.props.users} searchTag = {this.props.searchTag} isTag={this.props.isTag} stripTag = {this.props.stripTag} setCurrentUser={this.props.setCurrentUser} updateTags={this.props.updateTags} handleAdminState={this.props.handleAdminState} handleCurrUser={this.handleCurrUser} userQs={this.userQs} userAs={this.userAs}/>
            )}
             {/* If the currPage is all_answers */}
             {(this.props.currPage === "answer_page" || this.props.currPage==="user_answers") && (
            <AnswerTable setErr= {this.props.setErr} currQuestion={this.state.currQu} handleCurrQuestion ={this.handleCurrQuestion} updateAnswers={this.props.updateAnswers} updatePage = {this.props.updatePage} handle={this.handleDate} userType={this.props.userType} user={user} updateQuest={this.props.updateQuest} currPage={this.props.currPage} updatePopulateForm={this.props.updatePopulateForm} handleCurrAns={this.handleCurrAns} userAs={this.userAs} questions={this.props.quest} updateUsers={this.props.updateUsers}/>
            )}
            {/* If the currPage is question form */}
            {this.props.currPage === "question_form" && (
            <QuestionForm setErr= {this.props.setErr} updatePage = {this.props.updatePage} handle={this.handleDate} updateTags={this.props.updateTags} user={user} populateForm={this.props.populateForm} updatePopulateForm={this.props.updatePopulateForm} currQuestion={this.state.currQu}/>
            )}
            {/* If the currPage is answer form */}
            {this.props.currPage === "answer_form" && (
            <AnswerForm setErr= {this.props.setErr} currQuestion={this.state.currQu} updatePage = {this.props.updatePage} updateAnswers={this.props.updateAnswers} onQuestion={this.handleCurrQuestion} user={user} currAns={this.state.currAns} populateForm={this.props.populateForm} updatePopulateForm={this.props.updatePopulateForm}  quest = {this.props.quest}/>
            )}
            {/* If the currPage is tags page */}
            {(this.props.currPage === "tags_page")&& (
            <TagsPage setErr= {this.props.setErr} quest={this.props.quest} onQuestion={this.handleCurrQuestion} updatePage = {this.props.updatePage}  display={this.props.updateQuest} handle={this.handleDate} searchTag = {this.props.searchTag} isTag={this.props.isTag} stripTag = {this.props.stripTag} userType={this.props.userType} currPage={this.props.currPage} user={user}/>
            )}
        </div>
      );
    }
  }
  export default Right;