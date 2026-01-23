import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import { Job, JobApplication, User, Notification } from '../models/index.js';
import { protect, isEmployer, isEmployee } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

const router = express.Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs with filters
 *     tags: [Jobs]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs
 */
// @route   GET /api/jobs
// @desc    Get all jobs (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, type, location, search, status = 'active', experienceLevel } = req.query;
    
    const whereClause = {
      status: status === 'all' ? { [Op.ne]: null } : status
    };

    if (category) {
      whereClause.category = category;
    }

    if (type) {
      whereClause.type = type;
    }

    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }

    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'email', 'storeName', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'email', 'storeName', 'profileImage', 'bio']
        },
        {
          model: JobApplication,
          as: 'applications',
          include: [
            {
              model: User,
              as: 'applicant',
              attributes: ['id', 'name', 'email', 'profileImage']
            }
          ]
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, freelance, task, gig]
 *               location:
 *                 type: string
 *               salary:
 *                 type: number
 *               salaryType:
 *                 type: string
 *                 enum: [fixed, hourly, commission, task-based]
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               isRemote:
 *                 type: boolean
 *               experienceLevel:
 *                 type: string
 *                 enum: [entry, mid, senior, any]
 *     responses:
 *       201:
 *         description: Job created successfully
 */
// @route   POST /api/jobs
// @desc    Create a job posting
// @access  Private/Employer
router.post(
  '/',
  protect,
  isEmployer,
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('description').trim().notEmpty().withMessage('Job description is required'),
    body('category').trim().notEmpty().withMessage('Job category is required'),
    body('type').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'task', 'gig']),
    body('salaryType').optional().isIn(['fixed', 'hourly', 'commission', 'task-based']),
    body('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'any'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        title,
        description,
        category,
        type = 'task',
        location,
        salary,
        salaryType = 'task-based',
        requiredSkills = [],
        isRemote = false,
        experienceLevel = 'any',
        tags = [],
        applicationDeadline,
        maxApplications
      } = req.body;

      const job = await Job.create({
        title,
        description,
        category,
        type,
        location,
        salary: salary ? parseFloat(salary) : null,
        salaryType,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
        employerId: req.user.id,
        isRemote,
        experienceLevel,
        tags: Array.isArray(tags) ? tags : [],
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        maxApplications: maxApplications ? parseInt(maxApplications) : null,
        status: 'active'
      });

      // Create notification for job seekers (employees)
      const employees = await User.findAll({
        where: { role: 'employee' },
        attributes: ['id', 'email', 'phone']
      });

      // Send notifications (in background, don't wait)
      employees.forEach(async (employee) => {
        try {
          await Notification.create({
            userId: employee.id,
            type: 'job_posted',
            title: 'New Job Opportunity',
            message: `A new ${type} position for "${title}" has been posted. Check it out!`,
            relatedJobId: job.id,
            actionUrl: `/jobs/${job.id}`
          });

          // Send email notification if available
          if (employee.email) {
            await sendEmail({
              email: employee.email,
              subject: `New Job Opportunity: ${title}`,
              message: `A new job opportunity "${title}" has been posted. Visit the platform to apply.`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>New Job Opportunity</h2>
                  <h3>${title}</h3>
                  <p>${description.substring(0, 200)}...</p>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}" 
                     style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">
                    View Job
                  </a>
                </div>
              `
            });
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      });

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: job
      });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating job',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update a job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job updated successfully
 */
// @route   PUT /api/jobs/:id
// @desc    Update a job posting
// @access  Private/Employer
router.put('/:id', protect, isEmployer, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const allowedFields = [
      'title', 'description', 'category', 'type', 'location', 'salary',
      'salaryType', 'requiredSkills', 'isRemote', 'experienceLevel', 'tags',
      'applicationDeadline', 'maxApplications', 'status'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await job.update(updateData);

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job deleted successfully
 */
// @route   DELETE /api/jobs/:id
// @desc    Delete a job posting
// @access  Private/Employer
router.delete('/:id', protect, isEmployer, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete related applications
    await JobApplication.destroy({ where: { jobId: job.id } });

    // Delete the job
    await job.destroy();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /jobs/{id}/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *               resume:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 */
// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private/Employee
router.post(
  '/:id/apply',
  protect,
  isEmployee,
  [
    body('coverLetter').optional().trim(),
    body('resume').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const job = await Job.findByPk(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      if (job.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'This job is not accepting applications'
        });
      }

      // Check if already applied
      const existingApplication = await JobApplication.findOne({
        where: {
          jobId: job.id,
          applicantId: req.user.id
        }
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job'
        });
      }

      // Check application limit
      if (job.maxApplications && job.currentApplications >= job.maxApplications) {
        return res.status(400).json({
          success: false,
          message: 'This job has reached the maximum number of applications'
        });
      }

      // Check deadline
      if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline has passed'
        });
      }

      const application = await JobApplication.create({
        jobId: job.id,
        applicantId: req.user.id,
        coverLetter: req.body.coverLetter || null,
        resume: req.body.resume || req.user.resume || null,
        status: 'pending'
      });

      // Update job application count
      await job.increment('currentApplications');

      // Create notification for employer
      await Notification.create({
        userId: job.employerId,
        type: 'job_application',
        title: 'New Job Application',
        message: `${req.user.name} has applied for your job: "${job.title}"`,
        relatedJobId: job.id,
        relatedApplicationId: application.id,
        actionUrl: `/jobs/${job.id}/applications`
      });

      // Send email to employer
      const employer = await User.findByPk(job.employerId);
      if (employer && employer.email) {
        try {
          await sendEmail({
            email: employer.email,
            subject: `New Application for: ${job.title}`,
            message: `${req.user.name} has applied for your job posting "${job.title}". Review the application on the platform.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Job Application</h2>
                <p><strong>Applicant:</strong> ${req.user.name}</p>
                <p><strong>Job:</strong> ${job.title}</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}/applications" 
                   style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">
                  Review Application
                </a>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      console.error('Apply job error:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting application',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /jobs/{id}/match:
 *   get:
 *     summary: Get job matches for current user based on skills
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job match score
 */
// @route   GET /api/jobs/:id/match
// @desc    Get job match score for current user
// @access  Private/Employee
router.get('/:id/match', protect, isEmployee, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const user = await User.findByPk(req.user.id);
    const userSkills = user.skills || [];
    const requiredSkills = job.requiredSkills || [];

    // Calculate match score
    let matchScore = 0;
    if (requiredSkills.length > 0) {
      const matchedSkills = userSkills.filter(skill => 
        requiredSkills.some(reqSkill => 
          reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      );
      matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    } else {
      matchScore = 100; // No required skills means perfect match
    }

    res.json({
      success: true,
      data: {
        matchScore,
        userSkills,
        requiredSkills,
        matchedSkills: userSkills.filter(skill => 
          requiredSkills.some(reqSkill => 
            reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(reqSkill.toLowerCase())
          )
        )
      }
    });
  } catch (error) {
    console.error('Job match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating job match',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /jobs/match/recommended:
 *   get:
 *     summary: Get recommended jobs for current user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended jobs
 */
// @route   GET /api/jobs/match/recommended
// @desc    Get recommended jobs based on user skills
// @access  Private/Employee
router.get('/match/recommended', protect, isEmployee, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const userSkills = user.skills || [];

    // Get all active jobs
    const allJobs = await Job.findAll({
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'storeName', 'profileImage']
        }
      ]
    });

    // Calculate match scores and sort
    const jobsWithScores = allJobs.map(job => {
      const requiredSkills = job.requiredSkills || [];
      let matchScore = 0;

      if (requiredSkills.length > 0) {
        const matchedSkills = userSkills.filter(skill => 
          requiredSkills.some(reqSkill => 
            reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(reqSkill.toLowerCase())
          )
        );
        matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
      } else {
        matchScore = 50; // Neutral score if no skills required
      }

      return {
        ...job.toJSON(),
        matchScore
      };
    });

    // Sort by match score (highest first)
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Get top 20 matches
    const recommended = jobsWithScores.slice(0, 20);

    res.json({
      success: true,
      data: recommended,
      count: recommended.length
    });
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended jobs',
      error: error.message
    });
  }
});

export default router;
