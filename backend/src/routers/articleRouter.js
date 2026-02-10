const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { verifyAccessToken, verifyAdmin } = require('../middlewares/authMiddleWare');

// ============ PUBLIC ROUTES ============
// Get published articles
router.get('/published', articleController.getPublishedArticles);

// Get featured articles
router.get('/featured', articleController.getFeaturedArticles);

// Get latest articles
router.get('/latest', articleController.getLatestArticles);

// Get article by slug (public)
router.get('/slug/:slug', articleController.getArticleBySlug);

// ============ ADMIN ROUTES ============
// Get all articles (admin)
router.get('/admin', verifyAdmin, articleController.getAllArticles);

// Create article
router.post('/admin', verifyAdmin, articleController.createArticle);

// Get article by ID (admin)
router.get('/admin/:id', verifyAdmin, articleController.getArticleById);

// Update article
router.put('/admin/:id', verifyAdmin, articleController.updateArticle);

// Delete article
router.delete('/admin/:id', verifyAdmin, articleController.deleteArticle);

// Publish article
router.post('/admin/:id/publish', verifyAdmin, articleController.publishArticle);

// Archive article
router.post('/admin/:id/archive', verifyAdmin, articleController.archiveArticle);

module.exports = router;
