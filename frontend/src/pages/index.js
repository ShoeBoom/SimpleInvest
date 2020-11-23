// main page. has infor for new customers

import React, { Component } from 'react';
import Navbar from './navbar.js';
import '../styles/style.css'
import Bulb from '../assets/bulb.gif';

class Home extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
      <div>
        <Navbar />
        <div className="hero is-fullheight-with-navbar home-bg">
          <div className="hero-body">
            <div className="container is-max-desktop index-input">
              <div className="box index-column">
                <div className="index-row">
                  <img src={Bulb} height="100px" width="100px" />
                  <p className="is-size-1 has-text-dark has-text-weight-bold"> 
                    Simply Invest
                  </p>
                  <img src={Bulb} height="100px" width="100px" />
                </div>
                <p className="is-size-4 has-text-dark has-text-weight-light mb-20">
                  Personal finance made simple.
                </p>
                <div class="field is-grouped">
                    <div className="control">
                        <a className="button is-warning" href="/signup">
                            Get Started
                        </a>
                    </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
}
  
export default Home;