import React, { Component } from "react";
import { Formik, Field, Form, useFormik } from "formik";
import Navbar from "./navbar.js";
import "../styles/style.css";
import firebase from "../firebase.js";
import axios from "axios";
import '@firebase/auth'
import "@firebase/firestore"

const validate = (values) => {
  const errors = {};

  if (!values.firstname) {
    errors.firstname = "Required";
  }
  if (!values.lastname) {
    errors.lastname = "Required";
  }
  if (!values.email) {
    errors.email = "Required";
  }
  if (!values.password) {
    errors.password = "Required";
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
  if (!values.initialdeposit) {
    errors.initialdeposit = "Required";
  }

  return errors;
};
const SignUp = () => {
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      age: "",
      retirementAge: "",
      mothlybudget: "",
      monthlyIncome: "",
      initialDeposit: "",
    },
    validate,
    onSubmit: (values) => {
      onRegister(values);
    },
  });
  
  async function onRegister(values) {
    console.log(values)
    try {
        await firebase.auth().createUserWithEmailAndPassword(values.email, values.password);
        const uid = firebase.auth().currentUser.uid;
        let array = {
          firstName: values.firstname,
          lastName: values.lastname,
          age: values.age,
          retirementAge: values.retirementage,
          monthlyBudget: values.monthlybudget,
          monthlyIncome: values.monthlyincome,
          initialDeposit: values.initialdeposit,
          uid: uid
        }
        axios.post('/api/initUser', {array})
        .then(() => {
          window.location.href = '/main';
        });
    } catch (error) {
        alert(error);
    }
  } 

  return (
    <div>
      <Navbar />
      <div className="hero is-fullheight-with-navbar is-pastelOrange">
        <div className="hero-body">
          <div className="container is-max-desktop signup-input">
            <div className="box">
              <h1 className="title has-text-dark">Sign Up</h1>
              <form onSubmit={formik.handleSubmit}>
                <div className="field">
                  <label htnlfor="label"> First Name</label>
                  <div className="control">
                    <input
                      id="firstname"
                      className="input"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.firstname}
                    ></input>
                    {formik.errors.firstname ? (
                      <div>{formik.errors.firstname}</div>
                    ) : null}
                  </div>
                </div>
                <div className="field">
                  <label htmlfor="label"> Last Name</label>
                  <div className="control">
                    <input
                      id="lastname"
                      className="input"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.lastname}
                    ></input>
                    {formik.errors.lastname ? (
                      <div>{formik.errors.lastname}</div>
                    ) : null}
                  </div>
                </div>
                <div className="field">
                  <label htmlfor="label">E-mail</label>
                  <p className="control has-icons-left">
                    <input
                      id="email"
                      className="input"
                      type="email"
                      onChange={formik.handleChange}
                      value={formik.values.email}
                    ></input>
                    {formik.errors.email ? (
                      <div>{formik.errors.email}</div>
                    ) : null}
                    <span className="icon is-small is-left">
                      <i className="fas fa-envelope"></i>
                    </span>
                  </p>
                </div>
                <div className="field">
                  <label htmlfor="label">Password</label>
                  <p class="control has-icons-left">
                    <input
                      id="password"
                      className="input"
                      type="password"
                      onChange={formik.handleChange}
                      value={formik.values.password}
                    ></input>
                    {formik.errors.password ? (
                      <div>{formik.errors.password}</div>
                    ) : null}
                    <span className="icon is-small is-left">
                      <i className="fas fa-lock"></i>
                    </span>
                  </p>
                </div>
                <div className="field">
                  <label htmlfor="label">Age</label>
                  <div className="control">
                    <input
                      id="age"
                      className="input"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.age}
                    ></input>
                    {formik.errors.age ? <div>{formik.errors.age}</div> : null}
                  </div>
                </div>
                <div className="field">
                  <label htmlfor="label">Retirement Age</label>
                  <div className="control">
                    <input
                      id="retirementage"
                      className="input"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.retirementage}
                    ></input>
                    {formik.errors.retirementage ? (
                      <div>{formik.errors.retirementage}</div>
                    ) : null}
                  </div>
                </div>
                <div className="field">
                  <label htmlfor="label">Monthly Budget</label>
                  <div className="control has-icons-left">
                    <input
                      id="monthlybudget"
                      className="input"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.monthlybudget}
                    ></input>
                     <span className="icon is-left">
                        <i className="fas fa-dollar-sign"></i>
                      </span>
                    {formik.errors.monthlybudget ? (
                      <div>{formik.errors.monthlybudget}</div>
                    ) : null}
                  </div>
                </div>
                <div className="field">
                  <label htmlfor="label">Monthly Income</label>
                  <div className="control has-icons-left">
                    <input
                      id="monthlyincome"
                      className="input"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.monthlyincome}
                    ></input>
                    <span className="icon is-left">
                        <i className="fas fa-dollar-sign"></i>
                      </span>
                    {formik.errors.monthlyincome ? (
                      <div>{formik.errors.monthlyincome}</div>
                    ) : null}
                  </div>
                </div>
                <div className="field">
                  <label htmlfor="label">Initial Deposit</label>
                  <div className="control has-icons-left">
                    <input
                      id="initialdeposit"
                      className="input"
                      tpye="text"
                      onChange={formik.handleChange}
                      value={formik.values.initialdeposit}
                    ></input>
                    <span className="icon is-left">
                        <i className="fas fa-dollar-sign"></i>
                      </span>
                    {formik.errors.initialdeposit ? (
                      <div>{formik.errors.initialdeposit}</div>
                    ) : null}
                  </div>
                </div>
                <div className="field">
                  <div className="control">
                    <label className="checkbox">
                      <input type="checkbox" />
                      <span>
                        {" "}
                        I agree to the <a href="#">terms and conditions</a>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-info">Submit</button>
                  </div>
                  <div className="control">
                    <a className="button is-link is-light" href="/">Cancel</a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
