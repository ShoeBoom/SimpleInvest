// shows current gain/losses, amount of money is stocks/cash, holdings (hardcode the only holding to be S&P 500)

//MAIN AREA SHOWS, HOW MUCH THE USER HAS IN BONDS, CASH, AND STOCKS. THEN IT SHOWS HOW MUCH THEY MADE OR LOST THAT WEEK
//CAN CLICK DEPOSIT/WITHDRAW MONEY BUTTON
//ACCOUNT AREA
//First Name, Last Name, Email, Password, Age, Retirement Age, Monthly Budget, Monthly Income
//GET AND UPDATE

import React, { Component } from 'react';
import Navbar from './navbar.js';
import Loading from './loading.js';
import '../styles/style.css'
import Rocket from '../assets/rocket.gif';
import axios from 'axios';
import firebase from "../firebase.js";
import "@firebase/firestore";
import '@firebase/auth';
import Chart from "./chart";
class Main extends Component {
    constructor(props) {
        super();
        this.state = {
            amount: {
                GOVT: "1234",
                cash: "5678",
                SPY: "90",
                lastRebalanced: ''
            },
            user: {
                fName: "John",
                lName: "Smith"
            },
            loading: true,
            percentChange: '',
            displayBonds: true
        }
    }

    componentDidMount() {
        let currentComponent = this;
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                let uid = firebase.auth().currentUser.uid;
                axios.post('/api/portfolio', { uid })
                    .then((res) => {
                        currentComponent.setState({ amount: res.data });
                    });
                axios.post('/api/networthHistory', { uid })
                    .then((res) => {
                        console.log(res.data);
                        let oldestPrice = res.data[res.data.length - 1].price;
                        let newestPrice = res.data[0].price
                        let price = ((newestPrice - oldestPrice)/oldestPrice)*100;
                        price = Math.round((price + Number.EPSILON) * 100) / 100;
                        currentComponent.setState({percentChange: price});
                    });
                
                const database = firebase.firestore().collection('userData');
                let info = database.doc(firebase.auth().currentUser.uid).get()
                    .then((doc) => {
                        let data = doc.data();
                        let localData = {
                            fName: data.firstName,
                            lName: data.lastName
                        }
                        currentComponent.setState({ user: localData });
                    });

            } else {
                console.log("You're not signed in and shouldn't be here!!");
            }
        });
        const timer = setTimeout(() => {
            this.setState({ loading: false });
        }, 2000);
    }

    displayBox(item){
        document.getElementById("hoverbox").style.display = "block";
        if(item === "bonds"){
            this.setState({displayBonds: true});
        }
        else {
            this.setState({displayBonds: false});
        }
    }

    hideBox(){
        document.getElementById("hoverbox").style.display = "none";
    }

    render() {
        return (
            <div>
                <Navbar />
                {this.state.loading ?
                    <Loading />
                    :
                    <div className="hero is-fullheight-with-navbar is-pastelYellow">
                        <div className="hero-body">
                            <div className="container">
                                <p className="is-size-1">Welcome, {this.state.user.fName} {this.state.user.lName}.</p>
                                <div className="main-flex">
                                    <p className="title">This week, your stocks have increased {this.state.percentChange}%.</p>
                                    <img src={Rocket} height="75px" width="75px" />
                                </div>
                                <p className="subtitle">Currently, you have ${this.state.amount.GOVT} in <span onMouseEnter={() => {this.displayBox('bonds')}}><strong>Bonds</strong></span>, ${this.state.amount.SPY} in <span onMouseEnter={() => {this.displayBox('stocks')}}><strong>stocks</strong></span>, and ${this.state.amount.cash} in <strong>cash</strong>.</p>
                                <p className="subtitle">Your <strong>portfolio</strong> was last <strong>rebalanced</strong> on {new Date(this.state.amount.lastRebalanced._seconds * 1000).toString()}.</p>
                                <HoverBox hideBox={this.hideBox.bind(this)} bonds={this.state.displayBonds} />
                                <p>
                                    <a className="href" href="/history">View your transfer history.</a>
                                </p>
                                <p>
                                    <a className="href" href="/transfer">Add or remove money to your portfolio.</a>
                                </p>
                                <p>
                                    <a className="href" href="/account">View and edit account details.</a>
                                </p>
                                <div className="index-column" style={{marginTop: "50px"}}>
                                    <Chart uid={firebase.auth().currentUser.uid} width={730} height={250} />
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Main;

class HoverBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            GOVT: '',
            SPY: ''
        }
    }
    
    componentDidMount(){
        let currentComponent = this;
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                let uid = firebase.auth().currentUser.uid;
                axios.post('/api/portfolioHoldings', { uid })
                    .then((res) => {
                        currentComponent.setState(res.data);
                    });
            } else {
                console.log("You're not signed in and shouldn't be here!!");
            }
        });
    }

    render() {
        return (
            <div id="hoverbox" style={{display: "none"}}>
                {this.props.bonds ? 
                    <div className="box">
                        <div className="index-row">
                            <p className="subtitle" style={{marginBottom: "0"}}>Bonds</p>
                            <button className="delete" aria-label="delete" onClick={() => {this.props.hideBox()}}></button>
                        </div>
                        <div>
                            <p>GOVT: {this.state.GOVT} shares</p>
                        </div>
                    </div>
                :
                    <div className="box">
                        <div className="index-row">
                            <p className="subtitle" style={{marginBottom: "0"}}>Stocks</p>
                            <button className="delete" aria-label="delete" onClick={() => {this.props.hideBox()}}></button>
                        </div>
                        <div>
                            <p>SPY: {this.state.SPY} shares</p>
                            <p>1. Apple (AAPL) 6.5%<br />
                                2. Microsoft (MSFT) 5.7%<br />
                                3. Amazon (AMZN) 4.8%<br />
                                4. Facebook (FB) 2.3%<br />
                                5. Alphabet Inc Class A Shares (GOOGL) 1.8%<br />
                                6. Alphabet Inc Class C Shares (GOOG) 1.8%<br />
                                7. Berkshire Hathaway Inc (BRK.B) 1.5%<br />
                                8. Johnson and Johnson (JNJ) 1.3%<br />
                                9. Procter and Gamble (PG) 1.3% <br />
                                10. Nvidia Corp (NVDA) 1.1%<br />
                            </p>
                        </div>
                    </div>
                }
            </div>
        );
    }
}