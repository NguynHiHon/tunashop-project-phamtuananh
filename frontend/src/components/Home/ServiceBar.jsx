import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentIcon from '@mui/icons-material/Payment';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const services = [
    {
        icon: LocalShippingIcon,
        title: 'Vận chuyển TOÀN QUỐC',
        description: 'Thanh toán khi nhận hàng',
        color: '#00a651',
    },
    {
        icon: VerifiedIcon,
        title: 'Bảo đảm chất lượng',
        description: 'Sản phẩm bảo đảm chất lượng',
        color: '#f26522',
    },
    {
        icon: PaymentIcon,
        title: 'Tiện hành THANH TOÁN',
        description: 'Với nhiều phương thức',
        color: '#0066cc',
    },
    {
        icon: AutorenewIcon,
        title: 'Đổi sản phẩm mới',
        description: 'Nếu sản phẩm lỗi',
        color: '#9c27b0',
    },
];

export default function ServiceBar() {
    return (
        <Box sx={{ bgcolor: '#f9f9f9', py: 3, borderBottom: '1px solid #eee' }}>
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 2,
                    }}
                >
                    {services.map((service, index) => {
                        const IconComponent = service.icon;
                        return (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    bgcolor: 'transparent',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        bgcolor: '#fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        bgcolor: `${service.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <IconComponent sx={{ fontSize: 28, color: service.color }} />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                                            color: '#333',
                                        }}
                                    >
                                        {service.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#666',
                                            fontSize: { xs: '0.75rem', md: '0.85rem' },
                                        }}
                                    >
                                        {service.description}
                                    </Typography>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            </Container>
        </Box>
    );
}
