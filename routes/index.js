import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import authorRoutes from './authors.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/authors', authorRoutes);

export default router;
