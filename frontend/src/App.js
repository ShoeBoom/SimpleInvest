import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
 } from 'react-router-dom';
import Home from './pages/index.js';
import SignUp from './pages/signup.js';
import Transfer from './pages/transfer.js';
import SignIn from "./pages/signin.js";
import Main from "./pages/main.js";
import History from "./pages/history.js";
import Account from "./pages/account.js";
import firebase from "./firebase.js";
import "@firebase/firestore";
import '@firebase/auth';


class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/signin">
            <SignIn />
          </Route>
          <Route path="/transfer">
            
              <Transfer />
            
          </Route>
          <Route path="/main">
            
              <Main />
            
          </Route>
          <Route path="/history">
            
              <History />
            
          </Route>
          <Route path="/account">
              <Account />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;


          