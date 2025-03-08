import '../App.js';
import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';

class QuestionTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {getQs:[] , answers:[], current:0, questions: this.props.questions};
    console.log("constructed");
    this.handleButtons = this.handleButtons.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
  }
  componentDidUpdate(prev) {
    if (this.props.questions !== prev.questions) {
      this.setState({questions: this.props.questions});
    }
  }
  componentDidMount() {
    console.log("came into mounted");
    axios.get('http://localhost:8000/questions')
    .then(response => {
        console.log(response.data);
        this.setState({ getQs: response.data.slice().sort(compareDates) });    
    })
      .catch(error => {
        this.props.setErr('Error fetching questions data');
    });
    axios.get('http://localhost:8000/answers')
    .then(response => {
        console.log(response.data);
        this.setState({ answers: response.data });
    })
      .catch(error => {
        this.props.setErr('Error fetching answers data:');
    });
    console.log("finished");
  }

  handleButtons = (status) => {
    if(status==='active'){
      console.log("you clicked on active");
      let newSort = this.active();
      console.log("Active:", newSort);
      this.setState({current: 0, questions:newSort})
    }
    else if(status==='unanswered'){
      console.log("you clicked on unanswered");
      let newSort = this.unanswered();
      console.log(newSort);
      this.setState({current: 0, questions:newSort})
    }
    else if(status==='newest'){
      console.log("you clicked on newest");
      console.log(this.props.currPage);
      let newSort = this.props.questions;
      console.log(newSort);
      this.setState({current: 0, questions:newSort})
    }
  };
  handlePrev=()=>{
    if (this.state.current!== 0){
      this.setState({current: this.state.current - 1})
    }
  }
  handleNext=()=>{
    let questions = this.props.questions;
    let number = Math.ceil(questions.length / 5)
    console.log(number)
    if (this.state.current === number - 1){
      this.setState({current: 0})
    }
    else{
      this.setState({current: this.state.current + 1})
    }
  }
  searchAssociated(id) { //goes through each q and each answer to find the question with that id
    let question_list = this.state.getQs;
    console.log(question_list);
    for (let i = 0; i < question_list.length; i++) {
        let a = question_list[i].answers;
        for (let j = 0; j < a.length; j++) {
            if ((a[j])._id === id) {
                return question_list[i];
            }
        }
    }
  }
  active(){
    console.log("testing active");
    console.log(this.props.questions);
    const allAnswers = [];
    this.props.questions.forEach(question => {
    if (question.answers && question.answers.length > 0) {
        allAnswers.push(...question.answers);
    }
   });
    console.log("all the answers");
    let ques = this.props.questions;
    console.log(ques);
    let sortedList= new Set();
    let anList=allAnswers.slice().sort(this.compareAnsDate);
    //go through the list of sorted answers and find the associated question
    for(let i =0; i<anList.length; i++)
    {
        console.log(anList[i]._id +" "+ anList[i].ans_by);
        let c=this.searchAssociated(anList[i]._id);
        if(c!==undefined)
        {
          console.log("found match");
            sortedList.add(c);
        }
    }
    sortedList=[...sortedList];
      for(let i=ques.length-1; i >= 0; i--){
        let found=false;
        let curr_id=ques[i]._id;
        for (let j=0; j<sortedList.length; j++){
          if (sortedList[j]._id===curr_id){
            found=true;
            break;
          }
        }
        if (!found){
          sortedList.push(ques[i]);
        }
      }
    return sortedList;
  }
  compareAnsDate(x, y){
    return new Date(y.ans_date_time) - new Date(x.ans_date_time);
  }
  unanswered(){
    let ques=this.props.questions;
    let displaylist=[];
    for(let i=0; i<ques.length; i++){
        if(ques[i].answers.length===0){
            displaylist.push(ques[i]);
        }
    }
    console.log(displaylist);
    return displaylist.slice().sort(compareDates);
  }
  render() {
    let questions = this.state.questions;
    let count = questions.length;
    let start = this.state.current * 5;
    let end = Math.min(start + 5, questions.length);
    questions = questions.slice(start, end)
    const rows = [];
    console.log(questions);
    questions.forEach((question) => {
      console.log(question);
      rows.push(
        <QuestionRow
          question={question}
          key={question._id}
          updatePage={this.props.updatePage}
          onQuestion={this.props.onQuestion}
          handle = {this.props.handle}
          setErr={this.props.setErr}
          currPage = {this.props.currPage} updatePopulateForm={this.props.updatePopulateForm}
         /> 
      );
    });
    if(rows.length===0 && this.props.currPage !== "search"){
      rows.push( <h3 key ="none" className="not_found">No Questions Found</h3>)
    }
    else if (rows.length===0 && this.props.currPage === "search"){
      rows.push( <h3 key ="none" className="not_found">No Results Found</h3>)
    }
    let qhead="All Questions";
    console.log(this.props.currPage);
    if(this.props.currPage === "search"){
        qhead = "Search Results";
    }
    console.log(this.props.userType);
    return (
      <div>
      <div className="main-table" id="all_questions">
      <table id="top_table">
        <tbody>
          <tr id="top_row">
          <td id="first_row">
            <div id="top">
              <h3 id="q_head">{qhead}</h3>
              {this.props.userType !== "guest" && (
              <button type="button" id ="ask_button" onClick={() => this.props.updatePage('question_form')}>Ask Question</button>
              )}
            </div>
            </td>
          </tr>
          <tr id="next">
            <td id="next_row">
              <h5 id="question_count">{count > 1 ? count + " Questions": count + " Question"}</h5>
              <div id="buttons_cell">
                  <button type="button" id="newest_button" onClick={() => this.handleButtons('newest')}>Newest</button>
                  <button type="button" id="active_button" onClick={() => this.handleButtons('active')}>Active</button>
                  <button type="button" id="unanswered_button" onClick={() => this.handleButtons('unanswered')}>Unanswered</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      {rows}
      </div>
      <div>
      {this.props.questions.length > 5 && (
          <div id="buttom_buttons" className= "static">
              <button type="button" id="prev_button" onClick={() => this.handlePrev()}>Prev</button>
              <button type="button" id="next_button" onClick={() => this.handleNext()}>Next</button>
          </div>
      )}
      </div>
      </div>
    );
  }
}
class QuestionRow extends React.Component {
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
      this.props.updatePage('answer_page');
      this.props.onQuestion(response.data);
    })
    .catch(error => {
      this.props.setErr('Error updating views');
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
function compareDates(x, y){
  return new Date(y.ask_date_time) - new Date(x.ask_date_time);
}

export default QuestionTable;

