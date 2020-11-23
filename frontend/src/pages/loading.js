import React, { Component } from 'react';
import '../styles/style.css'
import pictureloading from '../assets/image.gif';
class Loading extends Component {
    render() {
      return (
        <div className="hero is-fullheight-with-navbar is-pastelPink">
            <div className="hero-body">
                <div className="container is-max-desktop signup-input index-column">
                  <img src={pictureloading}  />
                </div>
            </div>
      </div>
      );
    }
}  
export default Loading;