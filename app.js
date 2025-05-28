const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { engine } = require('express-handlebars');
const emailRoutes = require('./routes/email');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 80;

// View engine setup
app.engine('hbs', engine({ extname: 'hbs', defaultLayout: false }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')); 

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', emailRoutes);

// Redirect root
app.get('/', (req, res) => {
  res.redirect('/api/get-code');
});

// Start server
app.listen(PORT,'0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
