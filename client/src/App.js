// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
// import FakeStackOverflow from './components/fakestackoverflow.js'
import MainPage from './components/MainPage.js'
import axios from 'axios';
// console.log(m.questions);

axios.defaults.withCredentials = true;

function App() {
  return (
    <div id="page">
    <MainPage/>
    </div>
  );
}



export default App;