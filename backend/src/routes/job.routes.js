const express = require('express');
const router = express.Router();
const { Job, User, Application } = require('../models');
const { Op } = require('sequelize');

// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    const { category, location, type, search, employerId } = req.query;

    let where = {};

    if (employerId) {
      where.employerId = employerId;
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const jobs = await Job.findAll({
      where,
      include: [{ model: User, as: 'employer', attributes: ['name', 'email'] }]
    });

    res.json({
      success: true,
      jobs,
      total: jobs.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: User, as: 'employer', attributes: ['name', 'email'] }]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jobs - Create new job posting
router.post('/', async (req, res) => {
  try {
    const { title, company, description, location, type, salary, requirements, employerId } = req.body;

    if (!title || !company || !description || !employerId) {
      return res.status(400).json({
        success: false,
        message: 'Title, company, description, and employerId are required'
      });
    }

    const newJob = await Job.create({
      title,
      company,
      description,
      location: location || 'Remote',
      type: type || 'Full-time',
      salary: salary || 'Competitive',
      requirements,
      employerId
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jobs/:id/apply - Apply for a job
router.post('/:id/apply', async (req, res) => {
  try {
    const { userId, resume } = req.body;
    const jobId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const newApplication = await Application.create({
      jobId,
      userId,
      resume,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs/employer/:employerId/applications - Get applications for employer's jobs
router.get('/employer/:employerId/applications', async (req, res) => {
  try {
    const { employerId } = req.params;

    const applications = await Application.findAll({
      include: [
        {
          model: Job,
          as: 'job',
          where: { employerId },
          attributes: ['title', 'company']
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jobs/seed - Seed sample ecosystem jobs
router.post('/seed', async (req, res) => {
  try {
    const { employerId } = req.body;
    if (!employerId) return res.status(400).json({ success: false, message: 'EmployerId required' });

    const samples = [
      { title: 'Senior Logic Architect', company: 'Nexus Systems', description: 'Lead the design of high-scale commerce logic.', location: 'Remote', type: 'Full-time' },
      { title: 'Frontend Systems Engineer', company: 'ShopNest Core', description: 'Build premium glass-morphism interfaces.', location: 'Global', type: 'Full-time' },
      { title: 'Operations Strategist', company: 'Logistics Prime', description: 'Optimize warehouse data transmission.', location: 'London, UK', type: 'Contract' },
      { title: 'AI Implementation Lead', company: 'Neural Node', description: 'Deploy Claude-based assistants.', location: 'San Francisco, CA', type: 'Full-time' }
    ];

    const jobs = await Promise.all(samples.map(s => Job.create({
      ...s,
      employerId,
      salary: '$120,000 - $180,000'
    })));

    res.json({ success: true, message: 'Opportunities seeded.', jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
