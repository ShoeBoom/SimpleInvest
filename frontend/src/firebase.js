import client from "firebase/app";
import "firebase/auth"
import "firebase/firestore";
if (client.apps.length === 0) {
	const config = require("./firebaseConfig.json");
	client.initializeApp(config);
}
export default client;