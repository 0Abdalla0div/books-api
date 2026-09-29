require("dotenv").config();
const port = process.env.PORT || 3000;
const { createapp } = require("./app");
async function startserver() {
  try {
    const app = await createapp();
    app.listen(port, () => {
      console.log("hahaha");
    });
  } catch (err) {
    console.log(err);
  }
}

startserver();
