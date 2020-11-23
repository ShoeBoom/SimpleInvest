// withdraw/deposit more money

import React, { Component } from 'react';
import Navbar from './navbar.js';
import Loading from './loading.js';
import '../styles/style.css'
import axios from "axios";
import firebase from "../firebase.js";
import "@firebase/firestore"
import '@firebase/auth'

class Transfer extends Component {
    constructor(props) {
      super();
      this.state = {
          action: "Deposit",
          amount: "10000",
          loading: true
      }
    }

    changeAction(action){
        switch(action){
            case "deposit":
                this.setState({action: "Deposit"});
                break;
            case "withdraw":
                this.setState({action: "Withdraw"});
                break;
            default:
                console.log("Switch statement in transfer.js is broken!");
                break;
        }
    }

    handleMoney(amount){
        let action = this.state.action;
        let uid = firebase.auth().currentUser.uid;
        console.log(amount);
        if(action === "Deposit"){
            //DEPOSIT MONEY HERE
            axios.post('/api/deposit', {amount: amount, uid: uid})
            .then(() => {
                alert("Thanks for depositing money!");
                window.location.href = '/history';
            });
        }
        else{
            //WITHDRAW MONEY HERE
            axios.post('/api/withdraw', {amount: amount, uid: uid})
            .then(() => {
                alert("Thanks for withdrawing money!");
                window.location.href = '/history';
            });
        }
    }

    componentDidMount(){
        let currentComponent = this;
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                let uid = firebase.auth().currentUser.uid;
                axios.post('/api/portfolio', {uid})
                .then((res) => {
                    let total = res.data.GOVT + res.data.cash + res.data.SPY;
                    currentComponent.setState({amount: total});
                });
            } else {
                console.log("You're not signed in and shouldn't be here!!");
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
        <div className="hero is-fullheight-with-navbar is-pastelGreen">
            <div className="hero-head">
                <div className="container">
                    <nav className="level" id="transfer-nav">
                        <div className="level-left">
                            <div className="level-item">
                                <p className="title">{this.state.action}</p>
                            </div>
                        </div>
                        <div class="level-right">
                            <div className="level-item">
                                <div class="field has-addons">
                                    <p class="control">
                                        <button class="button" onClick={() => this.changeAction("deposit")}>
                                        <span class="icon is-small">
                                            <i class="fas fa-coins"></i>
                                        </span>
                                        <span>Deposit</span>
                                        </button>
                                    </p>
                                    <p class="control">
                                        <button class="button" onClick={() => this.changeAction("withdraw")}>
                                        <span class="icon is-small">
                                            <i class="fas fa-wallet"></i>
                                        </span>
                                        <span>Withdraw</span>
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </nav>
                
                </div>
                

            </div>
            <div className="hero-body">
                <div className="container" id="transfer-body">
                    <p className="subtitle">Monetary Amount:</p>
                    <div className="field is-grouped">
                        <div className="control has-icons-left">
                            <input className="input is-medium" type="text" placeholder="Monetary Amount" id="amount" />
                            <span className="icon is-left">
                                <i className="fas fa-dollar-sign"></i>
                            </span>
                        </div>
                        <p className="control">
                            <button className="button is-dark is-medium" onClick={() => this.handleMoney(document.getElementById("amount").value)}>
                                Submit
                            </button>
                        </p>
                    </div>
                    <p className="subtitle">Current Amount in Account: ${this.state.amount}</p>
                </div>
            </div>
        </div>
        }   
      </div>
      );
    }
}
  
export default Transfer;