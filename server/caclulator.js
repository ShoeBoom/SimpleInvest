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

function getStockPrice(stockSymbol){
    // const response = axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${STOCK_API_KEY}`);

    // console.log(`Price of ${stockSymbol} : ${response.data["Global Quote"]["05. price"]}`)
    // // TODO: implement handeling for when the api rate limit is reached
    // return parseFloat(response.data["Global Quote"]["05. price"])

    if (stockSymbol == "GOVT"){
        return 27.77;
    }else {
        return 355.33;
    }
}

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
    /*const [fbres, spyprice, govtprice]= await Promise.all([
        firestore.collection("portfolio").doc(uid).get(),
        getStockPrice("SPY"),
        getStockPrice("GOVT")
    ])

    const data = fbres.data();
    return (data.SPY * spyprice) + (data.GOVT * govtprice) + data.cash;*/
    const [fbres]= await Promise.all([
        firestore.collection("portfolio").doc(uid).get()
    ])

    const data = fbres.data();
    return (data.SPY * 355.33) + (data.GOVT * 27.77) + data.cash;
    //find price of SPY and GOVT everyday

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
}
