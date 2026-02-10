import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const banners = [
    {
        id: 1,
        image: '/banner-1.png',
        title: 'VỢT CẦU LÔNG CHÍNH HÃNG',
        subtitle: 'Chất lượng cao - Giá tốt nhất',
        link: '/products?category=vot',
    },
    {
        id: 2,
        image: '/banner-2.png',
        title: 'GIÀY CẦU LÔNG YONEX',
        subtitle: 'Bảo vệ đôi chân của bạn',
        link: '/products?category=giay',
    },
    {
        id: 3,
        image: '/banner-3.png',
        title: 'PHỤ KIỆN THỂ THAO',
        subtitle: 'Đầy đủ - Đa dạng - Chất lượng',
        link: '/products?category=phukien',
    },
];

export default function HeroBanner() {
    return (
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                effect="fade"
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation
                loop
                style={{
                    '--swiper-pagination-color': '#f26522',
                    '--swiper-navigation-color': '#f26522',
                }}
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: { xs: 300, sm: 400, md: 500, lg: 550 },
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                component="img"
                                src={banner.image}
                                alt={banner.title}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />

                            {/* Overlay with gradient */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
                                }}
                            />

                            {/* Content */}
                            <Container
                                maxWidth="xl"
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 0,
                                    right: 0,
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <Box sx={{ maxWidth: 600, color: '#fff', px: { xs: 2, md: 4 } }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                                            mb: 1,
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        {banner.title}
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 400,
                                            fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.3rem' },
                                            mb: 3,
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        {banner.subtitle}
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to={banner.link}
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            bgcolor: '#f26522',
                                            color: '#fff',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            '&:hover': {
                                                bgcolor: '#e05a1c',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        XEM NGAY
                                    </Button>
                                </Box>
                            </Container>
                        </Box>
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
}
