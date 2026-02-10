import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardMedia, CardContent, CardActionArea, Tabs, Tab } from '@mui/material';
import { Link } from 'react-router-dom';

// Categories organized by sport
const sportCategories = {
    badminton: {
        name: 'Cầu lông',
        icon: '🏸',
        color: '#f26522',
        items: [
            { id: 1, name: 'Vợt cầu lông', image: '/sale-1.png', link: '/category/vot-cau-long' },
            { id: 2, name: 'Giày cầu lông', image: '/sale-2.png', link: '/category/giay-cau-long' },
            { id: 3, name: 'Áo cầu lông', image: '/sale-3.png', link: '/category/ao-cau-long' },
            { id: 4, name: 'Quần cầu lông', image: '/sale-1.png', link: '/category/quan-cau-long' },
            { id: 5, name: 'Balo túi vợt', image: '/sale-2.png', link: '/category/balo-tui-vot' },
            { id: 6, name: 'Phụ kiện cầu lông', image: '/sale-3.png', link: '/category/phu-kien-cau-long' },
            { id: 7, name: 'Cầu lông', image: '/sale-1.png', link: '/category/cau' },
            { id: 8, name: 'Xem tất cả', image: '/sale-2.png', link: '/category/cau-long' },
        ],
    },
    tennis: {
        name: 'Tennis',
        icon: '🎾',
        color: '#4CAF50',
        items: [
            { id: 1, name: 'Vợt tennis', image: '/sale-1.png', link: '/category/vot-tennis' },
            { id: 2, name: 'Giày tennis', image: '/sale-2.png', link: '/category/giay-tennis' },
            { id: 3, name: 'Áo tennis', image: '/sale-3.png', link: '/category/ao-tennis' },
            { id: 4, name: 'Quần tennis', image: '/sale-1.png', link: '/category/quan-tennis' },
            { id: 5, name: 'Balo túi vợt', image: '/sale-2.png', link: '/category/balo-tennis' },
            { id: 6, name: 'Phụ kiện tennis', image: '/sale-3.png', link: '/category/phu-kien-tennis' },
            { id: 7, name: 'Bóng tennis', image: '/sale-1.png', link: '/category/bong-tennis' },
            { id: 8, name: 'Xem tất cả', image: '/sale-2.png', link: '/category/tennis' },
        ],
    },
    pickleball: {
        name: 'Pickleball',
        icon: '🏓',
        color: '#2196F3',
        items: [
            { id: 1, name: 'Vợt pickleball', image: '/sale-1.png', link: '/category/vot-pickleball' },
            { id: 2, name: 'Giày pickleball', image: '/sale-2.png', link: '/category/giay-pickleball' },
            { id: 3, name: 'Áo pickleball', image: '/sale-3.png', link: '/category/ao-pickleball' },
            { id: 4, name: 'Quần pickleball', image: '/sale-1.png', link: '/category/quan-pickleball' },
            { id: 5, name: 'Balo túi vợt', image: '/sale-2.png', link: '/category/balo-pickleball' },
            { id: 6, name: 'Phụ kiện', image: '/sale-3.png', link: '/category/phu-kien-pickleball' },
            { id: 7, name: 'Bóng pickleball', image: '/sale-1.png', link: '/category/bong-pickleball' },
            { id: 8, name: 'Xem tất cả', image: '/sale-2.png', link: '/category/pickleball' },
        ],
    },
};

const sportKeys = ['badminton', 'tennis', 'pickleball'];

export default function CategoryGrid() {
    const [activeSport, setActiveSport] = useState(0);
    const currentSport = sportCategories[sportKeys[activeSport]];

    const handleSportChange = (event, newValue) => {
        setActiveSport(newValue);
    };

    return (
        <Box
            sx={{
                py: 5,
                background: `linear-gradient(135deg, ${currentSport.color} 0%, ${currentSport.color}cc 100%)`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.4s ease',
            }}
        >
            {/* Decorative diagonal lines */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 50px,
            rgba(255,255,255,0.03) 50px,
            rgba(255,255,255,0.03) 100px
          )`,
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: '#fff',
                            mb: 1,
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                        }}
                    >
                        Danh mục sản phẩm
                    </Typography>
                    <Box
                        sx={{
                            width: 80,
                            height: 4,
                            bgcolor: '#fff',
                            mx: 'auto',
                            borderRadius: 2,
                        }}
                    />
                </Box>

                {/* Sport Tabs */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Tabs
                        value={activeSport}
                        onChange={handleSportChange}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            p: 0.5,
                            '& .MuiTab-root': {
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: 600,
                                fontSize: { xs: '0.9rem', md: '1rem' },
                                minHeight: 48,
                                px: { xs: 2, md: 4 },
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&.Mui-selected': {
                                    color: currentSport.color,
                                    bgcolor: '#fff',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                display: 'none',
                            },
                        }}
                    >
                        {sportKeys.map((key) => (
                            <Tab
                                key={key}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span style={{ fontSize: '1.2rem' }}>{sportCategories[key].icon}</span>
                                        <span>{sportCategories[key].name}</span>
                                    </Box>
                                }
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Categories Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(3, 1fr)',
                            md: 'repeat(4, 1fr)',
                        },
                        gap: 2,
                    }}
                >
                    {currentSport.items.map((cat) => (
                        <Card
                            key={cat.id}
                            sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                bgcolor: '#fff',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                                    '& .category-overlay': {
                                        opacity: 1,
                                    },
                                    '& .category-image': {
                                        transform: 'scale(1.1)',
                                    },
                                },
                            }}
                        >
                            {/* Diagonal ribbon for special categories */}
                            {cat.id <= 4 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        left: -30,
                                        bgcolor: '#00a651',
                                        color: '#fff',
                                        px: 4,
                                        py: 0.3,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        transform: 'rotate(-45deg)',
                                        zIndex: 2,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    HOT
                                </Box>
                            )}

                            <CardActionArea component={Link} to={cat.link}>
                                <Box sx={{ overflow: 'hidden' }}>
                                    <CardMedia
                                        component="img"
                                        image={cat.image}
                                        alt={cat.name}
                                        className="category-image"
                                        sx={{
                                            height: { xs: 120, sm: 140, md: 160 },
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease',
                                        }}
                                    />
                                </Box>

                                {/* Hover overlay */}
                                <Box
                                    className="category-overlay"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        bgcolor: `${currentSport.color}33`,
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        pointerEvents: 'none',
                                    }}
                                />

                                <CardContent
                                    sx={{
                                        textAlign: 'center',
                                        py: 1.5,
                                        bgcolor: '#fff',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#333',
                                            fontSize: { xs: '0.9rem', md: '1rem' },
                                        }}
                                    >
                                        {cat.name}
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
