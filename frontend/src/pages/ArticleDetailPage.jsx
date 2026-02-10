import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Box, Container, Typography, Chip, Skeleton, Breadcrumbs, Link,
    Paper, Avatar, Divider, Card, CardMedia, CardContent, CardActionArea,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import * as articleService from '../services/articleService';

const categoryConfig = {
    'tin-tuc': { label: 'Tin tức', color: '#00a651' },
    'review': { label: 'Review', color: '#2196F3' },
    'meo-hay': { label: 'Mẹo hay', color: '#9c27b0' },
    'kien-thuc': { label: 'Kiến thức', color: '#f26522' },
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Extract YouTube video ID from URL
const getYoutubeVideoId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
};

export default function ArticleDetailPage() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await articleService.getArticleBySlug(slug);
                setArticle(response.data);

                // Fetch related articles
                if (response.data?.category) {
                    const relatedResponse = await articleService.getPublishedArticles({
                        category: response.data.category,
                        limit: 4,
                    });
                    // Filter out current article
                    setRelatedArticles(
                        (relatedResponse.data || []).filter(a => a._id !== response.data._id).slice(0, 3)
                    );
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Không tìm thấy bài viết');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
                <Container maxWidth="lg">
                    <Skeleton variant="text" width={300} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, mb: 3 }} />
                    <Skeleton variant="text" height={50} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="80%" />
                </Container>
            </Box>
        );
    }

    if (error || !article) {
        return (
            <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
                <Container maxWidth="lg">
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="h5" color="error" gutterBottom>
                            {error || 'Không tìm thấy bài viết'}
                        </Typography>
                        <Link component={RouterLink} to="/news" sx={{ color: '#f26522' }}>
                            ← Quay lại danh sách tin tức
                        </Link>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const youtubeVideoId = getYoutubeVideoId(article.videoUrl);

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Breadcrumbs */}
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                    <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" />
                        Trang chủ
                    </Link>
                    <Link component={RouterLink} to="/news" underline="hover" color="inherit">
                        Tin tức
                    </Link>
                    <Typography color="text.primary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {article.title}
                    </Typography>
                </Breadcrumbs>

                <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    {/* Featured Image */}
                    <Box sx={{ position: 'relative' }}>
                        <Box
                            component="img"
                            src={article.thumbnail}
                            alt={article.title}
                            sx={{
                                width: '100%',
                                height: { xs: 250, md: 450 },
                                objectFit: 'cover',
                            }}
                        />
                        <Chip
                            label={categoryConfig[article.category]?.label || article.category}
                            sx={{
                                position: 'absolute',
                                top: 20,
                                left: 20,
                                bgcolor: categoryConfig[article.category]?.color || '#f26522',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                px: 1,
                            }}
                        />
                    </Box>

                    {/* Article Content */}
                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                        {/* Title */}
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: '#222',
                                mb: 3,
                                fontSize: { xs: '1.5rem', md: '2.2rem' },
                                lineHeight: 1.3,
                            }}
                        >
                            {article.title}
                        </Typography>

                        {/* Meta Info */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#f26522' }}>
                                    <PersonIcon fontSize="small" />
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>
                                    {article.author?.name || article.author?.username || 'Admin'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarMonthIcon sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(article.publishedAt || article.createdAt)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <VisibilityIcon sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {article.viewCount || 0} lượt xem
                                </Typography>
                            </Box>
                        </Box>

                        {/* Excerpt */}
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#555',
                                fontWeight: 500,
                                fontStyle: 'italic',
                                mb: 4,
                                p: 3,
                                bgcolor: '#f5f5f5',
                                borderLeft: '4px solid #f26522',
                                borderRadius: 1,
                            }}
                        >
                            {article.excerpt}
                        </Typography>

                        {/* YouTube Video */}
                        {youtubeVideoId && (
                            <Box
                                sx={{
                                    mb: 4,
                                    position: 'relative',
                                    paddingTop: '56.25%',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                }}
                            >
                                <iframe
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }}
                                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                    title="YouTube video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </Box>
                        )}

                        {/* Main Content */}
                        <Box
                            sx={{
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                '& img': {
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: 2,
                                    my: 2,
                                },
                                '& p': {
                                    mb: 2,
                                    lineHeight: 1.8,
                                    fontSize: '1.05rem',
                                    color: '#333',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                },
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                    mt: 4,
                                    mb: 2,
                                    fontWeight: 700,
                                    color: '#222',
                                },
                                '& h2': { fontSize: '1.5rem' },
                                '& h3': { fontSize: '1.3rem' },
                                '& ul, & ol': {
                                    pl: 4,
                                    mb: 2,
                                    '& li': {
                                        mb: 1,
                                        lineHeight: 1.7,
                                    },
                                },
                                '& blockquote': {
                                    borderLeft: '4px solid #f26522',
                                    pl: 3,
                                    py: 1,
                                    my: 3,
                                    bgcolor: '#fff8f5',
                                    fontStyle: 'italic',
                                    color: '#555',
                                    borderRadius: 1,
                                },
                                '& a': {
                                    color: '#f26522',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                },
                                '& pre, & code': {
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 1,
                                    p: 0.5,
                                    fontFamily: 'monospace',
                                },
                                '& pre': {
                                    p: 2,
                                    overflow: 'auto',
                                },
                                '& table': {
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    my: 2,
                                    '& th, & td': {
                                        border: '1px solid #ddd',
                                        p: 1.5,
                                        textAlign: 'left',
                                    },
                                    '& th': {
                                        bgcolor: '#f5f5f5',
                                        fontWeight: 700,
                                    },
                                },
                                // Video embed in content
                                '& iframe': {
                                    maxWidth: '100%',
                                    borderRadius: 2,
                                    my: 2,
                                },
                                '& .ql-video': {
                                    width: '100%',
                                    minHeight: 400,
                                },
                            }}
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        <Divider sx={{ my: 4 }} />

                        {/* Tags */}
                        {article.tags?.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <LocalOfferIcon sx={{ color: '#666' }} />
                                {article.tags.map((tag, idx) => (
                                    <Chip
                                        key={idx}
                                        label={tag}
                                        size="small"
                                        sx={{
                                            bgcolor: '#f0f0f0',
                                            '&:hover': { bgcolor: '#e0e0e0' },
                                        }}
                                        component={RouterLink}
                                        to={`/news?tag=${encodeURIComponent(tag)}`}
                                        clickable
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <Box sx={{ mt: 6 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                position: 'relative',
                                display: 'inline-block',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -8,
                                    left: 0,
                                    width: 50,
                                    height: 3,
                                    bgcolor: '#f26522',
                                    borderRadius: 2,
                                },
                            }}
                        >
                            Bài viết liên quan
                        </Typography>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                gap: 3,
                            }}
                        >
                            {relatedArticles.map((related) => (
                                <Card
                                    key={related._id}
                                    sx={{
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        transition: 'transform 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                        },
                                    }}
                                >
                                    <CardActionArea component={RouterLink} to={`/news/${related.slug}`}>
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={related.thumbnail}
                                            alt={related.title}
                                        />
                                        <CardContent>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={600}
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    minHeight: 48,
                                                }}
                                            >
                                                {related.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(related.publishedAt)}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
