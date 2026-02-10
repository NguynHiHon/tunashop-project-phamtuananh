import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardMedia, CardContent, CardActionArea, Chip, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import * as articleService from '../../services/articleService';

const categoryColors = {
    'tin-tuc': '#00a651',
    'review': '#2196F3',
    'meo-hay': '#9c27b0',
    'kien-thuc': '#f26522',
};

const categoryLabels = {
    'tin-tuc': 'Tin tức',
    'review': 'Review',
    'meo-hay': 'Mẹo hay',
    'kien-thuc': 'Kiến thức',
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function NewsSection() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await articleService.getLatestArticles(4);
                setArticles(response.data || []);
            } catch (error) {
                console.error('Failed to fetch articles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <Box sx={{ py: 6, bgcolor: '#f8f9fa' }}>
                <Container maxWidth="xl">
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Bản tin mới đăng</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <Box key={i}>
                                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
                                <Skeleton variant="text" sx={{ mt: 2 }} />
                                <Skeleton variant="text" width="60%" />
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>
        );
    }

    // No articles
    if (articles.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: 6, bgcolor: '#f8f9fa' }}>
            <Container maxWidth="xl">
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: '#333',
                                fontSize: { xs: '1.4rem', md: '1.8rem' },
                                position: 'relative',
                                display: 'inline-block',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -8,
                                    left: 0,
                                    width: 60,
                                    height: 3,
                                    bgcolor: '#f26522',
                                    borderRadius: 2,
                                },
                            }}
                        >
                            Bản tin mới đăng
                        </Typography>
                    </Box>
                    <Box
                        component={Link}
                        to="/news"
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            alignItems: 'center',
                            gap: 0.5,
                            color: '#f26522',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            transition: 'gap 0.3s',
                            '&:hover': { gap: 1 },
                        }}
                    >
                        Xem tất cả <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </Box>
                </Box>

                {/* News Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                        },
                        gap: 3,
                    }}
                >
                    {articles.map((article) => (
                        <Card
                            key={article._id}
                            sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '1px solid #eee',
                                boxShadow: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-6px)',
                                    boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                                    '& .news-image': {
                                        transform: 'scale(1.08)',
                                    },
                                },
                            }}
                        >
                            <CardActionArea component={Link} to={`/news/${article.slug}`}>
                                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                    <CardMedia
                                        component="img"
                                        image={article.thumbnail || '/sale-1.png'}
                                        alt={article.title}
                                        className="news-image"
                                        sx={{
                                            height: 180,
                                            objectFit: 'cover',
                                            transition: 'transform 0.4s ease',
                                        }}
                                    />
                                    <Chip
                                        label={categoryLabels[article.category] || article.category}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            bgcolor: categoryColors[article.category] || '#f26522',
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <CalendarMonthIcon sx={{ fontSize: 14, color: '#999' }} />
                                        <Typography variant="caption" sx={{ color: '#999' }}>
                                            {formatDate(article.publishedAt || article.createdAt)}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#333',
                                            mb: 1,
                                            lineHeight: 1.4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontSize: '0.95rem',
                                            '&:hover': { color: '#f26522' },
                                        }}
                                    >
                                        {article.title}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#777',
                                            lineHeight: 1.6,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {article.excerpt}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
