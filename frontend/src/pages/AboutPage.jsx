import React from 'react'
import { Container, Box, Typography, Card, Avatar } from '@mui/material'
import Grid from '@mui/material/GridLegacy';
export default function AboutPage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#f26522', mb: 2 }}>
                    VỀ TUNASHOP
                </Typography>
                <Typography variant="h5" sx={{ color: '#666', maxWidth: '800px', mx: 'auto' }}>
                    Điểm đến tin cậy cho mọi nhu cầu thể thao của bạn
                </Typography>
            </Box>

            {/* Story Section */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    CÂU CHUYỆN CỦA CHÚNG TÔI
                </Typography>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography paragraph>
                            Được thành lập từ năm 2015, TunaShop bắt đầu từ một cửa hàng nhỏ với niềm đam mê cháy bỏng dành cho thể thao, đặc biệt là cầu lông. Chúng tôi hiểu rằng để chơi tốt một môn thể thao, việc có những dụng cụ chất lượng là vô cùng quan trọng.
                        </Typography>
                        <Typography paragraph>
                            Với phương châm "Chất lượng tạo nên sự khác biệt", TunaShop đã không ngừng phát triển và trở thành một trong những địa chỉ tin cậy hàng đầu tại Việt Nam cho các sản phẩm thể thao chất lượng cao.
                        </Typography>
                        <Typography paragraph>
                            Đến nay, chúng tôi tự hào là đối tác chính thức của nhiều thương hiệu nổi tiếng như Yonex, Victor, Lining, và nhiều thương hiệu uy tín khác.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                width: 200,
                                height: 200,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800 }}>
                                    9+
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Năm Kinh Nghiệm
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Mission & Vision */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%', bgcolor: '#f26522', color: '#fff' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                            SỨ MỆNH
                        </Typography>
                        <Typography>
                            Mang đến cho khách hàng những sản phẩm thể thao chất lượng cao nhất với giá cả hợp lý, đồng thời tạo ra một cộng đồng thể thao lành mạnh và năng động.
                        </Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%', bgcolor: '#fff', border: '2px solid #f26522' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#f26522' }}>
                            TẦM NHÌN
                        </Typography>
                        <Typography>
                            Trở thành thương hiệu dụng cụ thể thao số 1 tại Việt Nam, được khách hàng tin tưởng và lựa chọn hàng đầu trong mọi nhu cầu thể thao.
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Values */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    GIÁ TRỊ CỐT LÕI
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h4" sx={{ color: '#fff' }}>🏆</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                CHẤT LƯỢNG
                            </Typography>
                            <Typography variant="body2">
                                Cam kết cung cấp sản phẩm chính hãng, chất lượng cao
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h4" sx={{ color: '#fff' }}>💎</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                UY TÍN
                            </Typography>
                            <Typography variant="body2">
                                Xây dựng lòng tin với khách hàng qua từng giao dịch
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h4" sx={{ color: '#fff' }}>🤝</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                TẬN TÂM
                            </Typography>
                            <Typography variant="body2">
                                Phục vụ khách hàng với sự tận tình và chuyên nghiệp
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h4" sx={{ color: '#fff' }}>🚀</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                TIẾN TỚI
                            </Typography>
                            <Typography variant="body2">
                                Không ngừng đổi mới và phát triển
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Achievements */}
            <Card sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    THÀNH TỰU NỔI BẬT
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#f26522' }}>15+</Typography>
                            <Typography variant="h6">Cửa hàng</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>Trên toàn quốc</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#f26522' }}>50K+</Typography>
                            <Typography variant="h6">Khách hàng</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>Tin tưởng lựa chọn</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#f26522' }}>100+</Typography>
                            <Typography variant="h6">Sản phẩm</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>Chính hãng chất lượng</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#f26522' }}>98%</Typography>
                            <Typography variant="h6">Hài lòng</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>Khách hàng đánh giá</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
        </Container>
    )
}