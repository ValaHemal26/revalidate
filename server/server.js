const express = require("express");
const mongoose = require( "mongoose");
const  cors = require( "cors");
const app = express();
const dotenv = require("dotenv");
const { default : admin_routes} = require( "./routes/admin.routes.mjs");
const {default : user_routes} = require ("./routes/user.routes.mjs"); 

dotenv.config();
app.use(cors());
app.use(express.json());
const apiAdminRouter = express.Router();
const apiUserRouter = express.Router();

mongoose.connect("mongodb://127.0.0.1:27017/busBooking")
  .then(async () => {
    console.log("MongoDB Connected");
}).catch(err => console.log(err));


user_routes(apiUserRouter);

admin_routes(apiAdminRouter);

app.use("/api/v1/admin", apiAdminRouter);
app.use("/api/v1/user", apiUserRouter);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
