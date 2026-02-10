const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 500,
    },
    content: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
    }],
    videoUrl: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        enum: ['tin-tuc', 'review', 'meo-hay', 'kien-thuc'],
        default: 'tin-tuc',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
    publishedAt: {
        type: Date,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Generate slug from title before saving
articleSchema.pre('save', function () {
    if (!this.slug || this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            + '-' + Date.now().toString(36);
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

// Virtual for formatted category
articleSchema.virtual('categoryText').get(function () {
    const categoryMap = {
        'tin-tuc': 'Tin tức',
        'review': 'Review',
        'meo-hay': 'Mẹo hay',
        'kien-thuc': 'Kiến thức',
    };
    return categoryMap[this.category] || this.category;
});

// Virtual for formatted status
articleSchema.virtual('statusText').get(function () {
    const statusMap = {
        draft: 'Bản nháp',
        published: 'Đã đăng',
        archived: 'Lưu trữ',
    };
    return statusMap[this.status] || this.status;
});

articleSchema.set('toJSON', { virtuals: true });
articleSchema.set('toObject', { virtuals: true });

// Index for search
articleSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ featured: 1 });

module.exports = mongoose.model('Article', articleSchema);
