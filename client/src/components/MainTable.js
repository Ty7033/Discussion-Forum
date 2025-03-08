
import '../App.js';
import React from 'react';
import Left from './Left.js'
import Vert from './vert.js'
import Right from "./Right.js"
import '../stylesheets/App.css';

class MainTable extends React.Component{
  render(){
    return (
        <div className="main">
            <Left updatePage = {this.props.updatePage} currPage={this.props.currPage} updatePopulateForm={this.props.updatePopulateForm} userType={this.props.userType} handleAdminState={this.props.handleAdminState} adminState={this.props.adminState} updateUserType={this.props.updateUserType}/>
            <div className="vertical-hash"></div>
            <Right setErr= {this.props.setErr} updatePage = {this.props.updatePage} currPage={this.props.currPage} setCurrPage={this.props.setCurrPage} updateQuest={this.props.updateQuest} updateAnswers={this.props.updateAnswers} quest={this.props.quest} answers={this.props.answers} updateTags={this.props.updateTags} searchTag = {this.props.searchTag} isTag={this.props.isTag} stripTag = {this.props.stripTag} userType={this.props.userType} updateUserType={this.props.updateUserType} user={this.props.user} updatePopulateForm={this.props.updatePopulateForm} populateForm={this.props.populateForm} search={this.props.search} users={this.props.users} updateUsers={this.props.updateUsers} handleAdminState={this.props.handleAdminState} adminState={this.props.adminState} setCurrentUser={this.props.setCurrentUser} currentUser={this.props.currentUser}/>
        </div>
    );
  }
}
export default MainTable;

