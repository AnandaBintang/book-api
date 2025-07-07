import express from 'express';
import { body } from 'express-validator';
import db from '../db/knex.js';
import { validate } from '../middleware/validate.js';
import { responseFormat } from '../types/response.js';
import { authenticate } from '../middleware/auth.js';
import dotenv from 'dotenv'

dotenv.config();

const router = express.Router();

// Get all authors with pagination and search
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = process.env.PER_PAGE || 10, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let baseQuery = db('authors');
        
        if (search) {
            baseQuery = baseQuery.where('name', 'ilike', `%${search}%`);
        }

        const totalAuthors = await baseQuery.clone().count('* as count').first();
        const authors = await baseQuery.clone()
            .select('*')
            .orderBy('created_at', 'desc')
            .limit(parseInt(limit))
            .offset(offset);

        return res.status(200).json({
            ...responseFormat,
            success: true,
            message: 'Authors retrieved successfully',
            statusCode: 200,
            data: authors,
            pagination: {
                total: Number(totalAuthors.count),
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(Number(totalAuthors.count) / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching authors:', error);

        return res.status(500).json({
            ...responseFormat,
            success: false,
            message: 'Failed to retrieve authors',
            errors: error.message,
            statusCode: 500,
        });
    }
})

// Get a single author by ID
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const author = await db('authors')
            .select('*')
            .where({ id })
            .first();

        if (!author) {
            return res.status(404).json({
                ...responseFormat,
                success: false,
                message: 'Author not found',
                statusCode: 404,
            });
        }

        return res.status(200).json({
            ...responseFormat,
            success: true,
            message: 'Author retrieved successfully',
            statusCode: 200,
            data: author,
        });
    } catch (error) {
        console.error('Error fetching author:', error);

        return res.status(500).json({
            ...responseFormat,
            success: false,
            message: 'Failed to retrieve author',
            errors: error.message,
            statusCode: 500,
        });
    }
})

// Create a new author
router.post('/', 
    authenticate,
    [
        body('name').trim().notEmpty().withMessage('Author name is required'),
        body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
        body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    ],
    validate,
    async (req, res) => {
        const { name, email, bio } = req.body;
        const dateNow = new Date().toISOString();

        try {
            const newAuthor = await db('authors').insert({
                name,
                email,
                bio,
                created_at: dateNow,
                updated_at: dateNow,
            }).returning(['id', 'name', 'email', 'bio', 'created_at', 'updated_at']);

            return res.status(201).json({
                ...responseFormat,
                success: true,
                message: 'Author created successfully',
                statusCode: 201,
                data: newAuthor[0],
            });
        } catch (error) {
            console.error('Error creating author:', error);

            return res.status(500).json({
                ...responseFormat,
                success: false,
                message: 'Failed to create author',
                errors: error.message,
                statusCode: 500,
            });
        }
    }
)

// Update an existing author
router.put('/:id',
    authenticate,
    [
        body('name').trim().notEmpty().withMessage('Author name is required'),
        body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
        body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        const { name, email, bio } = req.body;
        const dateNow = new Date().toISOString();

        try {
            const updatedAuthor = await db('authors')
                .where({ id })
                .first();
         
            if (!updatedAuthor) {
                return res.status(404).json({
                    ...responseFormat,
                    success: false,
                    message: 'Author not found',
                    statusCode: 404,
                });
            }

            const [author] = await db('authors')
                .where({ id })
                .update({
                    name,
                    email,
                    bio,
                    updated_at: dateNow,
                })
                .returning(['id', 'name', 'email', 'bio', 'created_at', 'updated_at']);
            
            return res.status(200).json({
                ...responseFormat,
                success: true,
                message: 'Author updated successfully',
                statusCode: 200,
                data: author,
            });
        } catch (error) {
            console.error('Error updating author:', error);

            return res.status(500).json({
                ...responseFormat,
                success: false,
                message: 'Failed to update author',
                errors: error.message,
                statusCode: 500,
            });
        }
    }
)

// Delete an author
router.delete('/:id',
    authenticate,
    async (req, res) => {
        const { id } = req.params;

        try {
            const deletedAuthor = await db('authors')
                .where({ id })
                .del();

            if (!deletedAuthor) {
                return res.status(404).json({
                    ...responseFormat,
                    success: false,
                    message: 'Author not found',
                    statusCode: 404,
                });
            }

            return res.status(200).json({
                ...responseFormat,
                success: true,
                message: 'Author deleted successfully',
                statusCode: 200,
            });
        } catch (error) {
            console.error('Error deleting author:', error);

            return res.status(500).json({
                ...responseFormat,
                success: false,
                message: 'Failed to delete author',
                errors: error.message,
                statusCode: 500,
            });
        }
    }
);

// Batch delete authors
router.delete('/',
    authenticate,
    async (req, res) => {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                ...responseFormat,
                success: false,
                message: 'Invalid or empty IDs array',
                statusCode: 400,
            });
        }

        try {
            const deletedCount = await db('authors')
                .whereIn('id', ids)
                .del();

            if (deletedCount === 0) {
                return res.status(404).json({
                    ...responseFormat,
                    success: false,
                    message: 'No authors found with the provided IDs',
                    statusCode: 404,
                });
            }

            return res.status(200).json({
                ...responseFormat,
                success: true,
                message: `${deletedCount} authors deleted successfully`,
                statusCode: 200,
            });
        } catch (error) {
            console.error('Error deleting authors:', error);

            return res.status(500).json({
                ...responseFormat,
                success: false,
                message: 'Failed to delete authors',
                errors: error.message,
                statusCode: 500,
            });
        }
    }
)

export default router;