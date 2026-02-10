const Article = require('../models/Article');

// Create article
const createArticle = async (userId, articleData) => {
    const article = new Article({
        ...articleData,
        author: userId,
    });
    await article.save();
    return article.populate('author', 'username name avatar');
};

// Get all articles (admin)
const getAllArticles = async (options = {}) => {
    const { page = 1, limit = 20, status, category, search } = options;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
        ];
    }

    const articles = await Article.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username name avatar');

    const total = await Article.countDocuments(query);

    return {
        data: articles,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

// Get published articles (public)
const getPublishedArticles = async (options = {}) => {
    const { page = 1, limit = 10, category, featured } = options;
    const query = { status: 'published' };

    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    const articles = await Article.find(query)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username name avatar')
        .select('-content'); // Don't include full content in list

    const total = await Article.countDocuments(query);

    return {
        data: articles,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

// Get article by ID or slug
const getArticleById = async (idOrSlug, incrementView = false) => {
    let article;

    // Check if it's a valid ObjectId
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        article = await Article.findById(idOrSlug).populate('author', 'username name avatar');
    } else {
        article = await Article.findOne({ slug: idOrSlug }).populate('author', 'username name avatar');
    }

    if (!article) {
        throw new Error('Không tìm thấy bài viết');
    }

    // Increment view count for published articles
    if (incrementView && article.status === 'published') {
        article.viewCount += 1;
        await article.save();
    }

    return article;
};

// Update article
const updateArticle = async (id, updateData) => {
    const article = await Article.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('author', 'username name avatar');

    if (!article) {
        throw new Error('Không tìm thấy bài viết');
    }

    return article;
};

// Delete article
const deleteArticle = async (id) => {
    const article = await Article.findByIdAndDelete(id);
    if (!article) {
        throw new Error('Không tìm thấy bài viết');
    }
    return article;
};

// Publish article
const publishArticle = async (id) => {
    const article = await Article.findById(id);
    if (!article) {
        throw new Error('Không tìm thấy bài viết');
    }

    article.status = 'published';
    article.publishedAt = new Date();
    await article.save();

    return article.populate('author', 'username name avatar');
};

// Archive article
const archiveArticle = async (id) => {
    const article = await Article.findById(id);
    if (!article) {
        throw new Error('Không tìm thấy bài viết');
    }

    article.status = 'archived';
    await article.save();

    return article.populate('author', 'username name avatar');
};

// Get featured articles
const getFeaturedArticles = async (limit = 5) => {
    return Article.find({ status: 'published', featured: true })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .populate('author', 'username name avatar')
        .select('-content');
};

// Get latest articles
const getLatestArticles = async (limit = 6) => {
    return Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .populate('author', 'username name avatar')
        .select('-content');
};

module.exports = {
    createArticle,
    getAllArticles,
    getPublishedArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    publishArticle,
    archiveArticle,
    getFeaturedArticles,
    getLatestArticles,
};
