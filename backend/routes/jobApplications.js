import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import { JobApplication, Job, User, Notification } from '../models/index.js';
import { protect, isEmployer, isEmployee } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

/**
 * @swagger
 * /job-applications:
 *   get:
 *     summary: Get job applications (filtered by role)
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of job applications
 */
// @route   GET /api/job-applications
// @desc    Get job applications (employer sees their jobs, employee sees their applications)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, jobId } = req.query;
    
    const whereClause = {};

    if (req.user.role === 'employer' || req.user.role === 'seller' || req.user.role === 'admin') {
      // Employers see applications for their jobs
      const jobs = await Job.findAll({
        where: { employerId: req.user.role === 'admin' ? { [Op.ne]: null } : req.user.id },
        attributes: ['id']
      });
      const jobIds = jobs.map(j => j.id);
      
      if (jobIds.length === 0) {
        return res.json({ success: true, data: [], count: 0 });
      }
      
      whereClause.jobId = { [Op.in]: jobIds };
    } else {
      // Employees see their own applications
      whereClause.applicantId = req.user.id;
    }

    if (status) {
      whereClause.status = status;
    }

    if (jobId) {
      whereClause.jobId = parseInt(jobId);
    }

    const applications = await JobApplication.findAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'name', 'email', 'storeName', 'profileImage']
            }
          ]
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'email', 'profileImage', 'skills', 'bio']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /job-applications/{id}:
 *   get:
 *     summary: Get a single job application
 *     tags: [Job Applications]
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
 *         description: Application details
 */
// @route   GET /api/job-applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await JobApplication.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'name', 'email', 'storeName', 'profileImage']
            }
          ]
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'email', 'profileImage', 'skills', 'bio', 'phone']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        application.applicantId !== req.user.id && 
        application.job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /job-applications/{id}/status:
 *   patch:
 *     summary: Update application status (employer only)
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewing, shortlisted, rejected, accepted, withdrawn]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application status updated
 */
// @route   PATCH /api/job-applications/:id/status
// @desc    Update application status
// @access  Private/Employer
router.patch(
  '/:id/status',
  protect,
  isEmployer,
  [
    body('status').isIn(['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn'])
      .withMessage('Invalid status'),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const application = await JobApplication.findByPk(req.params.id, {
        include: [
          {
            model: Job,
            as: 'job'
          },
          {
            model: User,
            as: 'applicant'
          }
        ]
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Check authorization
      if (req.user.role !== 'admin' && application.job.employerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this application'
        });
      }

      const { status, notes } = req.body;

      await application.update({
        status,
        notes: notes || application.notes,
        reviewedAt: new Date()
      });

      // Create notification for applicant
      const statusMessages = {
        reviewing: 'Your application is being reviewed',
        shortlisted: 'Congratulations! You have been shortlisted',
        rejected: 'Your application was not selected',
        accepted: 'Congratulations! Your application has been accepted'
      };

      await Notification.create({
        userId: application.applicantId,
        type: 'job_application_status',
        title: 'Application Status Update',
        message: `${statusMessages[status] || 'Your application status has been updated'} for "${application.job.title}"`,
        relatedJobId: application.jobId,
        relatedApplicationId: application.id,
        actionUrl: `/jobs/${application.jobId}`
      });

      // Send email notification
      if (application.applicant && application.applicant.email) {
        try {
          await sendEmail({
            email: application.applicant.email,
            subject: `Application Update: ${application.job.title}`,
            message: `${statusMessages[status] || 'Your application status has been updated'} for the position "${application.job.title}".`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Application Status Update</h2>
                <p><strong>Job:</strong> ${application.job.title}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p>${statusMessages[status] || 'Your application status has been updated'}.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${application.jobId}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">
                  View Job
                </a>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }

      // If accepted, update job status and user earnings
      if (status === 'accepted') {
        await application.job.update({ status: 'filled' });
        
        // Update applicant's completed tasks
        await application.applicant.increment('completedTasks');
      }

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: application
      });
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating application status',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /job-applications/{id}:
 *   delete:
 *     summary: Withdraw/delete an application
 *     tags: [Job Applications]
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
 *         description: Application withdrawn/deleted
 */
// @route   DELETE /api/job-applications/:id
// @desc    Withdraw application
// @access  Private/Employee
router.delete('/:id', protect, isEmployee, async (req, res) => {
  try {
    const application = await JobApplication.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          as: 'job'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.applicantId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    // Update job application count
    await application.job.decrement('currentApplications');

    // Delete the application
    await application.destroy();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
});

export default router;
