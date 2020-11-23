const express = require('express')
const path = require('path');
var cors = require('cors');
const bodyParser = require('body-parser').json()
const { admin, firestore, auth } = require("./firebase")
const { generateStockPortfolio, getCurrentNetWorth, rebalancePortfolio } = require("./caclulator")
const {addTransaction} = require("./serverUtils")
// 
const cron = require('node-cron');

const app = express();

// cron.schedule('0 0 16 * * 1-5', async  () => {
// 	let users = await firestore.collection("userData").get();
// 	let prom = []
// 	users.forEach( async (data) => {
// 		const uid = data.data().uid
// 		const networth = await getCurrentNetWorth(uid)
// 		prom.push(firestore.collection("dataovertime").add({
// 			uid: uid,
// 			price: networth,
// 			timestamp: admin.firestore.FieldValue.serverTimestamp()
// 		}))
// 	})

// 	await Promise.all(prom);
// }, {
// 	scheduled: true,
// 	timezone: "America/New_York"
// });

app.use(cors());
// call this after user does the quiz
// sets user data
// request example: 
// {
//     uid: /* user id from client  */,
//     age: /* user age */,
//     retirementAge: /* user retirement Age */,
//     monthlyBudget: /* user monthly Budget */,
//     monthlyIncome: /* user monthly Income */,
//     initialDeposit: /* user net Worth */,
// }
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
	console.log(portfolio)
	const setPortfolio = firestore.collection("portfolio").doc(uid).set({
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

// {
// 		uid: user id
// }
app.post("/api/networth", bodyParser, async (req, res) => {
	const uid = req.body.uid;
	const netWorth = await getCurrentNetWorth(uid);
	res.send({
		networth: netWorth
	})
})

app.post("/api/networthHistory", bodyParser, async (req, res) => {
	const uid = req.body.uid;
	console.log(req.body);
	
	const netWorth = await getCurrentNetWorth(uid);
	const data = await firestore.collection("dataovertime").where("uid", "==", uid).limit(4).orderBy('timestamp','desc').get();

	let return_res = [{price: netWorth}]

	data.forEach( data => {
		return_res.push(data.data())
	})

	res.send(return_res)
})



// {
// 		uid: user id,
// 		amount: amount dpo
// }
app.post("/api/deposit", bodyParser, async (req, res) => {
	console.log(req.body.amount)
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
app.get("/api/netDeposits", bodyParser, async (req, res) => {
	const uid = req.body.uid;

	const UserData = (await firestore.collection("userData").doc(uid).get()).data()
	
	res.send({
		netDeposits: UserData.totalDeposits
	})
})

// {
// 		uid: user id
// }
app.post("/api/portfolio", bodyParser, async (req, res) => {
	const uid = req.body.uid;
	const portfolio =  (await firestore.collection("portfolio").doc(uid).get()).data()
	let data = {
		SPY: Math.round(((portfolio.SPY * 355.33) + Number.EPSILON) * 100) / 100,
		GOVT: Math.round(((portfolio.GOVT * 27.77) + Number.EPSILON) * 100) / 100,
		cash: Math.round((portfolio.cash + Number.EPSILON) * 100) / 100,
		lastRebalanced: portfolio.lastRebalanced
	}
	res.send(data);
})

app.post("/api/portfolioHoldings", bodyParser, async (req, res) => {
	const uid = req.body.uid;
	const portfolio =  (await firestore.collection("portfolio").doc(uid).get()).data()
	let data = {
		SPY: portfolio.SPY,
		GOVT: portfolio.GOVT
	}
	res.send(data);
})


// {
// 		uid: user id
// }
app.post("/api/history", bodyParser, async (req, res) => {
	const uid = req.body.uid;
	let history = [];
	const data = await firestore.collection("transactions").where("uid", "==", uid).limit(10).orderBy('date','desc').get();
	console.log(data.empty)
	data.forEach(data => {
		history.push(data.data())
	})
	res.send(history);
})

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname + '/../frontend/build/index.html'));
});

module.exports = app;