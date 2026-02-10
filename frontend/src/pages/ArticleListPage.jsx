import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, Typography, Card, CardMedia, CardContent, CardActionArea,
    Chip, Skeleton, Tabs, Tab, Pagination, Breadcrumbs, Link,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import * as articleService from '../services/articleService';

const categoryConfig = {
    'all': { label: 'Tất cả', color: '#333' },
    'tin-tuc': { label: 'Tin tức', color: '#00a651' },
    'review': { label: 'Review', color: '#2196F3' },
    'meo-hay': { label: 'Mẹo hay', color: '#9c27b0' },
    'kien-thuc': { label: 'Kiến thức', color: '#f26522' },
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default function ArticleListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const limit = 8;

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, limit };
            if (category !== 'all') {
                params.category = category;
            }
            const response = await articleService.getPublishedArticles(params);
            setArticles(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Failed to fetch articles:', error);
        } finally {
            setLoading(false);
        }
    }, [page, category]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleCategoryChange = (event, newValue) => {
        setCategory(newValue);
        setPage(1);
        if (newValue === 'all') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', newValue);
        }
        setSearchParams(searchParams);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                {/* Breadcrumbs */}
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                    <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" />
                        Trang chủ
                    </Link>
                    <Typography color="text.primary" fontWeight={600}>Tin tức</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: '#333',
                            position: 'relative',
                            display: 'inline-block',
                            mb: 2,
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
                        Tin tức & Bài viết
                    </Typography>
                </Box>

                {/* Category Tabs */}
                <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={category}
                        onChange={handleCategoryChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                            },
                            '& .Mui-selected': {
                                color: '#f26522 !important',
                            },
                            '& .MuiTabs-indicator': {
                                bgcolor: '#f26522',
                            },
                        }}
                    >
                        {Object.entries(categoryConfig).map(([key, config]) => (
                            <Tab key={key} value={key} label={config.label} />
                        ))}
                    </Tabs>
                </Box>

                {/* Articles Grid */}
                {loading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Box key={i}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                                <Skeleton variant="text" sx={{ mt: 2, fontSize: '1.2rem' }} />
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" />
                            </Box>
                        ))}
                    </Box>
                ) : articles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            Chưa có bài viết nào trong danh mục này
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
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
                                            '& .article-image': {
                                                transform: 'scale(1.08)',
                                            },
                                        },
                                    }}
                                >
                                    <CardActionArea component={RouterLink} to={`/news/${article.slug}`}>
                                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                            <CardMedia
                                                component="img"
                                                image={article.thumbnail || '/sale-1.png'}
                                                alt={article.title}
                                                className="article-image"
                                                sx={{
                                                    height: 200,
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.4s ease',
                                                }}
                                            />
                                            <Chip
                                                label={categoryConfig[article.category]?.label || article.category}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    bgcolor: categoryConfig[article.category]?.color || '#f26522',
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </Box>

                                        <CardContent sx={{ p: 2.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarMonthIcon sx={{ fontSize: 14, color: '#999' }} />
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        {formatDate(article.publishedAt || article.createdAt)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <VisibilityIcon sx={{ fontSize: 14, color: '#999' }} />
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        {article.viewCount || 0}
                                                    </Typography>
                                                </Box>
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
                                                    fontSize: '1rem',
                                                    minHeight: 44,
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
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {article.excerpt}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Box>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            fontWeight: 600,
                                        },
                                        '& .Mui-selected': {
                                            bgcolor: '#f26522 !important',
                                            color: '#fff',
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}
