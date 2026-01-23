import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import { Message, User, Job, Order } from '../models/index.js';
import { protect } from '../middleware/auth.js';
import { Notification } from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Get user's messages (conversations)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversationWith
 *         schema:
 *           type: integer
 *         description: User ID to get conversation with
 *     responses:
 *       200:
 *         description: List of messages
 */
// @route   GET /api/messages
// @desc    Get user's messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { conversationWith } = req.query;

    let whereClause;

    if (conversationWith) {
      // Get conversation between two users
      whereClause = {
        [Op.or]: [
          { senderId: req.user.id, receiverId: parseInt(conversationWith) },
          { senderId: parseInt(conversationWith), receiverId: req.user.id }
        ]
      };
    } else {
      // Get all messages where user is sender or receiver
      whereClause = {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      };
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'profileImage']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'profileImage']
        },
        {
          model: Job,
          as: 'relatedJob',
          attributes: ['id', 'title']
        },
        {
          model: Order,
          as: 'relatedOrder',
          attributes: ['id', 'orderNumber']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Get list of conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
// @route   GET /api/messages/conversations
// @desc    Get list of conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    // Get unique conversation partners
    const sentMessages = await Message.findAll({
      where: { senderId: req.user.id },
      attributes: ['receiverId'],
      group: ['receiverId'],
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'profileImage']
        }
      ]
    });

    const receivedMessages = await Message.findAll({
      where: { receiverId: req.user.id },
      attributes: ['senderId'],
      group: ['senderId'],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'profileImage']
        }
      ]
    });

    // Combine and get latest message for each conversation
    const conversationPartners = new Map();

    [...sentMessages, ...receivedMessages].forEach(msg => {
      const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === req.user.id ? msg.receiver : msg.sender;
      
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, {
          partner,
          unreadCount: 0
        });
      }
    });

    // Get unread counts and latest messages
    const conversations = await Promise.all(
      Array.from(conversationPartners.keys()).map(async (partnerId) => {
        const unreadCount = await Message.count({
          where: {
            senderId: partnerId,
            receiverId: req.user.id,
            isRead: false
          }
        });

        const latestMessage = await Message.findOne({
          where: {
            [Op.or]: [
              { senderId: req.user.id, receiverId: partnerId },
              { senderId: partnerId, receiverId: req.user.id }
            ]
          },
          order: [['createdAt', 'DESC']]
        });

        return {
          partner: conversationPartners.get(partnerId).partner,
          unreadCount,
          latestMessage: latestMessage ? {
            content: latestMessage.content,
            createdAt: latestMessage.createdAt,
            isRead: latestMessage.isRead,
            senderId: latestMessage.senderId
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: integer
 *               content:
 *                 type: string
 *               subject:
 *                 type: string
 *               relatedJobId:
 *                 type: integer
 *               relatedOrderId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post(
  '/',
  protect,
  [
    body('receiverId').isInt().withMessage('Valid receiver ID is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
    body('subject').optional().trim(),
    body('relatedJobId').optional().isInt(),
    body('relatedOrderId').optional().isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { receiverId, content, subject, relatedJobId, relatedOrderId } = req.body;

      // Check if receiver exists
      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: 'Receiver not found'
        });
      }

      // Prevent sending message to self
      if (receiverId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot send message to yourself'
        });
      }

      const message = await Message.create({
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        content,
        subject: subject || null,
        relatedJobId: relatedJobId ? parseInt(relatedJobId) : null,
        relatedOrderId: relatedOrderId ? parseInt(relatedOrderId) : null,
        isRead: false
      });

      // Create notification for receiver
      await Notification.create({
        userId: receiverId,
        type: 'new_message',
        title: `New message from ${req.user.name}`,
        message: subject || content.substring(0, 100),
        actionUrl: `/messages?conversationWith=${req.user.id}`
      });

      // Send email notification if enabled
      if (receiver.email) {
        try {
          await sendEmail({
            email: receiver.email,
            subject: subject || `New message from ${req.user.name}`,
            message: `You have received a new message from ${req.user.name}:\n\n${content}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Message</h2>
                <p><strong>From:</strong> ${req.user.name}</p>
                ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
                <p>${content}</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages?conversationWith=${req.user.id}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">
                  Reply
                </a>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }

      const messageWithDetails = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'profileImage']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'name', 'email', 'profileImage']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: messageWithDetails
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending message',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /messages/{id}/read:
 *   patch:
 *     summary: Mark message as read
 *     tags: [Messages]
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
 *         description: Message marked as read
 */
// @route   PATCH /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.receiverId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    await message.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /messages/read-all:
 *   patch:
 *     summary: Mark all messages as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All messages marked as read
 */
// @route   PATCH /api/messages/read-all
// @desc    Mark all messages as read
// @access  Private
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Message.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating messages',
      error: error.message
    });
  }
});

export default router;
