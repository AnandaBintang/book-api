import express from 'express';
import db from '../db/knex.js';
import { responseFormat } from '../types/response.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Get logged-in user's details
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await db('users')
            .select('id', 'username', 'email', 'created_at', 'updated_at')
            .where({id: req.user.id })
            .first();

        if (!user) {
            return res.status(404).json({
                ...responseFormat,
                success: false,
                message: 'User not found',
                statusCode: 404,
            });
        }

        return res.status(200).json({
            ...responseFormat,
            success: true,
            message: 'User details retrieved successfully',
            statusCode: 200,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);

        return res.status(500).json({
            ...responseFormat,
            success: false,
            message: 'Failed to retrieve user details',
            errors: error.message,
            statusCode: 500,
        });
    }
})

// Delete logged-in user
router.delete('/me', authenticate, async (req, res) => {
    try {
        const { id } = req.user;

        const deletedUser = await db('users')
            .where({ id })
            .first();

        if (!deletedUser) {
            return res.status(404).json({
                ...responseFormat,
                success: false,
                message: 'User not found',
                statusCode: 404,
            });
        }

        await db('users')
            .where({ id })
            .del();

        return res.status(200).json({
            ...responseFormat,
            success: true,
            message: 'User deleted successfully',
            statusCode: 200,
            data: {
                id: deletedUser.id,
                username: deletedUser.username,
                email: deletedUser.email,
                created_at: deletedUser.created_at,
                updated_at: deletedUser.updated_at,
            },
        });

    } catch (error) {
        console.error('Error deleting user:', error);

        return res.status(500).json({
            ...responseFormat,
            success: false,
            message: 'Failed to delete user',
            errors: error.message,
            statusCode: 500,
        });
    }
})

// Update logged-in user's details
router.put('/me',
    authenticate,
    [
        body('username').trim().notEmpty().withMessage('Username is required'),
        body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
    ],
    validate,
    async (req, res) => {
        const { username, email } = req.body;
        const { id } = req.user;

    if (!username || !email) {
        return res.status(400).json({
            ...responseFormat,
            success: false,
            message: 'Username and email are required',
            statusCode: 400,
        });
    }

    try {
        const updatedUser = await db('users')
            .where({ id })
            .first();

        if (!updatedUser) {
            return res.status(404).json({
                ...responseFormat,
                success: false,
                message: 'User not found',
                statusCode: 404,
            });
        }

        const [user] = await db('users')
            .where({ id })
            .update({
                username,
                email,
                updated_at: new Date().toISOString(),
            })
            .returning(['id', 'username', 'email', 'created_at', 'updated_at']);
        
        return res.status(200).json({
            ...responseFormat,
            success: true,
            message: 'User details updated successfully',
            statusCode: 200,
            data: user,
        })
    } catch (error) {
        console.error('Error updating user details:', error);

        return res.status(500).json({
            ...responseFormat,
            success: false,
            message: 'Failed to update user details',
            errors: error.message,
            statusCode: 500,
        });
    }
})

export default router;