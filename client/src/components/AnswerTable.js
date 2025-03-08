import '../App.js';
import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';
class AnswerTable extends React.Component {
  constructor(props){
    super(props)
    this.state={
      current:0,
      errors:"",
      question: this.props.currQuestion
    }
    this.compareAnsDate = this.compareAnsDate.bind(this);
  }
  compareAnsDate(x, y){
    return new Date(y.ans_date_time) - new Date(x.ans_date_time);
  }
  handlePrev=()=>{
    if (this.state.current!== 0){
      this.setState({current: this.state.current - 1})
    }
  }
  handleNext=()=>{
    let answers = this.props.currQuestion.answers;
    let number = Math.ceil(answers.length / 3)
    console.log(number)
    if (this.state.current === number - 1){
      this.setState({current: 0})
    }
    else{
      this.setState({current: this.state.current + 1})
    }
  }
  sortUserAnswers(ans, user){
    let sortedAns = [];
    for(let i=0;i<ans.length;i++){
      if(ans[i].ans_by._id === user._id){ //add user answers first
        sortedAns.push(ans[i]);
      }
    }
    for(let i=0;i<ans.length;i++){
      if(ans[i].ans_by._id != user._id){ //add the rest in sorted order
        sortedAns.push(ans[i]);
      }
    }
    return sortedAns;
  }
  render() {
    console.log("render answer table");
    console.log(this.props.user);
    let question = this.props.currQuestion;
    console.log(question);
    let ans = question.answers.slice().sort(this.compareAnsDate);
    if(this.props.currPage==="user_answers"){
      ans = this.sortUserAnswers(ans, this.props.user);
    }
    let total = ans.length;
    let start = this.state.current * 5;
    let end = Math.min(start + 5, ans.length);
    ans = ans.slice(start, end)
    let rows=[]
    ans.forEach(answer => {
      console.log(answer.text);
      console.log(answer.comments);
        rows.push(
          <AnswerRow
            answer={answer}
            key={answer._id}
            updatePage={this.props.updatePage}
            handle={this.props.handle}
            updateAnswers={this.props.updateAnswers}
            updateUsers={this.props.updateUsers}
            setErr={this.props.setErr}
            handleCurrQuestion = {this.props.handleCurrQuestion}
            questions={this.props.questions}
            user = {this.props.user}
            userAs={this.props.userAs}
            userType={this.props.userType} currQuestion={this.props.currQuestion} updateQuest={this.props.updateQuest} currPage={this.props.currPage} updatePopulateForm={this.props.updatePopulateForm} handleCurrAns={this.props.handleCurrAns}
          />
        );
    });
    return (
      <div>
      <div className="answer" id="answer_page">
          <QuestionTitle q={question} updateUsers={this.props.updateUsers} updatePage={this.props.updatePage} userType={this.props.userType}/>
          <QuestionText q={question} updateUsers={this.props.updateUsers} handle = {this.props.handle} user={this.props.user} userType={this.props.userType} currQuestion={this.props.currQuestion} updateQuest={this.props.updateQuest} setErr ={this.props.setErr} updatePage={this.props.updatePage}/> 
          <CommentTable  setErr ={this.props.setErr} kind={"question"} updateUsers={this.props.updateUsers} info={question} user={this.props.user} handle={this.props.handle} userType={this.props.userType}/>
        <p id="answer_number">{question.answers.length}{question.answers.length<=1 ? " answer" : " answers"}</p>
        <table className="answer_posts" id="answer_posts">
        {rows}
        </table>
        <br></br>
      </div>
      <div id="answer_button" className= "static">
        {(this.props.userType !== "guest"  && this.props.currPage!=="user_answers") && (
        <button type="button" id="ans_button" onClick={() => this.props.updatePage('answer_form')}>Answer Question</button>
        )}
        {total > 5 && (
         <div id="b_buttons" className='static'>
         <button type="button" id="prev_button3" onClick={() => this.handlePrev()}>Prev</button>
         <button type="button" id="next_button3" onClick={() => this.handleNext()}>Next</button>
         </div>
        )}

      </div>
      </div>
    );
  }
}

class QuestionTitle extends React.Component{
  render(){
    console.log(this.props.q);
    let q = this.props.q;
    // q.views++;
    return(
      <table id="answer_top">
        <tbody>
       <tr id="intro">
        <td id="c2">
          <h1 id="answer_title">{q.title}</h1>
          <span id="views_count">{q.views}{q.views<=1 ? " view" : " views"}</span>
        </td>
        <td id="c3">
        {this.props.userType != "guest" && (
          <button type="button" id="ab" onClick={() => this.props.updatePage('question_form')}>Ask Question</button>
        )}
        </td>
      </tr>
      </tbody>
      </table>
    );
  }
}
class Comment extends React.Component{
  constructor(props){
    super(props)
    this.state={currComment:this.props.comment};
    this.handleVote = this.handleVote.bind(this);
  }
  handleVote = async()=>{
    if(this.props.user!="guest"){
    try{
    let newComment = await axios.post(`http://localhost:8000/comment/upvote/${this.state.currComment._id}`)
    this.setState({currComment: newComment.data})
      }
    catch{
      this.props.setErr("Error handling vote");
      }
    }
  }
  render(){
    let comm = this.state.currComment;
    return(
        <tr id="comment_row">
          <td colSpan="3" id="cols">
           <button id="comment_v" onClick={this.handleVote}>↑</button>
           <span id="comment_votes">{comm.votes}</span>
           <p id = "comment_text">{comm.text}</p>
           <span id ="comment_user"> -- {comm.added_by.username}</span> 
           <span id="comment_info"> commented {this.props.handle(comm.added_date_time)}</span>
          </td>
        </tr>
    )
  }
}
class CommentTable extends React.Component{
  constructor(props){
    super(props);
    this.state={
      add: false,
      comments:this.props.info.comments,
      current: 0,
      errors: ""
    }
    this.handleComment=this.handleComment.bind(this);
    this.handleEnteredComment = this.handleEnteredComment.bind(this);
  }
  handlePrev=()=>{
    if (this.state.current!== 0){
      this.setState({current: this.state.current - 1})
    }
  }
  handleNext=()=>{
    let comments = this.state.comments;
    let number = Math.ceil(comments.length / 3)
    console.log(number)
    if (this.state.current === number - 1){
      this.setState({current: 0})
    }
    else{
      this.setState({current: this.state.current + 1})
    }
  }
  handleComment=()=>{
   if(this.props.user!== "guest"){
     this.setState({add:true})
   }
  }
  handleEnteredComment=(e)=>{
    console.log(e.target.value);
    if(e.key ==="Enter"){
      console.log("came in here");
      e.preventDefault();
      const comment = e.target.value;
      console.log(comment.length);
      console.log(this.props.user.username);
      if(this.props.user.rep < 50){
         this.setState({errors: "Can't add comment because reputation is less than 50"});
         return 
      }
      else if(comment.length > 140){
        this.setState({errors: "Can't add comment because its longer than 140 characters"});
        return 
      }
      const newComment={
         text:comment,
         added_by: this.props.user._id,
         added_date_time: new Date(),
         votes: 0
      }
      if (this.props.kind === "question"){
        axios.post(`http://localhost:8000/${this.props.info._id}/addComment1`, newComment)
        .then(response => {
          this.setState({comments:response.data.comments})
        })
        .catch(error => {
          this.props.setErr('Error saving comment');
        });
      }
      else{
        console.log(this.props.info._id)
        axios.post(`http://localhost:8000/${this.props.info._id}/addComment2`, newComment)
        .then(response => {
          //console.log("problem");
          //console.log(response.data.comments[0].added_by.username);
          this.setState({comments:response.data.comments})
        })
        .catch(error => {
          this.props.setErr('Error saving comment');
        });
      }
    }
  }
  render(){
    console.log(this.props.info);
    let com = this.state.comments.slice().sort(compareDates);
    let start = this.state.current * 3;
    let end = Math.min(start + 3, com.length);
    com = com.slice(start, end)
    console.log(com);
    let rows=[]
    com.forEach(comm => {
      console.log(comm); //comm is just a single string id but should be a nested comment
      console.log(com.asked_by);
        rows.push(
          <Comment
            comment={comm}
            key={comm._id}
            user={this.props.user}
            handle={this.props.handle}
            setErr={this.props.setErr}
          />
        );
    });
    return(
      <div>
        <table id= "comment_table">
          <thead>
          <tr>
          <th id="col1">
            <p id="comment_count">{this.state.comments.length}{this.state.comments.length<=1 ? " comment" : " comments"}</p>
          </th>
          <th id="col2"></th>
          <th id="col3">
          {this.props.userType !== "guest" && (<button type="button" id="add_comment" onClick={() => this.handleComment()}>Add Comment</button>)}
          </th>
          </tr>
          </thead>
          <tbody>
          {rows}
          {this.state.add && (
            <tr>
            <td colSpan="3">
            <input type="text" id= "comment_box" placeholder="Enter your comment" onKeyDown={this.handleEnteredComment}/>
            <p htmlFor="error6" className='error' id="error0" name="error0">{this.state.errors}</p><br></br>
            </td>
            </tr>
          )}
          </tbody>
        </table>
        {this.state.comments.length > 3 && (
         <div id="b_buttons">
         <button type="button" id="prev_button1" onClick={() => this.handlePrev()}>Prev</button>
         <button type="button" id="next_button1" onClick={() => this.handleNext()}>Next</button>
         </div>
        )}
      </div>
    )  
  }
}
class VotesQ extends React.Component { //voting on a question
  constructor(props){
    super(props);
    this.state={errors:""}
  }
  updateVotes(direction, type){
    if(this.props.userType!="guest" && this.props.user.rep>=50){
    console.log("increase Question votes");
      let q = this.props.currQuestion;
      console.log(this.props.user);
      console.log(this.props.user._id);
      axios.post(`http://localhost:8000/posts/${q._id}/${type}/${direction}`)
      .then((response) => {
        console.log(response.data);
        if(direction === "up"){
          q.votes++;
        }
        else{
          q.votes--;
        }
        console.log("q.votes");
        this.props.updateUsers();
        this.props.updatePage("answer_page");
      })
      .catch(error => {
         this.props.setErr('Error saving votes');
      });
    }
    else{
      this.setState({errors: "Can't vote because reputation is less than 50"});
         return ;
    }
  }
  render(){
    let q = this.props.currQuestion;
    return(
      <div>
        <button type="button" id="vote_up" onClick={() => this.updateVotes("up", "Question")}></button>
        <p id="vote">{q.votes}</p>
        <button type="button" id="vote_down" onClick={() => this.updateVotes("down", "Question")}></button>
        <p htmlFor="error6" className='error' id="error0" name="error0">{this.state.errors}</p>
      </div>
    )
  }
}

class VotesA extends React.Component { //voting on an answer
  constructor(props){
    super(props);
    this.state={errors:""}
  }
  updateVotes(direction, type){
    if(this.props.userType!="guest" && this.props.user.rep>=50){
    console.log("increase answer VOTES");
      let ans = this.props.ans;
      console.log(this.props.user);
      console.log(this.props.user._id);
      axios.post(`http://localhost:8000/posts/${ans._id}/${type}/${direction}`)
      .then((response) => {
        console.log(response.data);
        if(direction==="up"){
          ans.votes++;
        }
        else{
          ans.votes--;
        }
        this.props.updateAnswers();
        this.props.updateUsers();
      })
      .catch(error => {
        this.props.setErr('Error saving votes');
      });
    }
    else{
      this.setState({errors: "Can't vote because reputation is less than 50"});
         return ;
    }
  }
  render(){
    let ans = this.props.ans;
    return(
      <div>
        <button type="button" id="vote_up" onClick={() => this.updateVotes("up", "Answer")}></button>
        <p id="vote">{ans.votes}</p>
        <button type="button" id="vote_down" onClick={() => this.updateVotes("down", "Answer")}></button>
        <p htmlFor="error6" className='error' id="error0" name="error0">{this.state.errors}</p>
      </div>
    )
  }
}

class QuestionText extends React.Component {
  createButtons(){
    let buttons=[]
    let tags = this.props.q.tags;
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
  render() {
    let q = this.props.q;
    return (
      <div>
      <table id="second_row">
      <tbody>
      <tr id="ans_row">
        <td id="c5">
        <VotesQ setErr ={this.props.setErr} q={q} updateUsers={this.props.updateUsers} user={this.props.user} userType={this.props.userType} currQuestion={this.props.currQuestion} updateQuest={this.props.updateQuest} updatePage={this.props.updatePage}/>
        </td>
        <td id="c6">
          <p id="question_text">{changeText(q.text)}</p>
          {this.createButtons()}
        </td>
        <td id="c7">
          <p className="userasked" id="userasked">{q.asked_by.username}</p>
          <p className="time" id="time">{"asked " + this.props.handle(q.ask_date_time)}</p>
        </td>
      </tr>
      </tbody>
      </table>
      </div>
    );
  }
}

class AnswerRow extends React.Component {
  constructor(props){
    super(props);
    this.editAnswer = this.editAnswer.bind(this);
    this.deleteAnswer = this.deleteAnswer.bind(this);
  }
  editAnswer(){
    console.log("in update answer");
    this.props.updatePopulateForm(true);
    this.props.handleCurrAns(this.props.answer);
    this.props.updatePage('answer_form');
  }
  deleteAnswer = async()=>{
    await axios.post(`http://localhost:8000/deleteAnswer/${this.props.currQuestion._id}`, this.props.answer).then((res)=>{
        console.log("deleted answer!");
        console.log(res.data);
        this.props.handleCurrQuestion(res.data); //returns the modified(modified b/c answer removed) question
      }).catch((err)=>{console.log(err)})
  }
  render() {
    console.log(this.props.answer);
    let ans = this.props.answer;
    console.log(this.props.user._id)
    console.log(ans.ans_by._id);
    console.log(ans.text);
    console.log(this.props.currPage);
    return(
      <tbody>
        <tr className="answer_box">
          <td id="answer_vote">
          <VotesA setErr ={this.props.setErr} ans={ans} updateUsers={this.props.updateUsers} user={this.props.user} userType={this.props.userType} currQuestion={this.props.currQuestion} updateQuest={this.props.updateQuest} updateAnswers={this.props.updateAnswers}/>
          </td>
          <td className="answer_text">
            {changeText(ans.text)}
          </td>
          <td className="info_cell">
            <p className="user_info">{ans.ans_by.username}</p>
            <p className="time_info">{"answered "+ this.props.handle(ans.ans_date_time)}</p>
            {(this.props.currPage === "user_answers"  && this.props.user._id === this.props.answer.ans_by._id) && (
          <td colSpan="3"> 
            <button type="button" id="edit_answer" onClick={() => this.editAnswer()}>Edit</button>
            <button type="button" id="delete_answer" onClick={() => this.deleteAnswer()}>Delete</button>
        </td>
        )}
          </td>
        </tr>
        <tr>
          <td colSpan="3"> 
            <CommentTable setErr ={this.props.setErr} kind={"answer"} info={ans} user={this.props.user} handle={this.props.handle}/>
          </td>
        </tr>
      </tbody>
    );
  }
}
function changeText(text){
  let link = /\[((?:\[[^\]]*?\]|[^[\]])*?)\]\((.*?)\)/g; //[...](...)
  let check;
  let output=[];
  let start=0; //keeps track of the starting index
  while((check = link.exec(text))!==null){
    output.push(text.slice(start, check.index));
    start = link.lastIndex;
    output.push(<a key= {check[1]+ check[2]} target="_blank" rel="noreferrer" href={check[2]}>{check[1]}</a>);
  }
  //push the rest into the array
  output.push(text.slice(start));
  return output;
}
function compareDates(x, y){
  return new Date(y.added_date_time) - new Date(x.added_date_time);
}
export default AnswerTable;

