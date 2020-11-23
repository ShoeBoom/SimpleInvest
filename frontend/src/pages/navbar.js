import React, { Component, useState } from "react";
import "../styles/style.css";
import firebase from "../firebase.js";
import "firebase/auth";
import { Redirect } from 'react-router';
import Logo from '../assets/logo.svg';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginStatus: false
    }
  }

  componentDidMount(){
    const isSignedOut = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({loginStatus: true});
      } else {
        this.setState({loginStatus: false});
      }
    })
    this.setState({loginStatus: isSignedOut});
  }

  logout() {
    firebase.auth().signOut().then();
  }

  render() {
    return (
        
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          {this.state.loginStatus ?
            <a className="navbar-item" href="/main">
              <img src={Logo} />
            </a>
            :
            <a className="navbar-item" href="/">
              <img src={Logo} />
            </a>
          }
        </div>
        {this.state.loginStatus ?
          <div id="navbarBasicExample" className="navbar-menu">
            <div className="navbar-start">
              <a className="navbar-item" href="/history">History</a>
              <a className="navbar-item" href="/transfer">Transfer</a>
              <a className="navbar-item" href="/account">Account</a>
            </div>

            <div className="navbar-end">
                <div className="navbar-item">
                    <a className="button is-light" onClick={ async () => {
                      await firebase.auth().signOut();
                      window.location.href = '/';
                      }}>
                      
                    <strong>Sign Out</strong>
                    </a>
                </div>
              </div>

          </div>
        :
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <a className="button is-info" href="signup">
                  <strong>Sign up</strong>
                  {/* <Redirect to="/signup"> </Redirect>  */}
                </a>
                <a className="button is-light" href="signin">Log in</a>
              </div>
            </div>
          </div>
        }
        
      </nav>
    );
  }
}

export default Navbar;
