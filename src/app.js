const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', auth, require('./routes/habits'));

module.exports = app;