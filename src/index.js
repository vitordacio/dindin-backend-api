require('dotenv').config()
const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use(routes);

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Server running on port ${port}`));