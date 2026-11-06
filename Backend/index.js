const express = require('express'); 
const app = express(); 
const AppError = require('./utils/AppError'); 
const cookieParser = require('cookie-parser'); 
const cors = require('cors'); 


const authRoutes = require('./routes/Auth.route'); 
const leadRoutes = require('./routes/Lead.routes'); 
const userRoutes = require('./routes/User.route'); 

const connectDB = require('./config/mongoDb'); 

require('dotenv').config();


connectDB(); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.get('/', (req, res) => {
    res.send("Hello World Testing"); 
}); 

app.use('/api/v1/auth', authRoutes); 

app.use('/api/v1/lead', leadRoutes); 

app.use('/api/v1/user', userRoutes); 

app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


app.listen(process.env.PORT || 8000, () => { 
    console.log(`Server is running on port ${process.env.PORT}`); 
}); 



