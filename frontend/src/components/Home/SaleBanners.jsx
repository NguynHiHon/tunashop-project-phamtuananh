import React from 'react';
import { Box, Container, Grid, Card, CardMedia, CardActionArea, Typography, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const banners = [
    {
        id: 1,
        image: '/sale-1.png',
        link: '/sale/1',
        alt: 'Sale Banner 1',
    },
    {
        id: 2,
        image: '/sale-2.png',
        link: '/sale/2',
        alt: 'Sale Banner 2',
    },
    {
        id: 3,
        image: '/sale-3.png',
        link: '/sale/3',
        alt: 'Sale Banner 3',
    },
];

export default function SaleBanners() {
    return (
        <Box
            sx={{
                py: 5,
                background: 'linear-gradient(180deg, #fff5f0 0%, #fff 100%)',
            }}
        >
            <Container maxWidth="xl">
                {/* SALE OFF Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 2 }}>
                    <Box sx={{ flex: 1, height: 2, background: 'linear-gradient(90deg, transparent, #f26522)' }} />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 4,
                            py: 1,
                            bgcolor: '#f26522',
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(242, 101, 34, 0.35)',
                        }}
                    >
                        <LocalFireDepartmentIcon sx={{ color: '#FFD700', fontSize: 32, animation: 'pulse 1.5s infinite' }} />
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: '#fff',
                                fontSize: { xs: '1.3rem', md: '1.8rem' },
                                letterSpacing: 3,
                                textTransform: 'uppercase',
                            }}
                        >
                            Sale Off
                        </Typography>
                        <LocalFireDepartmentIcon sx={{ color: '#FFD700', fontSize: 32, animation: 'pulse 1.5s infinite' }} />
                    </Box>
                    <Box sx={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #f26522, transparent)' }} />
                </Box>

                {/* Countdown / Sub text */}
                <Typography
                    variant="body1"
                    sx={{
                        textAlign: 'center',
                        mb: 3,
                        color: '#e53935',
                        fontWeight: 600,
                        fontSize: '1rem',
                    }}
                >
                    🔥 Ưu đãi cực sốc - Số lượng có hạn!
                </Typography>

                <Grid container spacing={2}>
                    {banners.map((banner) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={banner.id}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    border: '2px solid transparent',
                                    boxShadow: '0 4px 16px rgba(242, 101, 34, 0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-6px) scale(1.02)',
                                        boxShadow: '0 12px 32px rgba(242, 101, 34, 0.25)',
                                        border: '2px solid #f26522',
                                    },
                                }}
                            >
                                <CardActionArea component={Link} to={banner.link}>
                                    <CardMedia
                                        component="img"
                                        image={banner.image}
                                        alt={banner.alt}
                                        sx={{
                                            height: { xs: 160, sm: 190, md: 220 },
                                            objectFit: 'cover',
                                        }}
                                    />
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Pulse animation keyframes */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
            `}</style>
        </Box>
    );
}
