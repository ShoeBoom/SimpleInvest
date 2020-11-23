// show history of transations
import React, { Component } from "react";
import Navbar from "./navbar.js";
import Loading from './loading.js';
import "../styles/style.css";
import axios from "axios";
import firebase from "../firebase.js";
import "@firebase/firestore";
import "@firebase/auth";
class History extends Component {
  constructor(props) {
    super();
    this.state = {
      Data: [],
      loading: true
    };
  }

  componentDidMount() {
    let currentComponent = this;
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        let uid = user.uid;
        axios
          .post(`/api/history`, { uid: uid })
          .then((res) => {
            let data = res.data;
            currentComponent.setState({ Data: res.data });
            console.log(res.data);
          });
      } else {
        alert("You're not signed in and shouldn't be here!!");
      }
    });
    const timer = setTimeout(() => {
      this.setState({loading: false});
    }, 2000);
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.state.loading ?
            <Loading />
        :
        <div className="hero is-fullheight-with-navbar is-pastelBlue">
          <div className="hero-body history-container">
            {this.state.Data.map((data) => (
              <div className="card history-card">
                <div class="card-content">
                  <div class="content">
                    <p className="has-text-weight-medium">
                      Type: &nbsp;
                      <span className="has-text-weight-normal">
                        {data.type}
                      </span>
                    </p>

                    <p className="has-text-weight-medium">
                      Amount: &nbsp;$
                      <span className="has-text-weight-normal">
                        {data.amount}
                      </span>
                    </p>

                    <p className="has-text-weight-medium">
                        Date: &nbsp;
                        <span className="has-text-weight-normal">
                          {new Date(data.date._seconds * 1000).toString()}
                        </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        } 
      </div>
    );
  }
}

export default History;
