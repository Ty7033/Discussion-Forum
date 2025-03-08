import '../App.js';
import React from 'react';
import Header from './Header.js'
import MainTable from './MainTable.js'
import '../stylesheets/App.css';
import axios from 'axios';
import Login from './Login.js';
import Register from './Register.js'
import Welcome from './Welcome.js'


class MainPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {currPage: "welcome", quest: null, answers:null, highlighted: false, all_quest: null, userType: "guest", user: null, populateForm: false, search:[], users:null, adminState:false, currentUser: null, err:""}
        this.updatePage = this.updatePage.bind(this);
        this.updateQuest = this.updateQuest.bind(this);
        this.updateTags = this.updateTags.bind(this);
        this.updateAnswers = this.updateAnswers.bind(this);
        this.setCurrPage = this.setCurrPage.bind(this);
        this.updateUserType = this.updateUserType.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updatePopulateForm = this.updatePopulateForm.bind(this);
        this.handleAdminState = this.handleAdminState.bind(this);
        this.updateUsers = this.updateUsers.bind(this);
        this.setCurrentUser= this.setCurrentUser.bind(this);
        this.setErr = this.setErr.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
    }

    componentDidMount() {
        console.log("came into mounted");
        axios.get('http://localhost:8000/questions')
        .then(response => {
            console.log(response.data);
            this.setState({ quest: response.data.slice().sort(compareDates), all_quest: response.data.slice().sort(compareDates)});
        })
          .catch(error => {
            this.setState({err:'Error fetching questions data:'});
        });
        axios.get('http://localhost:8000/answers')
        .then(response => {
            console.log(response.data);
            this.setState({ answers: response.data });
        })
          .catch(error => {
            this.setState({err: "Error fetching answers data"});
        });
        axios.get('http://localhost:8000/users')
        .then(response => {
            console.log(response.data);
            this.setState({ users: response.data });
        })
          .catch(error => {
            this.setState({err: 'Error fetching users data'});
        });
        axios.get('http://localhost:8000/auth')
        .then(response => {
          console.log("checking if cookie");
          console.log(response.data);
          console.log(response.data.user);
          if(response.data){
            this.updateUser(response.data.user.email);
            if(response.data.user.isAdmin===true){
                this.updateUserType('admin');
            }
            else{
                this.updateUserType('loggedin');
            }
            this.updatePage("all_question");
          }
      })
        .catch(error => {
          this.setState({err: 'Error fetching users data:'});
      });
    }
    setCurrPage = (name) =>{
      console.log("setting page");
      this.setState({ currPage:name});
    }
    setCurrentUser(val){
      this.setState({currentUser:val});
    }
    updatePage = (name, sorted) => {
      console.log("in update page");
      if(sorted==null){
        console.log("getting qs");
        axios.get('http://localhost:8000/questions')
        .then(response => {
            console.log(response.data);
            this.setState({ currPage:name, quest: response.data.slice().sort(compareDates), all_quest: response.data.slice().sort(compareDates)});
        })
          .catch(error => {
            this.setState({err: 'Error fetching data:'});
        });
      }
      else{
        this.setState({ currPage:name, quest: sorted});
      }
    }
    handleAdminState = (val) =>{ //adminstate is when admin viewing a specific user profile
      this.setState({adminState:val});
    }
    updatePopulateForm = (val) =>{
      console.log("in updatePopulateForm: " + val);
      this.setState({populateForm:val})
    }
    updateUserType = (userType)=>{
      console.log("in update user type to: " + userType);
      if(userType=="guest"){
        this.setState({userType:userType, user: "guest"});
      }
      else{
        this.setState({userType:userType});
      }
    }
    updateUser = (email) =>{
      console.log("in updating user");
      axios.get(`http://localhost:8000/users/${email}`).then(u =>{
          console.log("USER: " + u.data + " is authenticated");
          this.setState({user:u.data});
      }).catch(()=>{
        this.setState({err: 'Error updating data:'});
      });
    }
    updateUsers =()=>{
      console.log("updating users");
      axios.get(`http://localhost:8000/users`).then((Users) =>{
        console.log("the users are : ", Users.data);
          this.setState({users:Users.data});
      }).catch(()=>{
        this.setState({err: 'Error updating data:'}); 
      });
    }
    updateAnswers = () => {
      console.log("updating answers");
      axios.get('http://localhost:8000/answers')
        .then(response => {
            console.log(response.data);
            this.setState({ answers: response.data});
        })
          .catch(error => {
            this.setState({err: 'Error fetching data:'});
        });
    }
    updateTags = () =>{
      console.log("in update tags");
      axios.get('http://localhost:8000/tags')
        .then(response => {
            console.log("BIG STUFF");
            console.log(response.data);
            this.setState({ tags: response.data});
        })
          .catch(error => {
            this.setState({err: 'Error fetching data:'});
        });
    }
    updateQuest= (name, l)=>{
        console.log("came here");
        this.setState({currPage: name, quest: l});
        console.log(this.state.quest);
    }
    searchTag=(input, question)=>{
        let t = question.tags;
        console.log(t);
        for(let i=0; i<t.length; i++)
        {
            if(((t[i]).name).toLowerCase()===input.toLowerCase()){
                return true;
            }
        }
    }
    isTag=(inputWord, question)=>{
        if(inputWord.includes(']')){
          if(inputWord.slice(-1)===']' && inputWord.slice(0,1)==='['){
            let found = this.stripTag(inputWord, question);
            return found; //if a tag will return true or else empty
          }
          else{
            console.log("error!"); //whats the procedure for invalid inputs ex: [react or [re]act]?
            return;
          }
        }
      }
    stripTag = (inputWord, question)=>{
        let strippedTag = inputWord.replace(/\[|\]/g, '');
        let foundTag = this.searchTag(strippedTag, question);
        if(foundTag){
          return true;
        }
        else{
          return false;
        }
     }
     setErr=(e)=>{
       this.setState({err:e});
     }
     handleRestart=()=>{
      axios.post('http://localhost:8000/logout')
      .then(response => {
          console.log(response.data);
          this.updateUserType("guest");
          this.setCurrPage("welcome");
          this.setState({err: ""})
      })
        .catch(error => {
          this.setErr('Unable to restart');
     });
    }
    render(){
        if(this.state.quest == null || this.state.all_quest == null){
            return
        }
        console.log(this.state.quest);
        console.log(this.state.currPage);
        console.log(this.state.userType);
        return(
           <div className="trv">
            <Header currPage={this.state.currPage} setCurrPage={this.setCurrPage} answers={this.state.answers} updatePage={this.updatePage} updateQuest={this.updateQuest} searchTag = {this.searchTag} isTag={this.isTag} stripTag = {this.stripTag} quest={this.state.all_quest} userType= {this.state.userType} updateUserType={this.updateUserType} setPressed = {this.setPressed} handleAdminState={this.handleAdminState} adminState={this.state.adminState} err={this.state.err} setErr ={this.setErr}/>
            {this.state.err!="" && (
            <div id="er">
              <span id="com_err">{this.state.err}</span>
              <button id="restart" onClick={this.handleRestart}>Restart</button>
            </div>)}
             {/* If the currPage is welcom page */}
             {(this.state.currPage === "welcome") && (
            <Welcome currPage={this.state.currPage} setCurrPage={this.setCurrPage} updateUserType={this.updateUserType} setErr ={this.setErr}/>
            )}
            {/* If the currPage is register page */}
            {this.state.currPage === "register" && (
            <Register currPage={this.state.currPage} setCurrPage={this.setCurrPage} updateUsers={this.updateUsers} setErr ={this.setErr}/>
            )}
            {(this.state.currPage === "login") && (
            <Login currPage={this.state.currPage} setCurrPage={this.setCurrPage} updateUser={this.updateUser} updateUserType={this.updateUserType} setErr ={this.setErr}/>
            )} 
            {((this.state.currPage === "all_question") || (this.state.currPage === "tags_page") || (this.state.currPage === "answer_page") || (this.state.currPage === "question_form") || (this.state.currPage === "answer_form") || (this.state.currPage === "filterTags") || (this.state.currPage === "search") || (this.state.currPage==="user_tags") || this.state.currPage ==="user_answers" || this.state.currPage==="user_questions" || this.state.currPage==="list_users" || this.state.currPage==="Answers") && (
            <MainTable currPage={this.state.currPage} setCurrPage={this.setCurrPage} updatePage={this.updatePage} updateQuest={this.updateQuest} quest={this.state.quest} answers={this.state.answers} updateAnswers={this.updateAnswers} updateTags={this.updateTags} searchTag = {this.searchTag} isTag={this.isTag} stripTag = {this.stripTag} userType={this.state.userType} user={this.state.user} updateUserType={this.updateUserType} updatePopulateForm={this.updatePopulateForm} populateForm={this.state.populateForm} search={this.state.search} users={this.state.users} updateUsers={this.updateUsers} handleAdminState={this.handleAdminState} adminState={this.state.adminState} setCurrentUser= {this.setCurrentUser} currentUser= {this.state.currentUser} setErr ={this.setErr}/>
            )}
            </div>
        );
    } 
}

function compareDates(x, y){
  return new Date(y.ask_date_time) - new Date(x.ask_date_time);
}

export default MainPage;