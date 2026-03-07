const express = require('express');
const router = express.Router();
const { Message, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/messages/conversation/:userId/:otherUserId - Get conversation between two users
router.get('/conversation/:userId/:otherUserId', async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['name', 'picture'] },
                { model: User, as: 'receiver', attributes: ['name', 'picture'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Mark messages as read
        await Message.update(
            { read: true },
            { where: { senderId: otherUserId, receiverId: userId, read: false } }
        );

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/messages/inbox/:userId - Get all conversations for a user
router.get('/inbox/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get all messages where user is sender or receiver
        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'picture'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'picture'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Group by conversation partner
        const conversations = {};
        messages.forEach(msg => {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!conversations[partnerId]) {
                const partner = msg.senderId === userId ? msg.receiver : msg.sender;
                conversations[partnerId] = {
                    partnerId,
                    partner,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    unreadCount: 0
                };
            }
            if (msg.receiverId === userId && !msg.read) {
                conversations[partnerId].unreadCount++;
            }
        });

        res.json({ success: true, conversations: Object.values(conversations) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/messages - Send a message
router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        if (!senderId || !receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'senderId, receiverId, and content are required'
            });
        }

        const message = await Message.create({ senderId, receiverId, content });

        const messageWithUsers = await Message.findByPk(message.id, {
            include: [
                { model: User, as: 'sender', attributes: ['name', 'picture'] },
                { model: User, as: 'receiver', attributes: ['name', 'picture'] }
            ]
        });

        res.status(201).json({ success: true, message: messageWithUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/messages/unread/:userId - Get unread count
router.get('/unread/:userId', async (req, res) => {
    try {
        const count = await Message.count({
            where: { receiverId: req.params.userId, read: false }
        });
        res.json({ success: true, unreadCount: count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
