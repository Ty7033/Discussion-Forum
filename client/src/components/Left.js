import '../App.js';
import React from 'react';
import '../stylesheets/App.css';

class Left extends React.Component{
  All_question_link(){
    this.props.updatePopulateForm(false);
    this.props.updatePage("all_question");
    this.props.handleAdminState(false);
  }
  render(){
    const classes=this.props.currPage==="all_question" || this.props.currPage==="search" || this.props.currPage==="filterTags"? "current" : "";
    return (
      <div className="left" id="left">
        <ul>
          <li className="question_link">
            <a href="#questions" id="question_link" className={classes} onClick={()=>this.All_question_link()} >Questions
            </a>
          </li>
          <li id="tags_link">
            <a href="#tags" className = {this.props.currPage==="tags_page" ? "current" : ""} onClick={()=>this.props.updatePage("tags_page")}>Tags</a>
          </li>
        </ul>
      </div>
    );
  }
}

export default Left;