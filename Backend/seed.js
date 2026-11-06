const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./model/User.model');  

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    await User.deleteMany();
    console.log('Cleared existing users...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const demoUsers = [
      // 3 Admins
      { name: 'Admin One', email: 'admin1@pravixa.com', password: hashedPassword, role: 'Admin' },
      { name: 'Admin Two', email: 'admin2@pravixa.com', password: hashedPassword, role: 'Admin' },
      { name: 'Admin Three', email: 'admin3@pravixa.com', password: hashedPassword, role: 'Admin' },
      
      // 7 Sales Agents
      { name: 'Agent One', email: 'agent1@pravixa.com', password: hashedPassword, role: 'Sales Agent' },
      { name: 'Agent Two', email: 'agent2@pravixa.com', password: hashedPassword, role: 'Sales Agent' },
      { name: 'Agent Three', email: 'agent3@pravixa.com', password: hashedPassword, role: 'Sales Agent' },
      { name: 'Agent Four', email: 'agent4@pravixa.com', password: hashedPassword, role: 'Sales Agent' },
      { name: 'Agent Five', email: 'agent5@pravixa.com', password: hashedPassword, role: 'Sales Agent' },
      { name: 'Agent Six', email: 'agent6@pravixa.com', password: hashedPassword, role: 'Sales Agent' },
      { name: 'Agent Seven', email: 'agent7@pravixa.com', password: hashedPassword, role: 'Sales Agent' }
    ];

    await User.insertMany(demoUsers);
    console.log('10 Demo users (3 Admins, 7 Agents) populated successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();