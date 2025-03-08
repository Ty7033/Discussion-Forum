import '../App.js';
import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';
class QuestionForm extends React.Component{
  constructor(props){
    super(props);
    this.handleTitle = this.handleTitle.bind(this);
    this.handleText = this.handleText.bind(this);
    this.handleTags = this.handleTags.bind(this);
    this.handleSummary = this.handleSummary.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.validateTags = this.validateTags.bind(this);
    this.validateEmpty = this.validateEmpty.bind(this);
    this.validateSummary= this.validateSummary.bind(this)
    this.validateHyperlink = this.validateHyperlink.bind(this);
    this.validateTitle = this.validateTitle.bind(this);
    this.handleTags = this.handleTags.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.state = {
      title: '',
      text: '',
      tags: '',
      summary: '',
      ansIds: [],
      askDate: new Date(),
      views: 0,
      votes: 0,
      errors:{},
      //tl:[]
    };
  }
  componentDidMount(){
    console.log("populating? " + this.props.populateForm);
    console.log(this.props.currQuestion);
    if(this.props.populateForm === true){
      this.setState({title:this.props.currQuestion.title});
      this.setState({text:this.props.currQuestion.text});
      const qtags = this.props.currQuestion.tags.map(t => t.name).join(" ");
      this.setState({tags:qtags});
      this.setState({summary:this.props.currQuestion.summary});
    }
  }
  handleTitle = (e) =>{
    this.setState({title:e.target.value});
  }
  handleText = (e) =>{
    this.setState({text:e.target.value});
  }
  handleTags = (e) =>{
    this.setState({tags:e.target.value});
  }
  handleSummary = (e) =>{
    this.setState({summary:e.target.value});
  }
  handleDelete = async() => {
    await axios.post(`http://localhost:8000/deleteQuestion`, this.props.currQuestion).then(()=>{
      console.log("deleted question and everything with it!");
      this.props.updatePopulateForm(false);
      this.props.updatePage("all_question");
    }).catch((err)=>{this.props.setErr('Error deleting question');})
  }
  handlePost = () => {
    const title = this.state.title;
    const text = this.state.text;
    const tags = this.state.tags;
    const summary = this.state.summary;
    let err = {};
    let tagList=[];
    // Validate the fields
    let a = this.validateTitle(title, err);
    let b = this.validateEmpty(text, err, "etext");
    let c = this.validateSummary(summary, err, "esummary");
    let d = this.validateTags(tags, err);
    let h = this.validateHyperlink(text, err, "elink");
    this.setState({errors: err});
    if(!a && !b && !c &&!d && !h){ // no error
        this.separateTags(tags, tagList, title, text, summary);
    }
  }
separateTags = async (tagId, tagList, title, text, summary)=>{
  const qs= {
    title: title,
    summary:summary,
    text: text,
    tagIds: tagList,
    asked_by: this.props.user._id,
    ansIds: [],
    askDate: new Date(),
    comments:[],
    views: 0,
    votes: 0
  };
  console.log(qs);
  console.log(tagId);
  if(tagId)
  {
    console.log(tagId);
    tagId = tagId.split(" ");
    let y = new Map();
    y.set(tagId[0], 1);
    for (let i=1; i < tagId.length; i++){
       let found=false;
       for(let k of y.keys()){
          if(k.toLowerCase()=== tagId[i].toLowerCase()){
             found=true;
             break;
          }
       }
       if(!found){
          y.set(tagId[i], 1);
       }
     }
    const x = Array.from(y.keys());
    console.log("inside");
    try{
      const response = await axios.get("http://localhost:8000/tags") //get a list of the current tags
      console.log("came");
      const exist = response.data;
      for(let i=0; i<x.length; i++){
        let currentTag = exist.find(tag => tag.name === x[i]);
        console.log(currentTag);
        try{
        if (currentTag===undefined){
          const newTag = {
            name: x[i]
          };
          console.log("creating tags");
          const res = await axios.post("http://localhost:8000/addTag", newTag);
          console.log(res.data);
          tagList.push(res.data);
          console.log(tagList);
          console.log(qs);
         } 
          else { // Tag already exists
            tagList.push(currentTag._id);
          }
        }
        catch {
          this.props.setErr('Error creating tag');
        }
      }
      await this.props.updateTags();
    }
    catch {
      this.props.setErr('Error creating question');
    }
   }
    try{
    if(this.props.populateForm === true){
        await axios.post(`http://localhost:8000/modifyQuestion/${this.props.currQuestion._id}`, qs).then(()=>{
        this.props.updatePopulateForm(false);
        console.log("update succeeded!");
      }).catch((err)=>{this.props.setErr('Error fetching info')})
    }
    else{
       await axios.post('http://localhost:8000/addQuestion', qs);
    }
    this.props.updatePage("all_question");
    }
    catch {
        this.props.setErr('Error creating question');
    } 
}  
  //search through the exisiting tags and create one if not exist
  
validateEmpty = (field, err, label)=>{
    field=field.trim();
    if(field===""){
      err[label]= "^Please fill out this field";
      return true;
  }
  return false;
}
validateTitle = (title, er)=>{
  title=title.trim();
  if (title===""){
    er["etitle"]= "^Please fill out this field";
    return true;
  }
  if(title.length > 50){
    er["etitle"]= "^Title can't be longer than 50 characters";
    return true;
  }
  return false;
}
validateSummary = (summary, er)=>{
  summary=summary.trim();
  if (summary===""){
    er["esummary"]= "^Please fill out this field";
    return true;
  }
  if(summary.length > 140){
    er["esummary"]= "^Summary can't be longer than 140 characters";
    return true;
  }
  return false;
}
validateHyperlink = (text, err, label) =>{
  let link = /\[((?:\[[^\]]*?\]|[^[\]])*?)\]\((.*?)\)/g; //[...](...)
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
//checks the tags
validateTags = (tags,er)=>{
  tags=tags.trim();
  let words = tags.split(" ");
  let words2 = new Set(words);
  words = Array.from(words2);
  if(words.length > 5){
    er["etags"]= "^Max of 5 tags are allowed";
    return true;
  }
  for (let i=0; i<words.length; i++){ 
    if(words[i].length > 20) 
    {
      er["etags"]= "^Tags should not be longer than 20 characters";
      return true;
    }
  }

  if(this.props.user.rep<50 && tags!=""){
    er["etags"]= "^Can only create tags with rep of 50 or more";
    return true;
  }
  return false;
}
  render () {
    return (
      <div id="question_form" className="question_page">
          <form id="first_form">
            <label htmlFor="q_title" className="labels" id="one"> Question title<sup>*</sup></label><br></br>
            <label htmlFor= "q_title" className="instructions"> 
             <i>Limit title to 50 characters or less</i>
            </label><br></br>
            <input type="text" value={this.state.title} onChange={this.handleTitle} id = "q_title" name="q_title"></input><br></br>
            <span id="error1" className='error' name="error1">{this.state.errors["etitle"]}</span><br></br>
            <label htmlFor="q_summary" className="labels" id="four"> Question Summary <sup>*</sup></label><br></br>
            <label htmlFor= "q_summary" className="instructions"> 
            <i>Limit summary to 140 characters or less</i>
            </label><br></br>
            <textarea type="text" value={this.state.summary} onChange={this.handleSummary} id = "q_summary" name="q_summary"></textarea><br></br>
            <span id="error4"className='error' name="error4">{this.state.errors["esummary"]}</span><br></br>
            <label htmlFor = "q_text" className="labels" id="two"> Question Text<sup>*</sup></label><br></br>
            <label htmlFor = "q_text" className="instructions">
            <i>
               Add details
            </i><br></br>
            </label>
            <textarea type="text" value={this.state.text} onChange={this.handleText} id = "q_text" name="q_text"></textarea><br></br>
            <span id="error2" className='error' name="error2">{this.state.errors["etext"]}{this.state.errors["elink"]}</span><br></br>
            <label htmlFor="q_tags" className="labels" id="three"> Tags<sup>*</sup></label><br></br>
            <label htmlFor= "q_tags" className="instructions"> 
            <i>Add keywords separated by whitespace</i>
            </label><br></br>
            <textarea type="text" value={this.state.tags} onChange={this.handleTags} id = "q_tags" name="q_tags"></textarea><br></br>
            <span id="error3" className='error' name="error3">{this.state.errors["etags"]}</span><br></br>
            <button type="button" id="post_button" onClick={()=> this.handlePost()}>Post Question</button>
            {this.props.populateForm === true && (
            <button type="button" id="delete_button" onClick={()=> this.handleDelete()}>Delete Question</button>
            )}
          </form>
      </div>
    );
  }
}
export default QuestionForm;
