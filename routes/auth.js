import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import db from '../db/knex.js';
import { validate } from '../middleware/validate.js';
import { responseFormat } from '../types/response.js';

const router = express.Router();

// User registration route
router.post(
    '/register',
    [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Invalid email format')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    validate,
    async (req, res) => {
        const { username, email, password } = req.body;
        const dateNow = new Date().toISOString();

        try {
            // Check if user already exists
            const existingUser = await db('users').where({ email }).first();
            if (existingUser) {
                return res.status(409).json({
                    ...responseFormat,
                    success: false,
                    message: 'User already exists',
                    statusCode: 409,
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const [user] = await db('users')
                .insert({
                    username,
                    email,
                    password: hashedPassword,
                    created_at: dateNow,
                    updated_at: dateNow,
                })
                .returning(['id', 'username', 'email', 'created_at', 'updated_at']);

            return res.status(201).json({
                ...responseFormat,
                message: 'User registered successfully',
                data: user,
                statusCode: 201,
            });
        } catch (error) {
            console.error('Registration error:', error);

            return res.status(500).json({
                ...responseFormat,
                success: false,
                message: 'Registration failed',
                errors: error.message,
                statusCode: 500,
            });
        }
    }
);

// User login route
router.post('/login', [
    body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
], validate, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db('users').where({ email }).first();

        if (!user) {
            return res.status(401).json({
                ...responseFormat,
                success: false,
                message: 'Invalid email or password',
                statusCode: 401,
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.status(401).json({
                ...responseFormat,
                success: false,
                message: 'Invalid email or password',
                statusCode: 401,
            });
        }

        const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
        )

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        )

        res.status(200).json({
            ...responseFormat,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                accessToken,
                refreshToken
            },
            statusCode: 200,
        });
    } catch (error) {
        res.status(500).json({
            ...responseFormat,
            success: false,
            message: 'Login failed',
            errors: error.message,
            statusCode: 500,
        });
    }
})

// Refresh token route
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            ...responseFormat,
            success: false,
            message: 'Refresh token is required',
            statusCode: 401,
        });
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const accessToken = jwt.sign(
            {id: payload.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
        );

        res.status(200).json({
            ...responseFormat,
            message: 'Access token refreshed successfully',
            data: { accessToken },
            statusCode: 200,
        })
    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(403).json({
            ...responseFormat,
            success: false,
            message: 'Invalid refresh token',
            errors: error.message,
            statusCode: 403,
        });
    }
})

export default router;