const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Job Schema
const jobSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  category: { type: String, required: true },
  salary: { type: String, default: '$50,000 - $70,000' },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model('Job', jobSchema);

// User Schema (Unused in this context but kept for completeness)
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Fetch and Store Jobs from JSONPlaceholder
app.get('/api/jobs/fetch-and-store', async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const posts = response.data;

    const jobData = posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.body,
      company: `Company ${post.id}`,
      location: 'Remote',
      category: post.id % 3 === 0 ? 'Tech' : post.id % 3 === 1 ? 'Marketing' : 'Sales',
      salary: '$50,000 - $70,000',
      image: `https://picsum.photos/300/150?random=${post.id}`,
    }));

    await Promise.all(
      jobData.map((job) =>
        Job.findOneAndUpdate(
          { id: job.id },
          job,
          { upsert: true, new: true }
        )
      )
    );

    res.status(200).json({ message: 'Jobs fetched and stored successfully', jobs: jobData });
  } catch (error) {
    console.error('Error fetching and storing jobs:', error.message);
    res.status(500).json({ error: 'Failed to fetch and store jobs' });
  }
});

// Fetch All Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error retrieving jobs:', error.message);
    res.status(500).json({ error: 'Failed to retrieve jobs' });
  }
});

// Store User Data (Unused but kept)
app.post('/api/users', async (req, res) => {
  const { firebaseUid, name, email, profilePicture } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { firebaseUid, name, email, profilePicture },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'User data stored successfully', user });
  } catch (error) {
    console.error('Error storing user data:', error.message);
    res.status(500).json({ error: 'Failed to store user data' });
  }
});

// Fetch and Store Jobs from jsonfakery
app.get('/api/jobs/fetch-from-jsonfakery', async (req, res) => {
  try {
    const response = await axios.get('https://jsonfakery.com/job-posts');
    const posts = response.data;

    const jobData = posts.map((post) => ({
      id: parseInt(post.id, 10),
      title: post.job_title || 'Untitled',
      description: post.description || 'No description',
      company: post.company || 'Unknown Company',
      location: post.location || 'Remote',
      category: post.category || 'General',
      salary: post.salary || '$50,000 - $70,000',
      image: post.image || `https://picsum.photos/300/150?random=${post.id}`,
    }));

    await Promise.all(
      jobData.map((job) =>
        Job.findOneAndUpdate(
          { id: job.id },
          job,
          { upsert: true, new: true }
        )
      )
    );

    res.status(200).json({ message: 'Jobs fetched from jsonfakery and stored successfully', jobs: jobData });
  } catch (error) {
    console.error('Error fetching and storing jobs from jsonfakery:', error.message);
    res.status(500).json({ error: 'Failed to fetch and store jobs from jsonfakery' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
