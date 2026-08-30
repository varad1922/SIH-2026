const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Register models
require('./models/User');
require('./models/Profile');
require('./models/Skill');
require('./models/Course');
require('./models/Question');
require('./models/Quiz');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/quizzes', require('./routes/quizzes'));
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/assessments', require('./routes/assessments'));
// app.use('/api/skills', require('./routes/skills'));
// app.use('/api/courses', require('./routes/courses'));
app.use('/api/learning-path', require('./routes/learning-path'));
// app.use('/api/quizzes', require('./routes/quizzes'));
// app.use('/api/analytics', require('./routes/analytics'));
// app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
