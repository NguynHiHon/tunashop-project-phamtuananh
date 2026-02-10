import React from 'react'
import { Container, Box, Typography, Card, Chip, Alert } from '@mui/material'
import Grid from '@mui/material/GridLegacy';
export default function RacketSelectionGuidePage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#f26522', mb: 1 }}>
                    HƯỚNG DẪN CHỌN VỢT CẦU LÔNG
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    Cách chọn vợt cầu lông phù hợp với trình độ và phong cách chơi của bạn
                </Typography>
            </Box>

            {/* Player Level */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    CHỌN VỢT THEO TRÌNH ĐỘ
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%', bgcolor: '#e8f5e8' }}>
                            <Chip label="Người mới bắt đầu" sx={{ bgcolor: '#4caf50', color: '#fff', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Beginner (0-6 tháng)
                            </Typography>
                            <Typography paragraph>
                                <strong>Đặc điểm vợt:</strong><br />
                                • Nhẹ (75-85g)<br />
                                • Cán mềm (Flexible)<br />
                                • Cân bằng đều<br />
                                • Giá: 500K - 1.5M
                            </Typography>
                            <Typography>
                                <strong>Thương hiệu phù hợp:</strong><br />
                                Yonex Arcsaber, Victor Thruster K series
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%', bgcolor: '#fff3e0' }}>
                            <Chip label="Trình độ trung bình" sx={{ bgcolor: '#ff9800', color: '#fff', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Intermediate (6 tháng - 2 năm)
                            </Typography>
                            <Typography paragraph>
                                <strong>Đặc điểm vợt:</strong><br />
                                • Trung bình (80-90g)<br />
                                • Cán medium flex<br />
                                • Hơi nặng đầu<br />
                                • Giá: 1.5M - 3M
                            </Typography>
                            <Typography>
                                <strong>Thương hiệu phù hợp:</strong><br />
                                Yonex Voltric, Victor Jetspeed S
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%', bgcolor: '#ffebee' }}>
                            <Chip label="Chuyên nghiệp" sx={{ bgcolor: '#f44336', color: '#fff', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Advanced (2+ năm)
                            </Typography>
                            <Typography paragraph>
                                <strong>Đặc điểm vợt:</strong><br />
                                • Nặng (85-95g)<br />
                                • Cán cứng (Stiff)<br />
                                • Đa dạng cân bằng<br />
                                • Giá: 3M+
                            </Typography>
                            <Typography>
                                <strong>Thương hiệu phù hợp:</strong><br />
                                Yonex Astrox, Victor TK series
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Card>

            {/* Playing Style */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    CHỌN VỢT THEO PHONG CÁCH CHƠI
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2196f3' }}>
                                🏸 Tấn công (Attack)
                            </Typography>
                            <Typography paragraph>
                                <strong>Đặc điểm:</strong><br />
                                • Nặng đầu (Head Heavy)<br />
                                • Cán cứng (Stiff)<br />
                                • Tạo lực đập mạnh<br />
                                • Phù hợp người có cơ tay tốt
                            </Typography>
                            <Typography sx={{ color: '#666' }}>
                                <strong>Sản phẩm gợi ý:</strong><br />
                                Yonex Astrox 88D, Victor TK-9900
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#4caf50' }}>
                                🏃 Phòng thủ (Defense)
                            </Typography>
                            <Typography paragraph>
                                <strong>Đặc điểm:</strong><br />
                                • Nhẹ đầu (Head Light)<br />
                                • Cán mềm (Flexible)<br />
                                • Di chuyển nhanh<br />
                                • Dễ điều khiển cầu
                            </Typography>
                            <Typography sx={{ color: '#666' }}>
                                <strong>Sản phẩm gợi ý:</strong><br />
                                Yonex Arcsaber 11, Victor JS-12
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                                ⚖️ Cân bằng (All-around)
                            </Typography>
                            <Typography paragraph>
                                <strong>Đặc điểm:</strong><br />
                                • Cân bằng đều<br />
                                • Cán medium<br />
                                • Linh hoạt<br />
                                • Phù hợp đa phong cách
                            </Typography>
                            <Typography sx={{ color: '#666' }}>
                                <strong>Sản phẩm gợi ý:</strong><br />
                                Yonex Voltric Z-Force, Victor TK-15
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ff5722' }}>
                                ⚡ Tốc độ (Speed)
                            </Typography>
                            <Typography paragraph>
                                <strong>Đặc điểm:</strong><br />
                                • Rất nhẹ đầu<br />
                                • Khung mảnh<br />
                                • Swing speed cao<br />
                                • Phù hợp chơi đôi
                            </Typography>
                            <Typography sx={{ color: '#666' }}>
                                <strong>Sản phẩm gợi ý:</strong><br />
                                Yonex Duora, Victor Jetspeed S
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Card>

            {/* Technical Specifications */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    THÔNG SỐ KỸ THUẬT QUAN TRỌNG
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                            ⚖️ Trọng lượng (Weight)
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Chip label="2U (90-94g)" sx={{ mr: 1, mb: 1 }} />
                            <Typography variant="body2" component="span">Nặng - Cho người mạnh</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Chip label="3U (85-89g)" color="primary" sx={{ mr: 1, mb: 1 }} />
                            <Typography variant="body2" component="span">Phổ biến nhất</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Chip label="4U (80-84g)" sx={{ mr: 1, mb: 1 }} />
                            <Typography variant="body2" component="span">Nhẹ - Dễ điều khiển</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Chip label="5U (75-79g)" sx={{ mr: 1, mb: 1 }} />
                            <Typography variant="body2" component="span">Rất nhẹ - Người mới</Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                            🎯 Cân bằng (Balance)
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>Head Heavy (Nặng đầu)</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>290mm+ - Tạo lực đập mạnh</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>Even Balance (Cân bằng)</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>285-290mm - Linh hoạt</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>Head Light (Nhẹ đầu)</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>285mm- - Nhanh nhẹn</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        <strong>Lưu ý:</strong> Độ cứng cán (Shaft Flex) cũng rất quan trọng.
                        Cán mềm (Flexible) dễ chơi cho người mới, cán cứng (Stiff) cho người có kỹ thuật tốt.
                    </Typography>
                </Alert>
            </Card>

            {/* Price Guide */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    HƯỚNG DẪN GIÁ THAM KHẢO
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ p: 2, bgcolor: '#e8f5e8', textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                500K - 1.5M
                            </Typography>
                            <Typography variant="body2">
                                Vợt nhập môn<br />
                                Chất lượng tốt cho người mới
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                                1.5M - 3M
                            </Typography>
                            <Typography variant="body2">
                                Vợt trung cấp<br />
                                Hiệu năng và độ bền tốt
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ p: 2, bgcolor: '#f3e5f5', textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                                3M - 5M
                            </Typography>
                            <Typography variant="body2">
                                Vợt cao cấp<br />
                                Công nghệ tiên tiến
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ p: 2, bgcolor: '#ffebee', textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                                5M+
                            </Typography>
                            <Typography variant="body2">
                                Vợt chuyên nghiệp<br />
                                Đỉnh cao công nghệ
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Card>

            {/* Tips */}
            <Card sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    NHỮNG LƯU Ý QUAN TRỌNG
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>Thử vợt trước khi mua</Typography>
                    <Typography variant="body2">Nếu có thể, hãy thử cầm và swing vợt để cảm nhận trọng lượng và độ cứng</Typography>
                </Alert>
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>Chọn theo khả năng hiện tại</Typography>
                    <Typography variant="body2">Đừng chọn vợt quá cao cấp so với trình độ, có thể gây chấn thương</Typography>
                </Alert>
                <Alert severity="success">
                    <Typography sx={{ fontWeight: 600 }}>Tham khảo ý kiến chuyên gia</Typography>
                    <Typography variant="body2">Nhân viên TunaShop sẵn sàng tư vấn giúp bạn chọn vợt phù hợp nhất</Typography>
                </Alert>
            </Card>
        </Container>
    )
}