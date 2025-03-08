import '../App.js';
import React from 'react';
import '../stylesheets/App.css';
import TagsPage from './TagsPage.js';
import axios from 'axios';

class ProfilePage extends React.Component{
    render(){
      let questions = this.props.questions;
      let answers= this.props.answers;
      console.log("THE CURRENT PAGE: " + this.props.currPage);
      if(this.props.currPage === "user_questions" || this.props.currPage === "user_tags"){
        console.log("in current user");
        questions = this.props.userQs(questions, this.props.user);
        answers= this.props.userAs(questions, this.props.user);
      }
      else if(this.props.currPage==="Answers"){
        questions = this.props.userAs(questions, this.props.user);
        answers= this.props.userAs(questions, this.props.user);
      }
        let uinfo = "Member since " + this.props.handle(this.props.user.memberTime) +  ", Reputation: " + this.props.user.rep;
        return(
          <div id="profile">
            <h1 id="profile_intro">Profile of {this.props.user.username}</h1>
            <p id="Member">{uinfo}</p>
            <NavigationBar userType = {this.props.userType} setPage={this.props.setCurrPage} currPage={this.props.currPage} handleAdminState={this.props.handleAdminState}/>
            <InnerTable setErr={this.props.setErr} users={this.props.users} userType={this.props.userType} currentPage = {this.props.currPage} questions={questions} answers={answers} updatePage={this.props.updatePage}
            onQuestion={this.props.onQuestion} handle = {this.props.handle} currPage = {this.props.currPage} updatePopulateForm={this.props.updatePopulateForm} change={this.props.updateUsers} setPage={this.props.setCurrPage} current = {this.props.user} searchTag = {this.props.searchTag} isTag={this.props.isTag} stripTag = {this.props.stripTag} updateTags={this.props.updateTags} handleAdminState={this.props.handleAdminState} handleCurrUser={this.props.handleCurrUser}/>
          </div>
        )
    }
}
class NavigationBar extends React.Component{
    constructor(props){
        super(props);
    }
    adminControl(){
      this.props.setPage("list_users");
      this.props.handleAdminState(false);
    }
    render(){
        console.log(this.props.userType)
        return(
        <div id="nav">
            {(this.props.userType === "admin") &&(
             <a href="#admin" id="admin_control" className={this.props.currPage === "list_users"? "on": ""} onClick={()=>this.adminControl()}> Users</a>
            )}
            <a href="#userq" id="user_questions" className={this.props.currPage === "user_questions"? "on": ""} onClick={()=>this.props.setPage("user_questions")}>Questions</a>
            <a href="#userans" id="user_answers" className={this.props.currPage === "Answers"? "on": ""} onClick={()=>this.props.setPage("Answers")}>Answered Qs</a>
            <a href="#usertags" id="user_tags" className={this.props.currPage === "user_tags"? "on": ""} onClick={()=>this.props.setPage("user_tags")}>Tags</a>
        </div>
    )}
}
class InnerTable extends React.Component{ //displays all questions or all users
    render(){
        const rows = [];
        let users = this.props.users;
        let questions = this.props.questions;
        console.log(questions);
        let answers = this.props.answers;
        console.log("current page: " + this.props.currentPage);
        if(this.props.currentPage === "list_users"){
            users.forEach((user) => {
                console.log(user);
                rows.push(
                  <UserRow setErr={this.props.setErr} user={user} key={user._id} handleAdminState={this.props.handleAdminState} handleCurrUser={this.props.handleCurrUser} updateUserType={this.props.updateUserType}
                  updatePage = {this.props.updatePage} setCurrPage={this.props.setPage} questions={this.props.questions} answers={this.props.answers} updateUser={this.props.updateUser} change={this.props.change} setCurrentUser={this.props.setCurrentUser}/>
                );
              });
        }
        else if (this.props.currentPage === "user_questions"){
            console.log("heree");
            console.log(questions.length);
            if (questions.length == 0){
                console.log("in");
                return <h2 className='warning'>You have not asked any questions yet</h2>
            }
            questions.forEach((q) => {
                rows.push(
                  <Question quest = {q}
                  key = {q._id}
                  updatePage={this.props.updatePage}
                  onQuestion={this.props.onQuestion}
                  handle = {this.props.handle}
                  setErr={this.props.setErr}
                  currPage = {this.props.currPage} updatePopulateForm={this.props.updatePopulateForm} />
                );
              });
        }
        else if(this.props.currentPage === "Answers"){
            if (answers.length == 0){
                return <h2 className='warning'>You have not answered any questions yet</h2>
            }
            answers.forEach((a) => {
                rows.push(
                  <QuestionRow question={a}
                  key={a._id}
                  updatePage={this.props.updatePage}
                  onQuestion={this.props.onQuestion}
                  handle = {this.props.handle}
                  setErr={this.props.setErr}
                  currPage = {this.props.currPage} updatePopulateForm={this.props.updatePopulateForm}/>
                );
            });
        }
        console.log(this.props.userType);
        return(
            <div id = "info">
               <table id= "user_table">
                <tbody>
                {this.props.currentPage === "list_users" ? rows : null}
                {this.props.currentPage === "user_questions" ? rows : null}
                {this.props.currentPage === "Answers" ? rows : null}
                </tbody>
                </table>
                {this.props.currentPage === "user_tags" && <TagsPage quest={this.props.questions} onQuestion={this.handleCurrQuestion} updatePage = {this.props.updatePage}  display={this.props.updateQuest} handle={this.handleDate} searchTag = {this.props.searchTag} isTag={this.props.isTag} stripTag = {this.props.stripTag} userType={this.props.userType} currPage={this.props.currPage} user={this.props.current} updateTags={this.props.updateTags}/>}
            </div>
        )
    }
}
class Question extends React.Component{ //shows each question user asked
    handleClick(q){
        console.log("11111", q);
        this.props.updatePopulateForm(true);
        this.props.onQuestion(q);
        this.props.updatePage('question_form');
    }
    render(){
        const question = this.props.quest;
        console.log("render question: " + this.props.quest.title);
        return(
            <tr className="question_list">
                <td id="u_col">
                <a id="quest_title" onClick={()=>this.handleClick(question)}>{this.props.quest.title}</a>
                </td>
            </tr>
        )
    }
}
class QuestionRow extends React.Component { //shows each question user answered
    createButtons(){
      let buttons=[]
      let tags = this.props.question.tags;
      tags.forEach(ques=>{
           let curr= ques.name;
           buttons.push(<button type="button" key={curr} className= "tag_buttons">{curr}</button>);
        });
      return (
          <div>
            {buttons}
          </div>
      )
    }
   updateViews(){
      let question = this.props.question;
      console.log("updating views");
      axios.post(`http://localhost:8000/posts/question/${question._id}/views`)
      .then(response => {
        console.log(response.data)
        this.props.updatePage('user_answers');
        this.props.onQuestion(response.data);
      })
      .catch(error => {
        this.props.setErr("Error updating views");
      });
    }
    render() {
      const question = this.props.question;
      console.log(question.asked_by);
      console.log(question.ask_date_time)
      return (
        <table className="innertable" id="post_table">
          <tbody>
            <tr className="table_r1">
              <td className="summary">{question.votes}{question.votes<=1 ? " vote" : " votes"}<br></br>{question.answers.length}{question.answers.length<=1 ? " answer" : " answers"}<br></br>{question.views}{question.views<=1 ? " view" : " views"}</td>
              <td className="question"><a href= "#question" onClick={()=>this.updateViews()}>{question.title}</a><br></br>
               {this.createButtons()}
              </td>
              <td className="user_cell">
              <p className="u">{question.asked_by.username}</p>
              <p className="t">{"asked " + this.props.handle(question.ask_date_time) + " ago"}</p>
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
  }
class UserRow extends React.Component{
    constructor(props){
      super(props);
      this.deleteUser = this.deleteUser.bind(this);
      this.updatePopup = this.updatePopup.bind(this);
      this.state={triggerPopup:false}
    }
    goToUser(u){
       console.log(u);
       this.props.updatePage("user_questions");
      //  this.props.updateUserType("loggedin"); //check this logic over. In questiontable for profile page do not care about usertype(only used for differentiating between guest not differentiating between logged in and admin) since adminstate is set to true.
       this.props.handleAdminState(true);
       this.props.handleCurrUser(u);
    }
    updatePopup(val){
      this.setState({triggerPopup:val});
    }
    getQuestionsByUser(u){
      let allquest = this.props.questions;
      console.log(allquest);
      let questsToDelete = [];
      for(let i=0;i<allquest.length;i++){
        if(allquest[i].asked_by._id === u._id){
          questsToDelete.push(allquest[i]);
          console.log("question to delete: " + allquest[i].title);
        }
      }
      return questsToDelete;
    }
    getAnswersByUser(u){
      let allAns = this.props.answers;
      console.log(allAns);
      let ansToDelete = [];
      for(let i=0;i<allAns.length;i++){
        if(allAns[i].ans_by._id === u._id){
          ansToDelete.push(allAns[i]);
          console.log("answer to delete: " + allAns[i].text);
        }
      }
      return ansToDelete;
    }
    deleteUser = async(u)=>{
      console.log("in delete user " + u.username);
      //let qsToDelete = this.getQuestionsByUser(u);
      await axios.post(`http://localhost:8000/deleteComments`, u).then(()=>{
          console.log("deleted user comments");
          axios.post(`http://localhost:8000/deleteUserQuestions`, u).then(()=>{
          console.log("deleted questions and everything with it!");
        }).catch((err)=>{this.props.setErr("Error deleting questions")})
        //let ansToDelete = this.getAnswersByUser(u);
          axios.post(`http://localhost:8000/deleteUserAnswers`, u).then(()=>{
            console.log("deleted all answers user made");
          }).catch((err)=>{this.props.setErr("Error deleting user")})
          axios.post(`http://localhost:8000/deleteUser`, this.props.user).then(()=>{
            console.log("deleted user!");
            this.props.change();
            if(u.admin === true){ //if admin deletes themselves then kicked out
                axios.post('http://localhost:8000/logout').then(response => {
                    console.log(response.data);
                    this.props.setCurrPage("welcome");
                  })
                  .catch(error => {this.props.setErr('Unable to log out');
                });
             }
          }).catch((err)=>{this.props.setErr("Error deleting user");})
      }).catch((err)=>{this.props.setErr("Error deleting user")})
    }
    render(){
      const user=this.props.user;
      console.log("in UserRow " + user);
      return(
            <tr className="table_r1">
              <td className="question"><a href= "#user" onClick={()=>this.goToUser(user)}>{user.username}</a>
              <button type="button"  id= "d_button" onClick={()=>this.updatePopup(true)}>Delete User</button>
              {this.state.triggerPopup == true && (
                <Popup deleteUser={this.deleteUser} updatePage={this.props.updatePage} user={user} updatePopup= {this.updatePopup}/>
                )}
              </td>
            </tr>
      );
    }
}
  class Popup extends React.Component{
   render(){
    console.log("in delete popup check");
    return(
      <div>
        <p>Are you sure you want to delete?</p>
        <button type="button" onClick={()=>this.props.deleteUser(this.props.user)}>Yes</button>
        <button type="button" onClick={()=>this.props.updatePopup(false)}>No</button>
      </div>
    )
   }
  }
export default ProfilePage;