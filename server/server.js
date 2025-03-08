// Application server
// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const app = express();
const port = 8000;

const Question = require('./models/questions.js');
const Answer = require('./models/answers.js');
const Tag = require('./models/tags.js');
const User = require('./models/users.js');
const Comment = require('./models/comments.js');
const questions = require('./models/questions.js');

// Define the database URL to connect to.
const mongoDB = "mongodb://127.0.0.1:27017/fake_so";

mongoose.connect(mongoDB, {useNewUrlParser:true, useUnifiedTopology:true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use( //the session is stored as a cookie
  session({
    secret: "verysecret", //used to encrypt session id cookie
    cookie: {httpOnly:true, maxAge:360000, path: '/'}, //don't use secure
    resave: false, //don't create new session for each request
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/fake_so'})
  })
)

app.get('/auth', (req,res)=>{
  console.log("checking authentication...");
  console.log(req.session);
  if(req.session.isAuth===true){
    console.log("saving session");
    console.log(req.session);
   // res.send(true);
   res.json(req.session);
  }
  else{
    console.log("can't save session");
   // res.send(false);
      res.json();
  }
})

app.post("/logout", (req,res)=>{
  console.log("in logout");
  req.session.destroy(err => {
    if(err){
      console.log(err);
      res.send(false);
    }
    res.clearCookie('sessionID');
    res.send(true);
  });
});

//retrieving all questions
app.get('/questions', async (req, res) => {
    // get all questions
    const ques = await Question.find().populate("tags").populate("asked_by").populate({
      path: "answers", 
      populate: [{
        path: 'ans_by'}, // Assuming 'ans_by' is the field referencing the user in the Answer schema
        {path: 'comments',
            populate:{
              path: 'added_by',
            } }]}).populate({
    path: 'comments',
    populate: {
        path: 'added_by' 
    }}).exec();
    const finalques = ques.map(question => question.toJSON({ virtuals: true }));
    console.log(finalques);
    res.json(finalques);
});

app.post('/deleteTag/:userId', async(req,res) => {
  console.log("delete tag");
  let user = req.params.userId;
  let id = req.body._id;
  Question.find({ 
      $and: [ 
          { tags: id}, 
          { asked_by: { $ne: user } } 
      ]
  }).then(async (questions) => {
    console.log(questions)
    if (questions.length === 0) { // if there are no other 
          await Question.updateMany(
              { tags: id}, 
              { $pull: { tags: req.body._id } } 
          );
          await Tag.deleteOne({"_id" : req.body._id});
          res.send(true)
    }
    else{ //if there are other users with the same tag
      console.log("here")
      res.send(false)
    }
  }).catch(err => {
      console.error(err); 
  });
})
app.post("/deleteUser/:userId", async(req, res)=>{ //this doesn't work
   let userId = req.params.userId;
    //delete all questions, answers, and comments made by the users
    let answers = Answer.find({ans_by: userId});
    let questions = Question.find({asked_by: userId});
    let comments = Comment.find({added_by:userId});
    const answerIds = answers.map(answer => answer._id);
    const questionsIds = questions.map(question => question._id);
    const commentsIds = comments.map(comment => comment._id);

    //delete comment references inside answers and questions
    await Question.updateMany({ 'comments': userId }, { $pull: { 'comments': { user: userId } } });
    await Answer.updateMany({ 'comments.user': userId }, { $pull: { 'comments': { user: userId } } });
    await Comment.deleteMany({ added_by: userId });

    await Question.deleteMany({ _id: { $in: questionsIds } });
    await Answer.deleteMany({ _id: { $in: answerIds } });
    await Comment.deleteMany({ _id: { $in: commentsIds } });
    await User.deleteOne({ _id: userId });
})

app.post('/deleteAnswer/:qID', async(req,res) => {
  try{
    console.log("delete answer");
    let ans = await Answer.findById({"_id": req.body._id});
    let que = await Question.findById(req.params.qID);
    let anss = que.answers;
    console.log(req.params.qID);
    console.log(req.body._id);
    console.log(ans._id);
    console.log(que.title);
    for(let i=0;i<req.body.comments.length;i++){ //deletes all comments from posted answer
      await Comment.deleteOne({"_id" : req.body.comments[i]._id})
    }

    const filter = { _id:que._id };
    const modify = { $pull: { 'answers': ans._id } } ;
    console.log(filter);
    console.log(modify);
    const result = await Question.updateOne(filter, modify);
    const updatedQ = await Question.findById(req.params.qID).populate("tags").populate("comments").populate("asked_by").populate({
      path: "answers", 
      populate: [{
        path: 'ans_by'}, // Assuming 'ans_by' is the field referencing the user in the Answer schema
        {path: 'comments',
            populate:{
              path: 'added_by',
            } }]})
     .populate({
      path: 'comments',
      populate: {
          path: 'added_by' 
      }}).exec();
    console.log(result);
    await Answer.deleteOne({"_id" : req.body._id});
    res.json(updatedQ.toJSON({ virtuals: true }));
  }
  catch(err){
    console.log(err);
  }
})

app.post('/deleteUserAnswers', async(req,res) => { //gets an array of answers done by user
  try{
    console.log("deleting answers");
    let ans = await Answer.find({'ans_by' : req.body._id})
    console.log(ans);
    let ansIds = ans.map(a=>a._id);
    let ares = await Question.updateMany( //pull answers from questions
      { answers: {$in: ansIds}}, 
      { $pull: { answers: {$in: ans} } } 
    );

    let dres = await Answer.deleteMany({_id: {$in:ansIds}});
    console.log(dres);
    res.send("success");
  }
  catch(err){
    console.log(err);
  }
})

app.post('/deleteUser', async(req,res)=>{ //this includes deleting the questions and answers user asked
  try{
    console.log("in delete user");
    await User.deleteOne({"_id" : req.body._id});
    res.send("success");
  }
  catch(error){
    console.log(error);
  }
})

app.post('/deleteUserQuestions', async(req,res) => {
  try{
    console.log("delete user questions");
    let qsToDelete = req.body;
  
    console.log("deleting questions");
    let qs = await Question.find({'asked_by' : req.body._id}) //find all questions user asked
    console.log(qs);
    let storeours = [];
    let qsIds = qs.map(q=>q._id);
    let ours = qs.map(q=>{
                  q.tags.map(t=>{storeours.push(t.toString())})})

    let storeq=[]; //all unique tags for all questions
    let storet=[];//where dup tags go for all questions
    let tsIds = qs.map(q=>{console.log("g1 " + (q.tags))});
    let allqs = await Question.find();
    let allqIds = allqs.map(q=>{
                      q.tags.map(t=>{
                        console.log("help");
                        console.log(t);
                        if(!storeq.includes(t.toString())){
                            storeq.push(t.toString());
                        }
                        else{
                          storet.push(t.toString());
                        };
                      })
                  })
    console.log("storeq");
    console.log(storeq);
    console.log("storet");
    console.log(storet);
    console.log("storeours");
    console.log(storeours);


    for(let i=0;i<qs.length;i++){
      let Q = qs[i];
      for(let j=0;j<Q.tags.length;j++){
        let tagD = Q.tags[j];
        console.log("here");
        console.log((tagD._id).toString());
        if((storet.includes((tagD._id).toString()))){ //ensures not deleting shared tags b/c dup
          console.log("would NOT delete", tagD._id);
        }
        else{
          console.log("would delete", tagD._id);
          await Tag.deleteOne({_id: tagD._id});
        }
      }
    }
    let qres = await Question.deleteMany({_id: {$in:qsIds}});
    console.log(qres);
    res.send("success");
  }
  catch(err){
    console.log(err);
  }
})


app.post('/deleteComments', async(req,res) => {
  try{
    console.log("delete comments");
    console.log(req.body._id);
    let comments = await Comment.find({'added_by' : req.body._id})
    console.log(comments);
    let commentIds = comments.map(c=>c._id);
    console.log(commentIds);
    let qres = await Question.updateMany(
      { comments: {$in: commentIds}}, 
      { $pull: { comments: {$in: comments} } } 
    );

    let ares = await Answer.updateMany(
      { comments: {$in: commentIds}}, 
      { $pull: { comments: {$in: comments} } } 
    );

    let cres = await Comment.deleteMany({_id: {$in:commentIds}});
    console.log(qres);
    console.log(ares);
    console.log(cres);
    res.send("success");
  }
  catch(err){
    res.send(err);
  }
})


app.post('/deleteQuestion', async(req,res) => {
  try{
    let storeq=[]; //all unique tags for all questions
    let storet=[];//where dup tags go for all questions
    let allqs = await Question.find();
    let allqIds = allqs.map(q=>{
                      q.tags.map(t=>{
                        console.log(t);
                        if(!storeq.includes(t.toString())){
                            storeq.push(t.toString());
                        }
                        else{
                          storet.push(t.toString());
                        };
                      })
                  })
    console.log("delete question");
    for(let i=0;i<req.body.tags.length;i++){
      if(!storet.includes(req.body.tags[i]._id)){
        console.log("delete tag: ", req.body.tags[i]._id);
         await Tag.deleteOne({ "_id" : req.body.tags[i]._id});
      }
    }
    for(let i=0;i<req.body.comments.length;i++){ //deletes question comments
      await Comment.deleteOne({"_id" : req.body.comments[i]._id})
    }
    for(let i=0;i<req.body.answers.length;i++){ //deletes answer comments
      for(let j=0;j<req.body.answers[i].comments.length;j++){
        console.log("deleting answer comment " + req.body.answers[i].comments.length);
        await Comment.deleteOne({"_id" : req.body.answers[i].comments[j]._id})
       }
    }
    for(let i=0;i<req.body.answers.length;i++){
      await Answer.deleteOne({"_id" : req.body.answers[i]._id})
    }
    await Question.deleteOne({ "_id" : req.body._id});
    res.send("success");
  }
  catch(err){
    console.log(err);
  }
})

app.get('/question/:qid', async(req,res)=>{
  try{
    console.log("getting current question");
    const q = await Question.findById(req.params.qid);
    res.json(q);
  }
  catch(err){
    console.log(err);
  }
})

app.post('/editTag/:tagId/:name/:qId', async(req,res)=>{
  try{
    console.log("Modifying tag");
    await Tag.updateOne(
      { "_id" : req.params.tagId },
      { $set: { name:req.params.name} }
    )
    let currQ = await Question.findById(req.params.qId);
    let changeTag = await Tag.findById(req.params.tagId);
    await Question.updateOne(
        { "_id" : req.params.qId },
        { $set: { [changeTag.name] :req.params.name} }
      )
     
    res.send("success");
  }
  catch(error){
    console.log(error);
  }
})
app.get('/checkTag/:tagId/:userId', async(req, res)=>{
  try{
    let id = req.params.userId;
    console.log(id);
    let tagid = req.params.tagId;
    let tg = await Tag.findOne({'_id':tagid});
    console.log(tagid);
    let storeq=[]; //all unique tags for all questions
     let storet=[];//where dup tags go for all questions
     let allqs = await Question.find();
     let allqIds = allqs.map(q=>{
                       q.tags.map(t=>{
                         //console.log(t);
                         if(!storeq.includes(t.toString())){
                             storeq.push(t.toString());
                         }
                         else{
                           storet.push(t.toString());
                         };
                       })
                   })
     console.log(storet);
     console.log("the id: ", tg._id)
     if(!storet.includes(tg._id.toString())){
         res.send(true)
     }
     else{
       res.send(false);
     }
 }
 catch(err) {
     console.error(err); 
 }
 })

app.post('/modifyQuestion/:queId', async(req,res) => {
  try{
    console.log("Modifying question");
    let q = Question.findById(req.params.queId);
    console.log("Body", req.body);
    const {title, summary, text,tags,answers, asked_by, ask_date_time, comments,views, votes} = req.body;
    await Question.updateOne(
      { "_id" : req.params.queId },
      { $set: { title: title, summary: summary, text: text, tags: req.body.tagIds} }
    )
    res.send("success");
  }
  catch(error){
    console.log(error);
  }
})

//creating a new question
app.post('/addQuestion', async(req, res) => {
  try{
    console.log("in addQuestion from server");
    console.log("Body", req.body);
    const {title, summary, text,tags,answers, asked_by, ask_date_time, comments,views, votes} = req.body;
    const createQues = new Question({
      title:title,
      summary:summary,
      text:text,
      tags: req.body.tagIds,
      answers: answers,
      asked_by: asked_by,
      ask_date_time: ask_date_time,
      comments: comments,
      views: views,
      votes: votes
    });
    const quesId = (await createQues.save())
    const saveTags = await Question.findById(quesId).populate("tags").populate("asked_by").populate({
      path: "answers", 
      populate: [{
        path: 'ans_by'}, // Assuming 'ans_by' is the field referencing the user in the Answer schema
        {path: 'comments',
            populate:{
              path: 'added_by',
            } }]}).populate({
    path: 'comments',
    populate: {
        path: 'added_by' 
    }}).exec();
    console.log(quesId);
    console.log(saveTags);
    res.send("Successfully added!");
}catch(error){
     console.log(error);
}});

//incrementing view count
app.post('/posts/question/:questionId/views', async (req, res) => {
  try {
    console.log("increment views");
    console.log(req.params.questionId);
    const quesId = req.params.questionId;
    const currQuestion = await Question.findById(quesId).populate("tags").populate("comments").populate("asked_by").populate({
      path: "answers", 
      populate: [{
        path: 'ans_by'}, // Assuming 'ans_by' is the field referencing the user in the Answer schema
        {path: 'comments',
            populate:{
              path: 'added_by',
            } }]})
    .populate({
      path: 'comments',
      populate: {
          path: 'added_by' 
      }}).exec();
    currQuestion.views++;
    await currQuestion.save();
    res.json(currQuestion);
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
});

//incrementing votes count and user rep
app.post('/posts/:typeId/:typeName/:direction', async (req, res) => {
  try {
    console.log("votes in server");
    console.log(req.params.typeName);
    console.log(req.params.typeId);
    const typeId = req.params.typeId;
    let currType = null;
    let userId = null;
    if(req.params.typeName === "Question"){
      currType = await Question.findById(typeId);
      userId = currType.asked_by._id;
    }
    else if(req.params.typeName === "Answer"){
      currType = await Answer.findById(typeId);
      userId = currType.ans_by._id;
    }
    const u = await User.findById(userId); //this is the user the question/answer belongs to
    if(req.params.direction === "up"){;
      currType.votes++;
      u.rep=u.rep+5;
    }
    else{
      currType.votes--;
      u.rep=u.rep-10;
    }
    await currType.save();
    await u.save();
    console.log("success");
    res.send("success");
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.send("fail");
  }
});
//retrieving answers
app.get('/answers', async(req, res)=>{
  const ans = await Answer.find().populate("ans_by").populate({
    path: 'comments',
    populate: {
        path: 'added_by' 
    }}).exec();
  console.log("getting answers from server");
  //console.log(ans);
  res.send(ans);
});
app.post("/comment/upvote/:commentId", async(req,res)=>{
  try{
  const curr = await Comment.findById(req.params.commentId).populate("added_by");
  curr.votes++;
  await curr.save();
  res.json(curr);
  }
  catch(error){
    console.log(error);
  }
})

// app.get("/comments/:type/:typeId", async(req,res)=>{
//  try{
//   if(type==="question"){ //find all comments for specific question
//     let q = await Question.findById(req.params.typeId);
//     res.json(q.comments);
//   }
//   else if(type==="answer"){ //find all comments for specific answer
//     let a = await Answer.findById(req.params.typeId);
//     res.json(a.comments);
//   }
//  }
//  catch(err){
//   console.log(err);
//  }
// })


//retrieving users
app.get('/users', async(req, res)=>{
  const users = await User.find();
  console.log("getting users from server");
  console.log(users);
  res.send(users);
});

app.post('/modifyAnswer/:aid/:qid', async(req,res) => {
  try{
    console.log("Modifying answer");
    let ans = await Answer.findById(req.params.aid);
    const que = await Question.findById(req.params.qid);
    console.log("Replace Question " + que + " " + req.params.qid);
    console.log(" with new answer ", req.body)
    const {text} = req.body;
    await Answer.updateOne(
      {_id: req.params.aid},
      { $set: { text:text} }
    );
    console.log(ans.text);
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.qid,
      { $set: {'ans.text':text}},
      {new:true, arrayFilters: [{'ans._id':ans._id}]}
    ).populate({
      path: 'comments',
      populate: {
          path: 'added_by' 
      }}).populate({
        path: "answers", 
        populate: [{
          path: 'ans_by'}, 
          {path: 'comments',
              populate:{
                path: 'added_by',
              } }]}).exec();
    console.log(updatedQuestion);
    res.json(updatedQuestion.toJSON({ virtuals: true }));
    res.json();
  }
  catch(error){
    console.log(error);
  }
})

//Create and add an answer to the current question
app.post('/addAnswer/posts/:questionId', async(req, res)=>{
  try{
    console.log("came here");
    const quesId = req.params.questionId;
    console.log(quesId);
    const {text, ans_by, ansDate, votes} = req.body;
    const createAns = new Answer ({
      text, ans_by, ansDate, votes
    });
    const ansId = (await createAns.save())._id;
    await Question.findByIdAndUpdate(
      quesId,
      { $push: { answers: ansId } },
      { new: true }
  );
  const updatedQuestion = await Question.findById(quesId)
    .populate({
      path: "answers",
      options: { sort: { ans_date_time: -1 } },
      populate: [{
          path: 'ans_by'}, // Assuming 'ans_by' is the field referencing the user in the Answer schema
          {path: 'comments',
              populate:{
                path: 'added_by',
              } }]})
   .populate("tags").populate("asked_by").populate({
    path: 'comments',
    populate: {
        path: 'added_by' 
    }}).exec();
  res.json(updatedQuestion.toJSON({ virtuals: true }));

    res.json()
}catch(error){
     console.log("can't add answer");
}});

app.get('/answers/:questionId', async(req, res)=>{
  try{
    const quesId = req.params.questionId;
    const currQuestion = await Question.findById(quesId);
    const answers = await Answer.find({ _id: { $in: currQuestion.answers} }).sort({ans_date_time: -1}).populate("ans_by").populate({
      path: 'comments',
      populate: {
          path: 'added_by' 
      }}).exec();;
    res.json(answers); 
}catch(error){
     console.log("can't add answer");
}});


//adding tags
app.post('/addTag', async(req, res)=>{
  try{
    console.log("Tag", req.body);
    const {name} = req.body;
    const createTag = new Tag({
      name
    });
    const tagId = (await createTag.save());
    console.log("name", tagId.name);
    res.json(tagId);
}catch(error){
     console.log("can't add tag");
}});

//retriving tags
app.get('/tags', async(req, res)=>{
  const tags = await Tag.find();
  res.json(tags);
});

let server = app.listen(port, () => {console.log(`Example app listening on port ${port}`);
});

//adding comments
app.post('/:questionId/addComment1', async(req, res)=>{
  try{
    const quesId = req.params.questionId;
    console.log(quesId);
    const {text, added_by, added_date_time, votes} = req.body;
    const createComment = new Comment({
      text: text,
      added_by: added_by,
      added_date_time:added_date_time,
      votes:votes
    });
    console.log(createComment);
    const id = (await createComment.save())._id;
    console.log("id", id);
    await Question.findByIdAndUpdate(
      quesId,
      { $push: { comments: id } },
      { new: true }
    );
    const questions = await Question.findById(quesId).populate("tags").populate("asked_by").populate({
      path: "answers", 
      populate: [{
        path: 'ans_by'}, // Assuming 'ans_by' is the field referencing the user in the Answer schema
        {path: 'comments',
            populate:{
              path: 'added_by',
            } }]}).populate({
    path: 'comments',
    populate: {
        path: 'added_by' 
    }}).exec();
    res.json(questions);
   }catch(error){
    console.log("can't add comment");
}});
app.post('/:answerId/addComment2', async(req, res)=>{
  try{
    const ansId = req.params.answerId;
    const {text,added_by, added_date_time, votes} = req.body;
    const createComment = new Comment({
      text: text,
      added_by:added_by,
      added_date_time:added_date_time,
      votes:votes
    });
    const id = (await createComment.save())._id;
    await Answer.findByIdAndUpdate(
      ansId,
      { $push: { comments: id } },
      { new: true }
    );
    const answer = await Answer.findById(ansId).populate("ans_by").populate({
      path: 'comments',
      populate: {
          path: 'added_by' 
      }}).exec();
    console.log("the answer!!! " + answer);
    res.json(answer);
   }catch(error){
    console.log("can't add comment");
}});

app.get('/users/:email', async(req,res) =>{
  console.log("finding user with specific email");
  try{
    const findUser = await User.findOne({email: req.params.email});
    console.log("finding user with same email as: " + req.params.email);
    //console.log(findUser);
    if(findUser===null){
      res.json(null);
    }
    else{
      console.log("found the user with that email");
      res.json(findUser);
    }
  }
  catch{
    console.log("can't search db for users with that email");
  }
})

//https://dev.to/documatic/what-is-bcrypt-how-to-use-it-to-hash-passwords-5c0g
app.post('/user', async(req, res)=>{
  try{
    console.log("Body", req.body);
    const {firstname,lastname,username, email,password, rep, memberTime, admin} = req.body;
    const plainTextPassword = password;
    const saltRounds = 10;
    bcrypt.hash(plainTextPassword, saltRounds, async (err, hash) => {
          // Store hash in your password DB.
          const createUser = new User({
            firstname:firstname,
            lastname:lastname,
            username: username,
            email:email,
            password:hash,
            rep:rep,
            memberTime:memberTime,
            admin: admin
          });
          const saveUser = (await createUser.save())._id;
          console.log(saveUser);
          res.send("Successfully added!");
    });
  }
  catch(error){
     console.log(error);
  }
});

app.post('/checkUser', async(req,res)=>{
  try{
    console.log("in login server side");
    console.log(req.body);
    const {email,password} = req.body;
    const findUser = await User.find({email: email });
    console.log("here");
    if(findUser[0] != null){
      console.log(findUser[0]);
      console.log(findUser[0]._id);
      let username = findUser[0].username;
      let isAdmin = findUser[0].admin;
    // console.log(findUser.body.password);
      console.log(findUser[0].password);
      const match = await bcrypt.compare(password, findUser[0].password); //go through db and see if username matches and email and if so compare password
      if(match){
        console.log("all good");
        req.session.isAuth = true;
        req.session.user = {email,username,isAdmin};
        req.session.save();
        console.log(req.session);
        res.json({usermail: true, userpass: true, admin: isAdmin});
      }
      else{
        console.log("password not put in correctly");
        res.json({usermail: true, userpass: false})
      }
    }
    else{
      console.log("Imposter!!");
      res.json({usermail: false, userpass: false});
    }
  }
  catch{
    console.log("unable to check user");
  }
})
app.get('/userquest/:userId',async(req, res)=>{
  let userId = req.params.userId;
  let questions = await Question.find({asked_by: userId}).populate("tags").populate("asked_by").populate({
    path: "answers", 
    populate: [{
      path: 'ans_by'}, 
      {path: 'comments',
          populate:{
            path: 'added_by',
          } }]})
    .populate({
      path: 'comments',
      populate: {
          path: 'added_by' 
      }}).exec();
    console.log("finding questions user asked");
    console.log(questions)
    res.json(questions);
})
app.get('/userans/:userId',async(req, res)=>{
  try{
  let userId = req.params.userId;
  let answers= await Answer.find({ans_by: userId}).populate('comments').populate("ans_by");
  const answerIds = answers.map(answer => answer._id);
  const questions = await Question.find({ 'answers': { $in: answerIds } })
  .populate("tags").populate('comments').populate("asked_by").populate({
    path: "answers", 
    populate: [{
      path: 'ans_by'}, 
      {path: 'comments',
          populate:{
            path: 'added_by',
          } }]})
    .populate({
    path: 'comments',
    populate: {
        path: 'added_by' 
    }}).exec();
  res.json(questions);
  }
  catch(err){
    console.log(err);
  }
})

process.on('SIGINT',  () => {
  if(db) {
    console.log('process terminating');
    server.close(()=> {
      console.log('Server closed. Database instance disconnected');
      process.exit(0);
    })
  }
});
