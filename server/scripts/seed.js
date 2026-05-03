require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({ email: { $in: ['admin@kaamio.dev', 'member@kaamio.dev', 'designer@kaamio.dev'] } });

  const admin = await User.create({ name: 'Alex Admin', email: 'admin@kaamio.dev', password: 'kaamio123', role: 'admin', department: 'Engineering' });
  const member1 = await User.create({ name: 'Maya Member', email: 'member@kaamio.dev', password: 'kaamio123', role: 'member', department: 'Development' });
  const member2 = await User.create({ name: 'Dev Designer', email: 'designer@kaamio.dev', password: 'kaamio123', role: 'member', department: 'Design' });
  console.log('✅ Users created');

  const p1 = await Project.create({ title: 'Kaamio Platform v2', description: 'Next version with enhanced analytics.', deadline: new Date(Date.now() + 30*24*60*60*1000), priority: 'high', color: '#7c3aed', createdBy: admin._id, members: [member1._id, member2._id], status: 'active' });
  const p2 = await Project.create({ title: 'Mobile App MVP', description: 'React Native mobile app.', deadline: new Date(Date.now() + 60*24*60*60*1000), priority: 'medium', color: '#0ea5e9', createdBy: admin._id, members: [member1._id], status: 'active' });
  console.log('✅ Projects created');

  const tasks = [
    { title: 'Set up authentication system', status: 'completed', priority: 'critical', assignedTo: member1._id, projectId: p1._id },
    { title: 'Design Kanban board UI', status: 'completed', priority: 'high', assignedTo: member2._id, projectId: p1._id },
    { title: 'Implement real-time notifications', status: 'in-progress', priority: 'high', assignedTo: member1._id, projectId: p1._id },
    { title: 'Build analytics dashboard', status: 'in-progress', priority: 'medium', assignedTo: member2._id, projectId: p1._id },
    { title: 'Write API documentation', status: 'todo', priority: 'low', assignedTo: member1._id, projectId: p1._id },
    { title: 'Mobile app wireframes', status: 'completed', priority: 'high', assignedTo: member2._id, projectId: p2._id },
    { title: 'Setup React Native project', status: 'in-progress', priority: 'high', assignedTo: member1._id, projectId: p2._id },
    { title: 'Implement navigation', status: 'todo', priority: 'medium', assignedTo: member1._id, projectId: p2._id },
  ];

  for (const t of tasks) {
    await Task.create({ ...t, createdBy: admin._id, dueDate: new Date(Date.now() + Math.random()*20*24*60*60*1000) });
  }

  console.log('✅ Tasks created');
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('Admin:  admin@kaamio.dev  /  kaamio123');
  console.log('Member: member@kaamio.dev /  kaamio123');
  mongoose.disconnect();
};

seed().catch(e => { console.error(e); process.exit(1); });