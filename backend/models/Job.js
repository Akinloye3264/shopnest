import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'freelance', 'task', 'gig'),
    defaultValue: 'task',
    field: 'type'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'salary'
  },
  salaryType: {
    type: DataTypes.ENUM('fixed', 'hourly', 'commission', 'task-based'),
    defaultValue: 'task-based',
    field: 'salary_type'
  },
  requiredSkills: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'required_skills'
  },
  employerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'employer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed', 'filled'),
    defaultValue: 'draft',
    field: 'status'
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'application_deadline'
  },
  maxApplications: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_applications'
  },
  currentApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_applications'
  },
  isRemote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_remote'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'mid', 'senior', 'any'),
    defaultValue: 'any',
    field: 'experience_level'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'tags'
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Job;
