import '../App.js';
import React from 'react';
import '../stylesheets/App.css';
import axios from 'axios';

class TagsPage extends React.Component{ //can be called from right.js or profile.js
    constructor(props)
    {
        super(props);
        this.filterQuestions= this.filterQuestions.bind(this);
    }
    total = 0;
    compareDates(x, y){
        return new Date(x.ask_date_time) - new Date(y.ask_date_time);
    }
    setUpHeader(){
        return (
            <div id= "head_css">
                <h1>{this.total + " Tags"}</h1>
                <h1 id="mid-ele">{"All Tags"}</h1>
                {(this.props.userType != "guest" && this.props.currPage=="tags_page") && (
                <button id="ab2" onClick={()=>this.props.updatePage("question_form")}>Ask Question</button>
                )}
            </div>
        )
    }
    render() {
        let q = this.props.quest.slice().sort(this.compareDates);
        this.total=0;
        let Qs = q;
        if(this.props.currPage === "user_tags"){
            //only loop through questions user created b/c those are the tags user created also
            Qs=[];
            for(let i=0;i<q.length;i++){
                if(q[i].asked_by.email === this.props.user.email){
                    Qs.push(q[i]);
                }
            }
        }
        const arr=[];
        const boxes=[];
        Qs.forEach(quest => {
            console.log(quest.tags);
            quest.tags.forEach(tag =>{
                let tname = tag.name;
                let tagCount = this.tagCount(tname);
                this.total++;
                if(!(this.tagDupsCheck(tname, arr))){
                    arr.push(tag);
                    boxes.push(<TagBoxes setErr ={this.props.setErr} key = {tag._id} arr={arr} tag={tag} fil={this.filterQuestions} userType = {this.props.userType} tagname= {tname} count={tagCount} updatePopulateForm={this.props.updatePopulateForm} updatePage={this.props.updatePage} user= {this.props.user} currPage ={this.props.currPage} updateTags={this.props.updateTags} quest={quest}/>);
                }
            })
        });
        console.log("render tags ");
        return(
          <div id="tags_page" className="tags_list">
              {this.setUpHeader()}
          <div id="tag_container">
              {boxes}
            </div>
        </div>
        );
      }
    tagDupsCheck(input, tArrs){
        for(let k=0;k<tArrs.length;k++){
          if(((tArrs[k].name).toLowerCase())===input.toLowerCase()){
            return true;
          }
        }
        return false;
    }
    tagCount(input){ //input is a specific tag. count for specific tag
        let q = this.props.quest.slice().sort(this.compareDates);
        let count = 0; //because already one tag exist
        for(let i=0;i<q.length;i++){
              let found = this.props.searchTag(input, this.props.quest[i]);
              if(found){
               count++;
              }
        }
        console.log("find matched tags");
        return count; 
      }
      filterQuestions(input){
        console.log("came in here");
        let matched = [];
        let questions = this.props.quest;
        for(let i=0;i<questions.length;i++){
            let found = this.props.isTag(input,questions[i]);
            if(found){
                matched.push(questions[i]);
            }
        }
        console.log(matched);
        this.props.updatePage("filterTags", matched);
    }
}
class TagBoxes extends React.Component{
    constructor(props){
        super(props);
        this.state = {qTag:this.props.tagname, isEditing:false, err:""} //qTag represents tagname
        this.deleteTag = this.deleteTag.bind(this);
        this.handleTag = this.handleTag.bind(this);
        this.updateEditing = this.updateEditing.bind(this);
        this.saveEditing = this.saveEditing.bind(this);
    }
    handleTag = async(e)=>{
        console.log(e.target.value);
        this.setState({qTag: e.target.value});
    }
    updateEditing = async(val)=>{ //cant edit tag if someone else editing it
        await axios.get(`http://localhost:8000/checkTag/${this.props.tag._id}/${this.props.user._id}`).then((res)=>{
            if(res.data == true){
                console.log("update editing " + val);
                this.setState({isEditing:val});
            }
            else{
                this.setState({err:"Tag can't be edited"})
            }
        }).catch(err=>{
            this.props.setErr("Tag can't be edited");
        })
    }
    deleteTag=async()=>{
        console.log(this.props.user);
        await axios.post(`http://localhost:8000/deleteTag/${this.props.user._id}`, this.props.tag).then((res)=>{
        console.log(res)
        if(res.data == true){
            console.log("came")
            this.props.updatePage("user_tags");
        }
        else{
            this.setState({err:"Tag can't be deleted"})
        }
    }).catch((err)=>{this.props.setErr("Tag can't be deleted");})
    }
    saveEditing=async()=>{
        await axios.post(`http://localhost:8000/editTag/${this.props.tag._id}/${this.state.qTag}/${this.props.quest._id}`, this.props.tag).then(()=>{
            console.log("edit tag!");
            this.updateEditing(!this.state.isEditing);
            this.props.updatePage("user_tags");
        }).catch((err)=>{this.props.setErr("Tag can't be saved");})
    }
    render(){
        let currentCount = this.props.count;
        let content=""
        if(currentCount > 1){
            content= currentCount + " questions";
        }
        else{
            content= currentCount + " question";
        }
        return(
        <div className="boxes">
        <label>{this.state.isEditing?(<input value={this.state.qTag} onChange={this.handleTag}/>) : (
           <a className="boxContent" href="#tag" onClick={()=>this.props.fil("[" + this.props.tagname + "]")}>{this.props.tagname}</a>
        )}</label>
        {(this.props.userType !== "guest" && this.props.currPage!=="tags_page") && (
        <div id = "edit_buttons">
           <button type="button" id="tag_delete" onClick={()=>this.deleteTag()}>Delete</button>
           <button type="submit" onClick={this.state.isEditing?()=>this.saveEditing():()=>this.updateEditing(true)}>{this.state.isEditing?"Save" : "Edit"}</button>
        </div>
        )}
        <span htmlFor="error7" className='error7' id="error7" name="error7">{this.state.err}</span>
        <p id= "ques_count">{content}</p>
        </div>
     );}
}
export default TagsPage;

