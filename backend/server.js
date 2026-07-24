const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Task Tracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
