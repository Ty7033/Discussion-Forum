
import '../App.js';
import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';

class Header extends React.Component{
render(){
  console.log("answers " + this.props.answers);
  console.log(this.props.all_quest)
    return (
      <div id="header" className="header">
        <h1 id="f_header">Fake Stack Overflow</h1>
          <SearchBox setCurrPage={this.props.setCurrPage} currPage={this.props.currPage} updatePage={this.props.updatePage} updateQuest={this.props.updateQuest} quest = {this.props.quest} answers={this.props.answers} searchTag = {this.props.searchTag} isTag={this.props.isTag} stripTag = {this.props.stripTag} />
          {this.props.currPage != "welcome" && (
          <LogoutBt setCurrPage={this.props.setCurrPage} currPage={this.props.currPage} userType={this.props.userType} updateUserType={this.props.updateUserType} setErr ={this.props.setErr}/>
          )}
          {(this.props.userType!= "guest" && this.props.currPage != "welcome" && this.props.currPage != "register" && this.props.currPage != "login" ) &&  (
          <ProfileBt setCurrPage={this.props.setCurrPage} currPage={this.props.currPage} userType={this.props.userType} updateUserType={this.props.updateUserType} handleAdminState={this.props.handleAdminState} adminState={this.props.adminState} setErr ={this.props.setErr}/>
          )}
      </div>
    );
  }
}
class ProfileBt extends React.Component{
  constructor(props){
    super(props)
    this.handleProfile = this.handleProfile.bind(this);
  }
  handleProfile(){
    console.log("you clicked on profile, your type is: " + this.props.userType);
    if(this.props.userType==="loggedin"){
      this.props.setCurrPage("user_questions");
    }
    else{
      this.props.setCurrPage("list_users"); 
    }
    if(this.props.adminState===true){ //changes from viewing specific user back to all users if admin
      this.props.updateUserType("admin");
      this.props.handleAdminState(false);
    }
  }
  render(){
    return(
      <button type="button" id="profile_button" onClick={()=> this.handleProfile()}>Profile</button>
  )}

}

class LogoutBt extends React.Component{
  handleLogout(){
    axios.post('http://localhost:8000/logout')
        .then(response => {
            console.log(response.data);
            this.props.updateUserType("guest");
            this.props.setCurrPage("welcome");
        })
          .catch(error => {
            this.props.setErr('Unable to log out');
      });
  }
  render(){
    let title = "Logout";
    if (this.props.currPage=="register" || this.props.currPage =="login" || this.props.userType == "guest"){
        title= "Welcome"
    }
    return(
      <button type="button" id="logout_button" onClick={()=> this.handleLogout()}>{title}</button>
    )
  }
}
class SearchBox extends React.Component{ // when searched box entered=> should update the state of the main table
  constructor(props){
    super(props);
    this.state={questions: this.props.quest};
    this.search= this.search.bind(this);
    this.updateList= this.updateList.bind(this);
    this.updateSearch= this.updateSearch.bind(this);
    this.getQuestions = this.getQuestions.bind(this);
  }
  componentDidMount(){
    console.log("mounted");
    this.getQuestions();
  }
  getQuestions=()=>{
    axios.get('http://localhost:8000/questions')
    .then(response => {
          console.log(response.data);
          this.setState({ questions: response.data.slice().sort(compareDates) });
    })
    .catch(error => {
         this.setState("Error fetching data");
    });
  }
  updateSearch = (e)=>{
    console.log("in update");
    console.log(e.target.value);
    console.log(e.key);
    if(e.key ==="Enter"){
      e.preventDefault();
      console.log("in update");
      const searchString = e.target.value;
      console.log(searchString);
      this.search(searchString);
    }
    console.log(this.props.answers);
    console.log("out update");
  }
  updateList=(l)=>{
      this.props.updateQuest("search", l);
  }
  getSubstring(inputWord){
    let subSet = new Set();
    for(let a=0;a<inputWord.length;a++){
      for(let k=0;k<inputWord.length+1;k++){
        if(inputWord.substring(a,k)!==""){
          subSet.add(inputWord.substring(a,k));
        }
      }
    }
    return subSet;
  }
  searchTitle(input, question){ 
    const qTitleArray = question.title.split(" ");
    for(let i=0;i<qTitleArray.length;i++){
      let sEle = this.getSubstring(qTitleArray[i]);
      let aEle = Array.from(sEle);
      for(let j=0;j<aEle.length;j++){
        if(aEle[j].toLowerCase()===input.toLowerCase()){
          return true;
        }
      }
    }
  }
  searchText(input, question){
    const qTextArray = question.text.split(" ");
    for(let i=0;i<qTextArray.length;i++){
      let sEle = this.getSubstring(qTextArray[i]);
      let aEle = Array.from(sEle);
      for(let j=0;j<aEle.length;j++){
        if(aEle[j].toLowerCase()===input.toLowerCase()){
          return true;
        }
      }
    }
  }
  search=(input)=>{
    const inputArray = input.split(" ");
    let q = this.props.quest;
    console.log(q);
    let matched = new Set();
    for(let i=0;i<inputArray.length;i++){
      for(let j=0;j<q.length;j++){
          let found = this.props.isTag(inputArray[i], q[j]);
          if(found){
            matched.add(q[j]);
          }
          else if (inputArray[i].startsWith('[') && inputArray[i].endsWith(']')){
            console.log("came here");
          }
          else if((this.searchTitle(inputArray[i],q[j])) || (this.searchText(inputArray[i],q[j]))){
            matched.add(q[j]);
          }
          console.log(matched)
      }
    }
    matched=[...matched];
    console.log(matched);
    this.updateList(matched);
    this.getQuestions();
  }
  render(){
    return(
    <div id="searchbar">
    <form id="search">
      <label htmlFor="searchInput">
        <input type="search" placeholder="Search..." id="searchInput" onKeyDown={this.updateSearch}></input>
      </label>
    </form>
    </div>
    );

  }
}
function compareDates(x, y){
  return new Date(y.ask_date_time) - new Date(x.ask_date_time);
}
export default Header;
