import '../App.js';
import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';

class AnswerForm extends React.Component{
  constructor(props){
    super(props);
    this.handleText = this.handleText.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.validateEmpty=this.validateEmpty.bind(this);
    this.validateHyperlink=this.validateHyperlink.bind(this);
    this.state = {
      text: '',
      ansBy: '',
      ansDate: new Date(),
      errors:{}
    };
  }
  componentDidMount(){
    console.log("populating answers? " + this.props.populateForm);
    if(this.props.populateForm === true){
      this.setState({text:this.props.currAns.text});
    }
  }
  handleText = (e) =>{
    this.setState({text:e.target.value});
  }
  handlePost(){
    const text = this.state.text;
    let err={};
    let b = this.validateEmpty(text, err, "etext");
    let c = this.validateHyperlink(text, err, "elink");
    this.setState({errors:err});
    if(!b && !c){
      const answer={ 
        text: text,
        ans_by: this.props.user._id,
        ansDate: new Date(),
        comments:[],
        votes: 0
      };
    //add the answer to the current questions' answers
    const question = this.props.currQuestion;
    console.log(question);
    if(this.props.populateForm===true){
      axios.post(`http://localhost:8000/modifyAnswer/${this.props.currAns._id}/${this.props.currQuestion._id}`, answer)
      .then((response) => {

        console.log("was able to modify answer: " + response.data.answers + " from question: "  + response.data.title);

        this.props.updateAnswers();
        this.props.updatePage("user_answers");
        this.props.onQuestion(response.data);
        this.props.updatePopulateForm(false); 
    })
    .catch(error => {
      this.props.setErr('Error updating answer');
    })

  }
    else{
      console.log(question._id);
      axios.post(`http://localhost:8000/addAnswer/posts/${question._id}`, answer)
      .then(response => {
        this.props.updatePage("answer_page");
        this.props.updateAnswers();
        this.props.onQuestion(response.data);
    })
    .catch(error => {
      this.props.setErr('Error creating answer');
    });
    }
  }
}
  validateEmpty = (field, err, label)=>{
    field=field.trim();
    if(field===""){
      err[label]= "^Please fill out this field";
      return true;
  }
  return false;
}
validateHyperlink = (text, err, label) =>{
  let link = /\[(.*?)\]\((.*?)\)/g; //[...](...)
  let check;
  while((check = link.exec(text))!==null){
    if(check[1]==='' || check[2]===''){
      console.log("NOT ALLOWED");
      err[label] = "^Neither the name nor link can be empty";
      return true;
    }
    if(!/^https?:\/\//.test(check[2])){
      console.log("NOT ALLOWED");
      err[label] = "^A hyperlink must begin with http:// or https://";
      return true;
    }
  }
  return false;
}
  render() {
    return(
    <div>
      <div id="answer_form" className="ans_form">
        <form>
          <label htmlFor = "a_textbox" className="labels" id="six"> Answer Text<sup>*</sup></label><br></br>
          <textarea type="text" value={this.state.text} onChange={this.handleText} id = "a_textbox" name="a_textbox"></textarea><br></br>
          <span htmlFor="error6" className='error' id="error6" name="error6">{this.state.errors["etext"]}{this.state.errors["elink"]}</span><br></br>
          <button type="button" id="post_answer" onClick={() => this.handlePost()}>Post Answer</button>
          <label id="required1">*indicates mandatory fields</label>
        </form>
    </div>
  </div>
    );
  }
}

export default AnswerForm;