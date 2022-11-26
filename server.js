
require('dotenv').config()
require('express-async-errors')
//Initialize express js
const express = require("express");
const app = express();
const mongoose = require('mongoose')
const connectDB = require('./config/DBconnect')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require("path");
const corsOptions = require('./config/corsOptions')
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorLogger");
const credentials = require("./middleware/credentials")

//define port
const port = process.env.PORT || 3050;

//connect to mongoDB
connectDB()

//logger
app.use(logger);

//
app.use(credentials)

//allows cross origin request
app.use(cors(corsOptions))

//built in middleware to allow process json file
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//allows app to parse cookie(a 3rd party middleware)
app.use(cookieParser())

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));
app.use('/', require('./routes/root'))
//user routes api
app.use('/auth',require('./routes/authRoutes'))
app.use('/users',require('./routes/userRoutes'))
app.use('/notes',require('./routes/notesRoutes'))


//anything that reaches this level
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 not found" });
  } else {
    res.type(txt).send("404 Not Found");
  }
});


//always use errorlogger at the end(before listen obvious)
app.use(errorHandler)

//server port
mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Server is on port ${port}`);
  });
});

//mongo error handling
mongoose.connection.on('error', err => {
  logEvents(`${err.code}\t ${err.no}\t${err.syscall}\t${err.hostname}`, "mongoErrors.log");
})

// app.listen(port, () => {
//   console.log(`Server is on port ${port}`);
// });
