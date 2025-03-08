// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
const bcrypt = require('bcrypt');
let userArgs = process.argv.slice(2);

if (userArgs.length < 2) {
    console.log('ERROR: You need to specify an admin username and password');
    return
}

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let User = require('./models/users')
let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];
function tagCreate(name) {
  let tag = new Tag({ name: name });
  return tag.save();
}

function answerCreate(text, ans_by, ans_date_time) {
  answerdetail = {text:text};
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;

  let answer = new Answer(answerdetail);
  return answer.save();
}

function questionCreate(title, summary, text, tags, answers, asked_by, ask_date_time, views) {
  qstndetail = {
    title: title,
    summary: summary,
    text: text,
    tags: tags,
    asked_by: asked_by
  }
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;

  let qstn = new Question(qstndetail);
  return qstn.save();
}
async function userCreate(firstname, lastname, username, email, password, rep=50, admin) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    const user = new User({
      firstname: firstname,
      lastname: lastname,
      username: username,
      email: email,
      password: hash,
      rep :rep,
      admin: admin || false 
    });
    const savedUser = await user.save();
    return savedUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; 
  }
}

const populate = async () => {
  await userCreate("admin", "admin", "admin", userArgs[0], userArgs[1], 1000, true)
  let u1 = await userCreate("salt", "peter", "saltpeter", 'abc@abc.com', '12344' ,50, false)
  let u2 = await userCreate("Joji", "John", "Joji John", '1c@abc.com', '10934' ,50, false)
  let u3 = await userCreate("hamkalo", "ray", "hamkalo", '2c@abc.com', '11934' ,50, false)
  let u4 = await userCreate("abaya", "k", "abaya", '4c@abc.com', '10934',50, false)
  let u5 = await userCreate("sana", "ray", "sana", '5c@abc.com', '11934' ,50, false)
  let u6 = await userCreate("azad", "k", "abaya", '6c@abc.com', '10934',50, false)
  let u7 = await userCreate("alia", "k", "alia", '7c@abc.com', '10934',50, false)
  let t1 = await tagCreate('react');
  let t2 = await tagCreate('javascript');
  let t3 = await tagCreate('android-studio');
  let t4 = await tagCreate('shared-preferences');
  let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.', u3, false);
  let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.', u6, false);
  let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.', u4, false);
  let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);', u7, false);
  let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own. ', u5, false);
  await questionCreate(
    'Programmatically navigate using React router', // title
    'short sum', // summary
    'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.', // text
    [t1, t2], // tags
    [a1, a2], // answers
    u2, // asked_by
    false, // ask_date_time
    false // views
  );
  await questionCreate(
    'android studio save string shared preference', // title
    'short sum', // summary
    'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.', // text
    [t3, t4, t2], // tags (as strings)
    [a3, a4, a5], // answers (as strings)
    u1, // createdBy
    false, // isPublic
    121 // views
  );
  if(db) db.close();
  console.log('done');
}
populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');