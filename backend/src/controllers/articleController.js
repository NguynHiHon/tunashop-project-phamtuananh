const articleService = require('../services/articleService');

// ============ ADMIN ROUTES ============

// Create article
const createArticle = async (req, res) => {
    try {
        const userId = req.user._id;
        const article = await articleService.createArticle(userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo bài viết thành công',
            data: article,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all articles (admin)
const getAllArticles = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, category, search } = req.query;
        const result = await articleService.getAllArticles({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            category,
            search,
        });
        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get article by ID (admin)
const getArticleById = async (req, res) => {
    try {
        const article = await articleService.getArticleById(req.params.id, false);
        res.json({
            success: true,
            data: article,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Update article
const updateArticle = async (req, res) => {
    try {
        const article = await articleService.updateArticle(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            data: article,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete article
const deleteArticle = async (req, res) => {
    try {
        await articleService.deleteArticle(req.params.id);
        res.json({
            success: true,
            message: 'Xóa bài viết thành công',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Publish article
const publishArticle = async (req, res) => {
    try {
        const article = await articleService.publishArticle(req.params.id);
        res.json({
            success: true,
            message: 'Đăng bài viết thành công',
            data: article,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Archive article
const archiveArticle = async (req, res) => {
    try {
        const article = await articleService.archiveArticle(req.params.id);
        res.json({
            success: true,
            message: 'Lưu trữ bài viết thành công',
            data: article,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ============ PUBLIC ROUTES ============

// Get published articles
const getPublishedArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, featured } = req.query;
        const result = await articleService.getPublishedArticles({
            page: parseInt(page),
            limit: parseInt(limit),
            category,
            featured,
        });
        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get article by slug (public)
const getArticleBySlug = async (req, res) => {
    try {
        const article = await articleService.getArticleById(req.params.slug, true);

        // Only return published articles to public
        if (article.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết',
            });
        }

        res.json({
            success: true,
            data: article,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Get featured articles
const getFeaturedArticles = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const articles = await articleService.getFeaturedArticles(parseInt(limit));
        res.json({
            success: true,
            data: articles,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get latest articles
const getLatestArticles = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const articles = await articleService.getLatestArticles(parseInt(limit));
        res.json({
            success: true,
            data: articles,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createArticle,
    getAllArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    publishArticle,
    archiveArticle,
    getPublishedArticles,
    getArticleBySlug,
    getFeaturedArticles,
    getLatestArticles,
};
