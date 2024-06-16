const express = require("express");
const net = require("net");
const cors = require("cors");

const mongoConnect = require("./db").mongoConnect;

const app = express();

const PORT = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const userRoute = require("./routes/user");
const plantRoute = require("./routes/plants");

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRoute);
app.use("/plant", plantRoute);
app.use((error, req, res, next) => {
  console.log(error);
  if (!error.statusCode) error.statusCode = 500;
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message ? error.message : "Internal Server Error",
  });
});
console.log(process.env.PORT);
mongoConnect(() => {
  app.listen(PORT, () => {
    console.log("Server Started");
  });
});
