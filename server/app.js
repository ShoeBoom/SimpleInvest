const express = require('express')
const path = require('path');
var cors = require('cors');
const bodyParser = require('body-parser').json()
const { admin, firestore, auth } = require("./firebase")
const { generateStockPortfolio, getCurrentNetWorth, rebalancePortfolio, getStockPrice, getStockPrice5DaysAgo } = require("./caclulator")
const {addTransaction} = require("./serverUtils")
// 
const cron = require('node-cron');

const app = express();

app.use(express.static(path.join(__dirname, '/../frontend/build')));

app.post("/api/initUser", bodyParser, async (req, res) => {
	const uid = req.body.array.uid; 

	const firstname = req.body.array.firstName;
	const lastname = req.body.array.lastName;

	const age = parseInt(req.body.array.age);
	const retirementAge = parseInt(req.body.array.retirementAge);
	const monthlyBudget = parseInt(req.body.array.monthlyBudget);
	const monthlyIncome = parseInt(req.body.array.monthlyIncome);
	const netWorth = parseFloat(req.body.array.initialDeposit);

	const setUserData = firestore.collection('userData').doc(uid).set({
		firstName: firstname,
		lastName: lastname,
		age: age,
		retirementAge: retirementAge,
		monthlyBudget: monthlyBudget,
		monthlyIncome: monthlyIncome,
		totalDeposits: netWorth
	});
	

	const portfolio = await generateStockPortfolio(age, retirementAge, monthlyBudget, netWorth);

	const setPortfolio = firestore.collection("portfolio").doc(uid).set({
		SPY: portfolio.SPY,
		GOVT: portfolio.GOVT,
		cash: portfolio.cash,
		lastRebalanced: admin.firestore.FieldValue.serverTimestamp()
	})

	await firestore.collection("portfolio").doc(uid).collection("history").add({
        SPY: portfolio.SPY,
        GOVT: portfolio.GOVT,
        cash: portfolio.cash,
        lastRebalanced: admin.firestore.FieldValue.serverTimestamp()
    })

	const setTransaction =  addTransaction(uid, netWorth)

	Promise.all([setUserData, setPortfolio, setTransaction])
	res.send({
		success: true
	})
})

app.get("/api/networthHistory", async (req, res) => {
	const uid = req.query.uid;

	
	const netWorth = await getCurrentNetWorth(uid);
	const lastDate = new Date(Date.now() - 864e5*6);
	lastDate.setHours(0,0,0,0);
	const data = await firestore.collection("portfolio").doc(uid)
					.collection("history")
					.where("lastRebalanced", ">", lastDate)
					.orderBy("lastRebalanced", "desc")
					.get()
					.then(snapshot => snapshot.docs.map(doc => doc.data()));

	const start_data = await firestore.collection("portfolio").doc(uid)
					.collection("history")
					.where("lastRebalanced", "<", lastDate)
					.orderBy("lastRebalanced", "desc")
					.limit(1)
					.get()
					.then(snapshot => snapshot.docs.map(doc => doc.data()));
	

	data.push(start_data[0]);

	const [prices_spy, prices_govt] = await Promise.all([
		getStockPrice5DaysAgo("SPY"),
		getStockPrice5DaysAgo("GOVT")
	])
	console.log(prices_spy)

	let return_res = []
	prices_spy.forEach( (price_spy, i) => {
		const price_govt = prices_govt[i];
		const date = new Date(Date.now() - 864e5*i)
		date.setHours(0,0,0,0)

		const last_valid_portfolio = data.reverse().find(v => v.lastRebalanced <= date);

		if(last_valid_portfolio) {
			return_res.push({
				price: last_valid_portfolio.SPY * price_spy + last_valid_portfolio.GOVT * price_govt + last_valid_portfolio.cash,
				date: date
			});
		} else {
			return_res.push({
				price: 0,
				date: date
			});
		}
	})
	return_res.push({price: netWorth})
	

	res.send(return_res.reverse())
})



// {
// 		uid: user id,
// 		amount: amount dpo
// }
app.post("/api/deposit", bodyParser, async (req, res) => {
	const uid = req.body.uid;
	const amount = parseFloat(req.body.amount)
	const setUserData = firestore.collection("userData").doc(uid).update({totalDeposits: admin.firestore.FieldValue.increment(amount)})

	const netWorth = (await getCurrentNetWorth(uid)) + amount;

	await addTransaction(uid, amount)

	await rebalancePortfolio(uid, netWorth);
	
	res.send({
		networth: netWorth
	})
})


// {
// 		uid: user id,
// 		amount: amount dpo
// }
app.post("/api/withdraw", bodyParser, async (req, res) => {
	const uid = req.body.uid;
	const amount = parseFloat(req.body.amount)
	const setUserData = firestore.collection("userData").doc(uid).update({totalDeposits: admin.firestore.FieldValue.increment(-amount)})

	const netWorth = (await getCurrentNetWorth(uid)) - amount;

	await addTransaction(uid, -amount);
	await rebalancePortfolio(uid, netWorth);
	
	res.send({
		networth: netWorth
	})
})

// {
// 		uid: user id
// }
app.get("/api/portfolio", async (req, res) => {
	const uid = req.query.uid;
	const [portfolio, spyprice, govtprice]= await Promise.all([
        firestore.collection("portfolio").doc(uid).get().then(res => res.data()),
        getStockPrice("SPY"),
        getStockPrice("GOVT")
    ])
	
	let data = {
		SPY: Math.round(((portfolio.SPY * spyprice) + Number.EPSILON) * 100) / 100,
		GOVT: Math.round(((portfolio.GOVT * govtprice) + Number.EPSILON) * 100) / 100,
		cash: Math.round((portfolio.cash + Number.EPSILON) * 100) / 100,
		lastRebalanced: portfolio.lastRebalanced
	}
	res.send(data);
})

app.get("/api/portfolioHoldings", async (req, res) => {
	const uid = req.query.uid;
	const portfolio =  (await firestore.collection("portfolio").doc(uid).get()).data()
	let data = {
		SPY: portfolio.SPY,
		GOVT: portfolio.GOVT,
		cash: portfolio.cash
	}
	res.send(data);
})

// {
// 		uid: user id
// }
app.get("/api/history", async (req, res) => {
	const uid = req.query.uid;
	let history = [];
	const data = await firestore.collection("transactions").where("uid", "==", uid).limit(10).orderBy('date','desc').get();

	data.forEach(data => {
		history.push(data.data())
	})
	res.send(history);
})

app.get("/api/rebalance", async (req, res) => {
	const netWorth = (await getCurrentNetWorth(req.query.uid))
	await rebalancePortfolio(req.query.uid, netWorth);
	res.send("Success");
})

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname + '/../frontend/build/index.html'));
});

module.exports = app;