import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';


class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            email:'',
            password:'',
            errors:{}
        } 
        this.handlePassword=this.handlePassword.bind(this);
        this.handleEmail=this.handleEmail.bind(this);
        this.handleswitch = this.handleswitch.bind(this);
        this.matchInfo= this.matchInfo.bind(this);
    }
    handleEmail = (e) =>{
        this.setState({email:e.target.value});
    }
    handlePassword = (e) =>{
        this.setState({password:e.target.value});
    }
    handleswitch =()=>{
        this.props.setCurrPage("register");
    }
    handleLogin = () =>{
        console.log("in handle login");
        const password = this.state.password;
        const email = this.state.email;
        let err = {};

            // Validate the fields
        let a = this.validateEmpty(email, err, "eemail");
        let b = this.validateEmpty(password, err, "epass");
        this.setState({errors: err});
        if(!a && !b){ // no error
            this.matchInfo(email, password,err);
                //this.setState({errors: err});
        }
    }

    matchInfo = (email, password, err) =>{
        const user = {
            email:email,
            password:password
        }
            axios.post("http://localhost:8000/checkUser", user).then(check =>{
                console.log("CHECK: " + check.data.usermail);
                if(check.data.usermail===true && check.data.userpass === true){
                    this.props.updateUser(email);
                    if(check.data.admin===true){
                        this.props.updateUserType('admin');
                    }
                    else{
                        this.props.updateUserType('loggedin');
                    }
                    this.props.setCurrPage("all_question");
                }else if (check.data.usermail=== false && check.data.userpass === false){
                    console.log("cannot find user!");
                    err["eemail"]= "^An unregistered email entered";
                }
                else{
                    err["epass"]= "^An incorrect password entered";
                }
                this.setState({errors:err})
            }).catch(err=>{
                this.props.setErr('Error checking data');
            });
    }
    validateEmpty = (field, err, label)=>{
        field=field.trim();
        if(field===""){
          err[label]= "^Please fill out this field";
          return true;
      }
      return false;
    }
    render() {
        return(
            <div id="l_form" className="login_page">
            <form id="login_form">

            <label htmlFor="email" className="login_labels" id="four"> Email<sup>*</sup></label><br></br>
            <input type="text" value={this.state.email} onChange={this.handleEmail} id = "email" name="email"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["eemail"]}</span><br></br>

            <label htmlFor="password" className="login_labels" id="four"> Password<sup>*</sup></label><br></br>
            <input type="text" value={this.state.password} onChange={this.handlePassword} id = "password" name="password"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["epass"]}</span><br></br>

            <button type="button" id="login_button" onClick={()=> this.handleLogin()}>Login</button>
            <span id="error4"className='error1' name="error4">{this.state.errors["elogin"]}</span><br></br>
            <label id="required">*indicates mandatory fields</label>
            <div id="sub"> 
                <h5 className="alternative">Don't have an account?</h5>
                <a href="#login" className="log" onClick={this.handleswitch}>Sign Up</a>
            </div>
          </form>
      </div>
        );
    }
}

export default Login;
