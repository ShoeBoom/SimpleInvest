import React, { useState, useEffect } from 'react';
import { formik, field, form, useFormik } from "formik";
import Navbar from './navbar.js';
import Loading from './loading.js';
import '../styles/style.css'
import firebase from "../firebase.js";
import "@firebase/firestore"
import '@firebase/auth'
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts";
import axios from 'axios';

const Chart = ({uid,width, height}) => {
    const [data, setData] = useState([])
    useEffect(() => {
        axios.get(`/api/networthHistory?uid=${uid}`).then( (res) => {
            console.log(res)
            let r = []
            let i = 0;
            res.data.slice().reverse().forEach(data => {
                r.push({
                    index: `${5-i} days ago`,
                    price: data.price
                })
                i++;
            })
            r.at(-2).index = "1 day ago"
            r.at(-1).index = "Today"

            setData(r)
        }) 
    }, []);

    if (data.length !== 0){
        return (
            <AreaChart width={width} height={height} data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="index" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
        )
    }else {
        return (<> </>)
    }
} 

export default Chart;