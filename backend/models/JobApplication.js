import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'job_id',
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  applicantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'applicant_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cover_letter'
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'resume'
  },
  resumeFile: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'resume_file'
  },
  coverLetterFile: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'cover_letter_file'
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn'),
    defaultValue: 'pending',
    field: 'status'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'applied_at'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  }
}, {
  tableName: 'job_applications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['job_id', 'applicant_id'],
      name: 'unique_job_application'
    }
  ]
});

export default JobApplication;
