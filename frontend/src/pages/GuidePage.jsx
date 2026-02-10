import React from 'react'
import { Container, Box, Typography, Card, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Grid from '@mui/material/GridLegacy';
const guideCategories = [
    {
        title: 'Hướng dẫn thanh toán',
        description: 'Tìm hiểu các phương thức thanh toán được hỗ trợ',
        path: '/guide/payment',
        icon: '💳',
        color: '#f26522'
    },
    {
        title: 'Hướng dẫn mua hàng',
        description: 'Quy trình đặt hàng từ A đến Z',
        path: '/guide/ordering',
        icon: '🛒',
        color: '#00a651'
    },
    {
        title: 'Hướng dẫn chọn vợt',
        description: 'Cách chọn vợt cầu lông phù hợp với phong cách chơi',
        path: '/guide/racket-selection',
        icon: '🏸',
        color: '#2196F3'
    },
    {
        title: 'Công nghệ sản phẩm',
        description: 'Tìm hiểu về các công nghệ tiên tiến trong sản phẩm',
        path: '/guide/technology',
        icon: '⚙️',
        color: '#9c27b0'
    }
]

export default function GuidePage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#f26522', mb: 2 }}>
                    HƯỚNG DẪN SỬ DỤNG
                </Typography>
                <Typography variant="h6" sx={{ color: '#666', maxWidth: '600px', mx: 'auto' }}>
                    Tất cả thông tin hữu ích để bạn có trải nghiệm mua sắm tốt nhất tại TunaShop
                </Typography>
            </Box>

            {/* Guide Categories */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                {guideCategories.map((guide, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{
                            p: 3,
                            height: '100%',
                            textAlign: 'center',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                bgcolor: guide.color,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h3" sx={{ color: '#fff' }}>
                                    {guide.icon}
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                {guide.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                {guide.description}
                            </Typography>
                            <Button
                                component={RouterLink}
                                to={guide.path}
                                variant="outlined"
                                sx={{ borderColor: guide.color, color: guide.color }}
                            >
                                Xem hướng dẫn
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* FAQ Section */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    CÂU HỎI THƯỜNG GẶP
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Q: TunaShop có bảo hành sản phẩm không?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                A: Tất cả sản phẩm tại TunaShop đều được bảo hành chính hãng theo quy định của từng thương hiệu, thời gian bảo hành từ 6-24 tháng tùy sản phẩm.
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Q: Tôi có thể đổi trả sản phẩm không?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                A: TunaShop hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày mua với điều kiện sản phẩm còn nguyên vẹn, chưa sử dụng.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Q: Làm sao để kiểm tra tính chính hãng của sản phẩm?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                A: Mọi sản phẩm của TunaShop đều có tem chính hãng và có thể kiểm tra qua website của hãng sản xuất hoặc liên hệ với chúng tôi.
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Q: TunaShop có dịch vụ giao hàng tận nơi không?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                A: Có, chúng tôi giao hàng toàn quốc. Miễn phí giao hàng cho đơn hàng từ 500.000đ trong nội thành và từ 1.000.000đ cho các tỉnh khác.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Contact Support */}
            <Card sx={{ p: 4, bgcolor: '#f26522', color: '#fff', textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    CẦN HỖ TRỢ THÊM?
                </Typography>
                <Typography sx={{ mb: 3 }}>
                    Đội ngũ tư vấn viên của chúng tôi sẵn sàng hỗ trợ bạn 24/7
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        sx={{ bgcolor: '#fff', color: '#f26522' }}
                        href="tel:19001234"
                    >
                        Gọi ngay: 1900 1234
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ borderColor: '#fff', color: '#fff' }}
                        component={RouterLink}
                        to="/contact"
                    >
                        Liên hệ trực tiếp
                    </Button>
                </Box>
            </Card>
        </Container>
    )
}