import React, { useState, useEffect } from 'react';
import { formik, field, form, useFormik } from "formik";
import Navbar from './navbar.js';
import Loading from './loading.js';
import '../styles/style.css'
import firebase from "../firebase.js";
import "@firebase/firestore"
import '@firebase/auth'

export default function Account(){
    const [data, setData] = useState({
        fName: "",
        lName: "",
        email: "",
        age: "",
        retirement: "",
        budget: "",
        income: ""});
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);

    const validate = (values) => {
        const errors = {};
      
        if (!values.firstname) {
          errors.firstname = "Required";
        }
        if (!values.lastname) {
          errors.lastname = "Required";
        }
        if (!values.age) {
          errors.age = "Required";
        }
        if (!values.retirementage) {
          errors.retirementage = "Required";
        }
        if (!values.monthlybudget) {
          errors.monthlybudget = "Required";
        }
        if (!values.monthlyincome) {
          errors.monthlyincome = "Required";
        }
        return errors;
    };

    async function onUpdate(values) {
        console.log(values)
        try {
            const uid = firebase.auth().currentUser.uid;
            await firebase.firestore().collection("userData").doc(uid).update({
                firstName: values.firstname,
                lastName: values.lastname,
                age: values.age,
                retirementAge: values.retirementage,
                monthlyBudget: values.monthlybudget,
                monthlyIncome: values.monthlyincome,
                uid: uid,
            });
            window.location.href = window.location.href;
        } catch (error) {
            alert(error);
        }
    } 

    const formik = useFormik({
        initialValues: {
          firstname: "",
          lastname: "",
          age: "",
          retirementage: "",
          monthlybudget: "",
          monthlyincome: "",
        },
        validate,
        onSubmit: values => {
            console.log("hello");
          onUpdate(values);
        },
    });

    useEffect(() => {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                let email = firebase.auth().currentUser.email;
                const database = firebase.firestore().collection('userData');
                database.doc(firebase.auth().currentUser.uid).get()
                .then((doc) => {
                    let data = doc.data();
                    let localData = {
                        fName: data.firstName,
                        lName: data.lastName,
                        email: email,
                        age: data.age,
                        retirement: data.retirementAge,
                        budget: data.monthlyBudget,
                        income: data.monthlyIncome
                    }
                    setData(localData);
                    formik.values.firstname = localData.ffName;
                });
            } else {
                console.log("You're not signed in and shouldn't be here!!");
            }
        });
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        
    }, []);
    

    return (
      <div>
        <Navbar />
        {loading ? 
            <Loading />
        :
        <div className="hero is-fullheight-with-navbar is-pastelYellow">
            <div className="hero-body">
                <div className="container is-max-desktop signup-input">
                    <div className="box">
                        {status ?
                            <div className="account">
                            <h1 className="title has-text-dark">Account Infomation</h1>
                                <form onSubmit={formik.handleSubmit}>
                                    <div className="account-flex flex">
                                        <p className="has-text-weight-medium">First name: </p>
                                        <div className="field ml-20">
                                            <div className="control">
                                                <input
                                                    id="firstname"
                                                    className="input"
                                                    type="text"
                                                    onChange={formik.handleChange}
                                                    value={formik.values.firstname}
                                                    placeholder={data.fName}>
                                                </input>
                                                {formik.errors.firstname ? (
                                                    <div>{formik.errors.firstname}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="account-flex flex">
                                        <p className="has-text-weight-medium">Last name: </p>
                                        <div className="field ml-20">
                                            <div className="control">
                                                <input
                                                    id="lastname"
                                                    className="input"
                                                    type="text"
                                                    onChange={formik.handleChange}
                                                    value={formik.values.lastname}
                                                    placeholder={data.lName}>
                                                </input>
                                                {formik.errors.lastname ? (
                                                    <div>{formik.errors.lastname}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="account-flex flex">
                                        <p className="has-text-weight-medium">Email: </p>
                                        <div className="field ml-20">
                                            <div className="control">
                                                <input
                                                    id="lastname"
                                                    className="input"
                                                    type="text"
                                                    value={data.email}
                                                    disabled>
                                                </input>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="account-flex flex">
                                        <p className="has-text-weight-medium">Age: </p>
                                        <div className="field ml-20">
                                            <div className="control">
                                                <input
                                                    id="age"
                                                    className="input"
                                                    type="text"
                                                    onChange={formik.handleChange}
                                                    value={formik.values.age}
                                                    placeholder={data.age}>
                                                </input>
                                                {formik.errors.age ? (
                                                    <div>{formik.errors.age}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="account-flex flex">
                                        <p className="has-text-weight-medium">Retirement Age: </p>
                                        <div className="field ml-20">
                                            <div className="control">
                                                <input
                                                    id="retirementage"
                                                    className="input"
                                                    type="text"
                                                    onChange={formik.handleChange}
                                                    value={formik.values.retirementage}
                                                    placeholder={data.retirement}>
                                                </input>
                                                {formik.errors.retirementage ? (
                                                    <div>{formik.errors.retirementage}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="account-flex flex">
                                        <p className="has-text-weight-medium">Monthly Budget: </p>
                                        <div className="field ml-20">
                                            <div className="control">
                                                <input
                                                    id="monthlybudget"
                                                    className="input"
                                                    type="text"
                                                    onChange={formik.handleChange}
                                                    value={formik.values.monthlybudget}
                                                    placeholder={'$'.concat(data.budget)}>
                                                </input>
                                                {formik.errors.monthlybudget ? (
                                                    <div>{formik.errors.monthlybudget}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="account-flex flex">
                                        <p className="has-text-weight-medium">Monthly Income: </p>
                                        <div className="field ml-20">
                                            <div className="control">
                                                <input
                                                    id="monthlyincome"
                                                    className="input"
                                                    type="text"
                                                    onChange={formik.handleChange}
                                                    value={formik.values.monthlyincome}
                                                    placeholder={'$'.concat(data.income)}>
                                                </input>
                                                {formik.errors.monthlyincome ? (
                                                    <div>{formik.errors.monthlyincome}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="field is-grouped">
                                        <div className="control">
                                            <button className="button is-info" type="submit">Save</button>
                                        </div>
                                        <div className="control">
                                            <a className="button is-link is-light" href="/account">Cancel</a>
                                        </div>
                                    </div> 
                                </form>
                            </div>
                            :
                            <div>
                                <h1 className="title has-text-dark">Account Infomation</h1>
                                <p className="has-text-weight-medium">Name: 
                                    <span 
                                        className="has-text-weight-normal"> {data.fName} {data.lName}
                                    </span>
                                </p>
                                <p className="has-text-weight-medium">Email: 
                                    <span 
                                        className="has-text-weight-normal"> {data.email} 
                                    </span>
                                </p>
                                <p className="has-text-weight-medium">Age:
                                    <span 
                                        className="has-text-weight-normal"> {data.age} 
                                    </span>
                                </p>
                                <p className="has-text-weight-medium">Retirement Age: 
                                    <span 
                                        className="has-text-weight-normal"> {data.retirement} 
                                    </span>
                                </p>
                                <p className="has-text-weight-medium">Monthly Budget: 
                                    <span 
                                        className="has-text-weight-normal"> ${data.budget}
                                    </span>
                                </p>
                                <p className="has-text-weight-medium mb-20">Monthly Income: 
                                    <span 
                                        className="has-text-weight-normal"> ${data.income}
                                    </span>
                                </p>
                                <div className="field is-grouped">
                                    <div className="control">
                                        <button className="button is-info" onClick={() => {setStatus(true)}}>Edit</button>
                                    </div>
                                    <div className="control">
                                        <a className="button is-link is-light" href="/main">Cancel</a>
                                    </div>
                                </div> 
                            </div> 
                        }
                    </div>
                </div>
            </div>
        </div>
        }
      </div>
    );   
}



                                                                                                                                                                                                                                                                                                                          


