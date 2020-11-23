import React, { Component } from 'react';
import { Formik, Field, Form, useFormik } from 'formik';
import Navbar from './navbar.js';
import '../styles/style.css'
import firebase from "../firebase.js";
import '@firebase/auth'

const validate = values => {
  const errors = {};

  if (!values.email) {
    errors.email = 'Required';
  }

  if (!values.password) {
    errors.password = 'Required';
  } 

  return errors;
};

    
const SignIn = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate,
    onSubmit: values => {
      login(values);
    },
  });
  async function login(values) {
    try {
      await firebase.auth().signInWithEmailAndPassword(values.email, values.password);
      window.location.href = '/main';
    } catch (error) {
      alert("Incorrect Password or Username!")
    }
  }
  return (
    <div>
      <Navbar />
      <div className="hero is-fullheight-with-navbar is-pastelBlue">
        <div className="hero-body">
          <div className="container is-max-desktop signin-input">
            <div className="box">
            <h1 className="title has-text-dark">Sign In</h1> 
            <form onSubmit={formik.handleSubmit}>
              <div class="field">
                <label htmlFor="email">Email</label>
                  <p class="control has-icons-left has-icons-right">
                    <input 
                      id="email"
                      class="input" 
                      type="email" 
                      placeholder="E-mail" 
                      onChange={formik.handleChange}
                      value={formik.values.email}>
                    </input>
                    {formik.errors.email ? <div>{formik.errors.email}</div> : null}
                    <span class="icon is-small is-left">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <span class="icon is-small is-right">
                      <i class="fas fa-check"></i>
                    </span>
                  </p>
                </div>
                <div class="field">
                  <label htmlFor="password">Password</label>
                    <p class="control has-icons-left">
                        <input 
                          id="password"
                          class="input" 
                          type="password" 
                          placeholder="Password"
                          onChange={formik.handleChange}
                          value={formik.values.password}>
                        </input>
                        {formik.errors.password ? <div>{formik.errors.password}</div> : null}
                        <span class="icon is-small is-left">
                            <i class="fas fa-lock"></i>
                        </span>
                    </p>
                </div>
                <div class="field is-grouped">
                    <div class="control"> 
                        <button class= "button is-info">
                            Log in
                        </button>
                      </div>
                    <div class="control">
                        <a class="button is-dark is-outlined" href="/signup">
                            Sign up
                        </a>
                    </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;