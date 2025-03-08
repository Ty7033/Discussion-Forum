import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';


class Register extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            firstname:'',
            lastname:'',
            username:'',
            email:'',
            password:'',
            memberTime:new Date(),
            confirm_pass:'',
            admin:false,
            errors:{}
        } 
        this.handleFirst=this.handleFirst.bind(this);
        this.handleLast=this.handleLast.bind(this);
        this.handlePassword=this.handlePassword.bind(this);
        this.handleEmail=this.handleEmail.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleswitch= this.handleswitch.bind(this);
        this.handleUser = this.handleUser.bind(this);
        this.validateSecondPassword = this.validateSecondPassword.bind(this);
        this.sendInfo = this.sendInfo.bind(this);
    }
    handleFirst = (e) =>{
        this.setState({firstname:e.target.value});
    }
    handleLast= (e) =>{
        console.log("in user");
        this.setState({lastname:e.target.value});
    }
    handleUser= (e) =>{
        console.log("in user");
        this.setState({username:e.target.value});
    }
    handleEmail = (e) =>{
        console.log("in email");
        this.setState({email:e.target.value});
    }
    handlePassword = (e) =>{
        console.log("in passs");
        this.setState({password:e.target.value});
    }
    handleConfirm = (e) =>{
        console.log("in user");
        this.setState({confirm_pass:e.target.value});
    }
    handleswitch=()=>{
        this.props.setCurrPage("login");
    }
    handleRegister = () =>{
        console.log("handle reg");
        const first = this.state.firstname;
        const last= this.state.lastname;
        const pass_confirm= this.state.confirm_pass;
        const password = this.state.password;
        const email = this.state.email;
        const username = this.state.username;
        let admin = this.state.admin;
        let err = {};
        // Validate the fields
        let a = this.validateEmpty(first, err, "efirst");
        let b = this.validateEmpty(last, err, "elast");
        let c = this.validateEmpty(email, err, "eemail");
        let q = this.validateEmail(email, err, "eemail");
        let d = this.validateEmpty(password, err, "epass");
        let e = this.validateEmpty(pass_confirm, err, "econfirm")
        let f = this.validateEmpty(username, err, "euser");
        let w = this.validateSecondPassword(password, err, pass_confirm, "econfirm")
        if(!a && !b && !c && !d &&!e &&!f&& !q && !w){ //if not empty
            axios.get(`http://localhost:8000/users/${email}`) //check if the email exists
            .then((response) =>{
                if(response.data){
                    err["eemail"]= "^A user with that email already exists";
                    this.setState({errors:err});
                }
                else{
                    let x = this.validatePassword(password,first, last, username, email, err, "epass", c)
                    if (!x){
                        console.log(username);
                        if(username==="admin"){
                            console.log("its an admin!");
                            admin =true;
                            this.setState({admin:true});
                        }
                        this.sendInfo(first,last,username, email, password, admin)
                    }
                    else{
                        this.setState({errors: err});
                    }
                }
            }).catch(err=>{
                this.props.setErr('Error validating data:');
            })
            if(e){
               this.setState({errors: err});
            }
        }
        else{
            console.log("came here error");
            this.setState({errors: err});
        }
    }
    sendInfo = async(first,last,username, email, password, admin) =>{
        const user= {
            firstname:first,
            lastname:last,
            username: username, 
            email:email,
            password:password,
            rep: 50,
            memberTime: new Date(),
            admin: admin
        };
        try{
            //post user
            await axios.post("http://localhost:8000/user", user).then((res) =>{
                        console.log("res: " + res);
                        this.props.setCurrPage('login');
                        this.props.updateUsers();
                    })
        } //send user
        catch{
           this.props.setErr("cant send username and password to DB");
         }
    }
    validateEmpty = (field, err, label)=>{
        field=field.trim();
        if(field===""){
        console.log("empty");
          err[label]= "^Please fill out this field";
          return true;
      }
      return false;
    }
    validateEmail = (email, err, label) =>{
        email=email.trim();
        // check if the email is in a valid form
        let validform = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validform.test(email)){
            err[label]= "^An invalid email is provided";
            return true;
        }
        return false;
    }
    validatePassword(password, f, l, user, email, err, label){
        let first = f.toLowerCase();
        let last = l.toLowerCase();
        let username = user.toLowerCase();
        password = password.toLowerCase();
        let emailId = email.match(/([^@\s]+)@[^@\s]+\.[^@\s]+/)[0];
        if((password.includes(first)) || (password.includes(last)) || (password.includes(username)) || (password.includes(emailId))){
            err[label]= "^Should not contain your first or last name, username, or your email id";
            return true;
        }
        return false;
    }
    validateSecondPassword(password, err, confirmation, confirm_label){
        confirmation=confirmation.trim();
        password = password.trim();
        if(password!==confirmation){
            err[confirm_label]= "^This password doesn't match the one above ";
            return true;
        }
        return false;
    }
    render() {
        return(
        <div id="r_page" className="register_page">
          <form id="register_form">

            <label htmlFor="first" className="register_labels" id="four"> First Name<sup>*</sup></label><br></br>
            <input type="text" value={this.state.firstname} onChange={this.handleFirst} id = "firstname" name="firstname"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["efirst"]}</span><br></br> 

            <label htmlFor="last" className="register_labels" id="four"> Last Name<sup>*</sup></label><br></br>
            <input type="text" value={this.state.lastname} onChange={this.handleLast} id = "lastname" name="lastname"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["elast"]}</span><br></br> 

            <label htmlFor="username" className= "register_labels" id="four"> Username <sup>*</sup></label><br></br>
            <input type="text" value={this.state.username} onChange={this.handleUser} id = "username" name="username"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["euser"]}</span><br></br> 

            <label htmlFor="email" className="register_labels" id="four"> Email<sup>*</sup></label><br></br>
            <input type="email" value={this.state.email} onChange={this.handleEmail} id = "email" name="email"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["eemail"]}{this.state.errors["emaildup"]}</span><br></br>

            <label htmlFor="password" className="register_labels" id="four"> Password<sup>*</sup></label><br></br>
            <input type="text" value={this.state.password} onChange={this.handlePassword} id = "password" name="password"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["epass"]}</span><br></br> 

            <label htmlFor="password" className="register_labels" id="four"> Confirm Password<sup>*</sup></label><br></br>
            <input type="text" value={this.state.confirm_pass} onChange={this.handleConfirm} id = "password_confirm" name="password_confirm"></input><br></br>
            <span id="error4"className='error1' name="error4">{this.state.errors["econfirm"]}</span><br></br> 

            <button type="button" id="register_button" onClick={()=>this.handleRegister()}>SignUp</button>
            <div id="sub"> 
                <h5 className="alternative">Already have an account?</h5>
                <a href="#login" className="log" onClick={this.handleswitch}>Login</a>
            </div>
          </form>  
      </div>
    );
  }
}

export default Register;
