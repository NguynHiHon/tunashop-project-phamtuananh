import React from 'react'
import { Container, Box, Typography, Card, Button, Divider } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Grid from '@mui/material/GridLegacy';
export default function FranchisePage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#f26522', mb: 2 }}>
                    CHÍNH SÁCH NHƯỢNG QUYỀN TUNASHOP
                </Typography>
                <Typography variant="h6" sx={{ color: '#666' }}>
                    Cơ hội đầu tư sinh lời cùng thương hiệu uy tín trong lĩnh vực thể thao
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 4, mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#f26522' }}>
                            I. GIỚI THIỆU CHUNG
                        </Typography>
                        <Typography paragraph>
                            TunaShop là thương hiệu hàng đầu trong lĩnh vực kinh doanh dụng cụ thể thao, đặc biệt chuyên sâu về các sản phẩm cầu lông, tennis và các môn thể thao vợt. Với nhiều năm kinh nghiệm và uy tín trên thị trường, chúng tôi đang mở rộng hệ thống nhượng quyền trên toàn quốc.
                        </Typography>
                        <Typography paragraph>
                            Chương trình nhượng quyền TunaShop được thiết kế dành cho các nhà đầu tư mong muốn kinh doanh trong lĩnh vực thể thao với sự hỗ trợ toàn diện từ công ty mẹ, đảm bảo tính bền vững và khả năng sinh lời cao.
                        </Typography>
                    </Card>

                    <Card sx={{ p: 4, mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#f26522' }}>
                            II. ƯU ĐIỂM KHI THAM GIA NHƯỢNG QUYỀN
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
                                    <Typography sx={{ fontWeight: 700, mb: 1 }}>🏆 Thương hiệu uy tín</Typography>
                                    <Typography variant="body2">Sử dụng thương hiệu TunaShop đã được khẳng định trên thị trường</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
                                    <Typography sx={{ fontWeight: 700, mb: 1 }}>📚 Đào tạo chuyên sâu</Typography>
                                    <Typography variant="body2">Chương trình đào tạo toàn diện về vận hành, bán hàng và quản lý</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
                                    <Typography sx={{ fontWeight: 700, mb: 1 }}>🛒 Nguồn cung ổn định</Typography>
                                    <Typography variant="body2">Đảm bảo nguồn hàng chính hãng với giá ưu đãi tốt nhất</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
                                    <Typography sx={{ fontWeight: 700, mb: 1 }}>📈 Marketing chuyên nghiệp</Typography>
                                    <Typography variant="body2">Hỗ trợ marketing, quảng cáo từ online đến offline</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>

                    <Card sx={{ p: 4, mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#f26522' }}>
                            III. ĐIỀU KIỆN VÀ YÊU CẦU
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Yêu cầu về vốn:</Typography>
                        <ul>
                            <li>Vốn đầu tư ban đầu: 500 triệu - 1 tỷ VNĐ (tùy quy mô cửa hàng)</li>
                            <li>Vốn lưu động: 200-300 triệu VNĐ</li>
                            <li>Phí nhượng quyền: 50-100 triệu VNĐ</li>
                        </ul>

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>Yêu cầu về mặt bằng:</Typography>
                        <ul>
                            <li>Diện tích: tối thiểu 80m², lý tưởng 120-200m²</li>
                            <li>Vị trí: mặt tiền đường lớn, khu vực đông dân cư hoặc gần khu thể thao</li>
                            <li>Thuê dài hạn tối thiểu 5 năm</li>
                        </ul>

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>Yêu cầu khác:</Typography>
                        <ul>
                            <li>Cam kết vận hành tối thiểu 3 năm</li>
                            <li>Tuân thủ nghiêm ngặt các quy định về thiết kế và vận hành</li>
                            <li>Có kinh nghiệm kinh doanh hoặc đam mê thể thao</li>
                        </ul>
                    </Card>

                    <Card sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#f26522' }}>
                            IV. QUYỀN LỢI CỦA ĐỐI TÁC
                        </Typography>
                        <ul>
                            <li><strong>Bảo vệ vùng độc quyền:</strong> Cam kết không mở thêm cửa hàng trong bán kính 3km</li>
                            <li><strong>Hỗ trợ thiết kế:</strong> Miễn phí thiết kế và setup cửa hàng theo tiêu chuẩn TunaShop</li>
                            <li><strong>Đào tạo nhân sự:</strong> Đào tạo miễn phí cho chủ cửa hàng và 2-3 nhân viên</li>
                            <li><strong>Hỗ trợ marketing:</strong> Các chương trình khuyến mãi, quảng cáo chung</li>
                            <li><strong>Chính sách giá ưu đãi:</strong> Giảm 5-15% so với giá bán lẻ tùy theo sản phẩm</li>
                        </ul>
                    </Card>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            ĐĂNG KÝ NHƯỢNG QUYỀN
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Để được tư vấn chi tiết về chương trình nhượng quyền, vui lòng liên hệ:
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: 600 }}>📞 Hotline:</Typography>
                            <Typography>1900 1234</Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: 600 }}>📧 Email:</Typography>
                            <Typography>franchise@tunashop.vn</Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600 }}>📍 Địa chỉ:</Typography>
                            <Typography>123 Đường ABC, Quận XYZ, TP.HCM</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mb: 1 }}
                            href="mailto:franchise@tunashop.vn"
                        >
                            Gửi Email Đăng Ký
                        </Button>

                        <Button
                            variant="outlined"
                            fullWidth
                            component={RouterLink}
                            to="/contact"
                        >
                            Liên Hệ Trực Tiếp
                        </Button>

                        <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                            Chúng tôi sẽ phản hồi trong vòng 24h
                        </Typography>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}
