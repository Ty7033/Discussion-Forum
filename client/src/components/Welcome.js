import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';


class Welcome extends React.Component{
  render(){
    return(
      <div>
        <h1 id="welcome">Welcome</h1>
        <div id="option-box">
          <LoginBt currPage={this.props.currPage} setCurrPage={this.props.setCurrPage} updateUserType={this.props.updateUserType}/>
          <RegisterBt currPage={this.props.currPage} setCurrPage={this.props.setCurrPage} />
          <h4 id="continue">Continue as</h4>
          <GuestUserBt currPage={this.props.currPage} setCurrPage={this.props.setCurrPage} updateUserType={this.props.updateUserType} />
          </div>
      </div>
    );
  }
}
class RegisterBt extends React.Component{
  renderRegister(){
      this.props.setCurrPage('register');
      console.log("REgister");
  }
  render(){
      return(
          <div>
              <button type="button" id="register" onClick={() => this.renderRegister()}>Register</button>
          </div>
      );
  }
}
class GuestUserBt extends React.Component{
  renderGuest(){
      this.props.setCurrPage('all_question');
      this.props.updateUserType('guest');
  }
  render(){
      return(
          <div>
              <button type="button" id="guest" onClick={() => this.renderGuest()}>Guest User</button>
          </div>
      );
  }
}
class LoginBt extends React.Component{
  renderLogin(){
      this.props.setCurrPage('login');
  }
  render(){
      return(
          <div>
              <button type="button" id="login" onClick={() => this.renderLogin()}>Login</button>
          </div>
      );
  }
}
export default Welcome;
