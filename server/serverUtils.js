const { admin, firestore, auth } = require("./firebase")

exports.addTransaction = async (uid, amount) => {
    let type = ""
    if (amount < 0){
        type = "withdraw"
    }else {
        type = "deposit"
    }
    
    await firestore.collection("transactions").add({
        uid: uid,
        date: admin.firestore.FieldValue.serverTimestamp(),
        type: type,
        amount: Math.abs(amount)
    })
}