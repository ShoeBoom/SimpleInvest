const { admin, firestore, auth } = require("./firebase")
const axios = require('axios').default;

STOCK_API_KEY = process.env.STOCK_API_KEY;

function generateCashStockRatio(age, retirementAge, monthlyBudget, netWorth) {
    const emergencyFundMin = monthlyBudget * 6;
    if (netWorth <= emergencyFundMin) {
        console.log(`networth less than min emergency funds`)
        return {
            stock: 0.0,
            bonds: 1.0
        }
    }
    const amount_rem = netWorth - emergencyFundMin;
    const yearsRemaining = retirementAge - age;
    
    let stockRatio = 0.0;
    if (yearsRemaining <= 5) {
        stockRatio = (amount_rem * yearsRemaining) / (netWorth * 5)
    } else {
        stockRatio = amount_rem*1.0 / netWorth;
    }

    return {
        stock: stockRatio,
        bonds: 1 - stockRatio
    }
}

async function getStockPrice(stockSymbol){
    const res = await axios.get(`http://api.marketstack.com/v1/eod?access_key=${STOCK_API_KEY}&symbols=${stockSymbol}&date_from=${new Date(Date.now() - 864e5).toISOString().replace(/T.*/,'')}`);

    const data = res.data.data
    console.log(`Price of ${stockSymbol} : ${data[data.length -1].close}`)
    return parseFloat(data[data.length -1].close)
}

exports.getStockPrice = getStockPrice;

async function getStockPrice5DaysAgo(stockSymbol){
    const res = await axios.get(`http://api.marketstack.com/v1/eod?access_key=${STOCK_API_KEY}&symbols=${stockSymbol}&date_from=${new Date(Date.now() - 864e5 * 6).toISOString().replace(/T.*/,'')}`);

    const data = res.data.data
    console.log(`Price of ${stockSymbol} : ${data[data.length -1].close}`)
    return data.map(v=> parseFloat(v.close)).reverse()
}

exports.getStockPrice5DaysAgo = getStockPrice5DaysAgo;

exports.generateStockPortfolio = async (age, retirementAge, monthlyBudget, netWorth) => {
    const ratio = generateCashStockRatio(age, retirementAge, monthlyBudget, netWorth);
    
    const spyPrice = await getStockPrice("SPY");

    let investmentMoney = ratio.stock * netWorth;

    const sharesSPYOwned = Math.floor(investmentMoney / spyPrice);
    let amount_leftover = (investmentMoney % spyPrice);


    const bondsPrice = await getStockPrice("GOVT");
    investmentMoney = (ratio.bonds * netWorth) + amount_leftover;
    const sharesGOVTOwned = Math.floor(investmentMoney / bondsPrice);
    amount_leftover = (investmentMoney % bondsPrice);

    return {
        SPY: sharesSPYOwned,
        GOVT: sharesGOVTOwned,
        cash: amount_leftover
    }
}

exports.getCurrentNetWorth = async (uid) => {
    const [fbres, spyprice, govtprice]= await Promise.all([
        firestore.collection("portfolio").doc(uid).get(),
        getStockPrice("SPY"),
        getStockPrice("GOVT")
    ])

    const data = fbres.data();
    return (data.SPY * spyprice) + (data.GOVT * govtprice) + data.cash;
}

exports.rebalancePortfolio = async (uid, newNetworth) => {
	const userData = (await firestore.collection("userData").doc(uid).get()).data()
	const portfolio = await this.generateStockPortfolio(
		userData.age,
		userData.retirementAge,
		userData.monthlyBudget,
		newNetworth
	)

	await firestore.collection("portfolio").doc(uid).set({
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
}
