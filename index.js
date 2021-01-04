require('dotenv').config()

const app = require("./server/app");

const PORT_NUMBER = process.env.PORT || 5000;

app.listen(PORT_NUMBER, () => {
  console.log(`running on port http://localhost:${PORT_NUMBER}/`);
});