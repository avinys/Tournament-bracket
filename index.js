// index.js
const express = require('express');
const path = require('path')

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//Routes
const matchRoutes = require('./routes/matchRoutes');
const generalRoutes = require('./routes/generalRoutes');
const dataRoutes = require("./routes/dataRoutes");

app.use("/", generalRoutes);
app.use("/", matchRoutes);
app.use("/data", dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
