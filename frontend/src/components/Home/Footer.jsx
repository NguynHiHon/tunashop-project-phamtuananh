import React from 'react';
import { Box, Container, Typography, Grid, Link as MuiLink, IconButton, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const footerLinks = {
    about: {
        title: 'Về TunaShop',
        links: [
            { name: 'Giới thiệu', path: '/about' },
            { name: 'Nhượng quyền', path: '/franchise' },
            { name: 'Liên hệ', path: '/contact' },
            { name: 'Hệ thống cửa hàng', path: '/stores' },
            { name: 'Tuyển dụng', path: '/careers' },
        ],
    },
    support: {
        title: 'Hỗ trợ khách hàng',
        links: [
            { name: 'Hướng dẫn mua hàng', path: '/guide' },
            { name: 'Chính sách đổi trả', path: '/return-policy' },
            { name: 'Chính sách bảo hành', path: '/warranty' },
            { name: 'Câu hỏi thường gặp', path: '/faq' },
        ],
    },
    policy: {
        title: 'Chính sách',
        links: [
            { name: 'Chính sách vận chuyển', path: '/shipping-policy' },
            { name: 'Chính sách thanh toán', path: '/payment-policy' },
            { name: 'Chính sách bảo mật', path: '/privacy-policy' },
            { name: 'Điều khoản sử dụng', path: '/terms' },
        ],
    },
};

export default function Footer() {
    return (
        <Box sx={{ bgcolor: '#222', color: '#fff' }}>
            {/* Main Footer */}
            <Container maxWidth="xl" sx={{ py: 5 }}>
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: '#f26522',
                                mb: 2,
                            }}
                        >
                            TunaShop
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#aaa', mb: 2, lineHeight: 1.8 }}>
                            Cửa hàng thể thao hàng đầu Việt Nam, chuyên cung cấp các sản phẩm
                            cầu lông chính hãng với giá tốt nhất.
                        </Typography>

                        {/* Contact Info */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ color: '#f26522', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    1900 1234
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ color: '#f26522', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    support@tunashop.vn
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <LocationOnIcon sx={{ color: '#f26522', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#aaa' }}>
                                    123 Đường ABC, Quận XYZ, TP.HCM
                                </Typography>
                            </Box>
                        </Box>

                        {/* Social Links */}
                        <Box sx={{ mt: 2 }}>
                            <IconButton
                                sx={{
                                    color: '#fff',
                                    '&:hover': { color: '#f26522', bgcolor: 'rgba(242, 101, 34, 0.1)' },
                                }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton
                                sx={{
                                    color: '#fff',
                                    '&:hover': { color: '#f26522', bgcolor: 'rgba(242, 101, 34, 0.1)' },
                                }}
                            >
                                <YouTubeIcon />
                            </IconButton>
                            <IconButton
                                sx={{
                                    color: '#fff',
                                    '&:hover': { color: '#f26522', bgcolor: 'rgba(242, 101, 34, 0.1)' },
                                }}
                            >
                                <InstagramIcon />
                            </IconButton>
                            <IconButton
                                sx={{
                                    color: '#fff',
                                    '&:hover': { color: '#f26522', bgcolor: 'rgba(242, 101, 34, 0.1)' },
                                }}
                            >
                                <TwitterIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([key, section]) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    color: '#fff',
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: -8,
                                        left: 0,
                                        width: 40,
                                        height: 2,
                                        bgcolor: '#f26522',
                                    },
                                }}
                            >
                                {section.title}
                            </Typography>
                            <Box
                                component="ul"
                                sx={{
                                    listStyle: 'none',
                                    p: 0,
                                    m: 0,
                                    mt: 3,
                                }}
                            >
                                {section.links.map((link) => (
                                    <Box component="li" key={link.name} sx={{ mb: 1 }}>
                                        <MuiLink
                                            component={Link}
                                            to={link.path}
                                            sx={{
                                                color: '#aaa',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s',
                                                display: 'inline-block',
                                                '&:hover': {
                                                    color: '#f26522',
                                                    pl: 0.5,
                                                },
                                            }}
                                        >
                                            {link.name}
                                        </MuiLink>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Bottom Bar */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Container maxWidth="xl">
                <Box
                    sx={{
                        py: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Typography variant="body2" sx={{ color: '#888' }}>
                        © 2024 TunaShop. All rights reserved.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <MuiLink
                            component={Link}
                            to="/privacy-policy"
                            sx={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                '&:hover': { color: '#f26522' },
                            }}
                        >
                            Chính sách bảo mật
                        </MuiLink>
                        <MuiLink
                            component={Link}
                            to="/terms"
                            sx={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                '&:hover': { color: '#f26522' },
                            }}
                        >
                            Điều khoản sử dụng
                        </MuiLink>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
