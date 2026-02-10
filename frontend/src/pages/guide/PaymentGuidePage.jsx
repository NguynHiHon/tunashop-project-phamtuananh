import React from 'react'
import { Container, Box, Typography, Card, Grid, Alert, Chip } from '@mui/material'

export default function PaymentGuidePage() {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#f26522', mb: 1 }}>
                    HƯỚNG DẪN THANH TOÁN
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    Hướng dẫn chi tiết các phương thức thanh toán được hỗ trợ tại TunaShop
                </Typography>
            </Box>

            {/* Payment Methods */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    CÁC PHƯƠNG THỨC THANH TOÁN
                </Typography>

                {/* Cash on Delivery */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            💰 Thanh toán khi nhận hàng (COD)
                        </Typography>
                        <Chip label="Phổ biến nhất" color="primary" size="small" />
                    </Box>
                    <Typography paragraph>
                        Bạn có thể thanh toán bằng tiền mặt khi nhận hàng tại nhà hoặc tại cửa hàng. Đây là phương thức an toàn và được ưa chuộng nhất.
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Phí COD: Miễn phí cho đơn hàng từ 500.000đ, 20.000đ cho đơn hàng dưới 500.000đ
                    </Alert>
                </Box>

                {/* Bank Transfer */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        🏦 Chuyển khoản ngân hàng
                    </Typography>
                    <Typography paragraph>
                        Chuyển khoản trực tiếp vào tài khoản ngân hàng của TunaShop. Vui lòng ghi rõ mã đơn hàng trong nội dung chuyển khoản.
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                                <Typography sx={{ fontWeight: 600 }}>Ngân hàng Vietcombank</Typography>
                                <Typography>STK: 1234567890</Typography>
                                <Typography>Chủ TK: CÔNG TY TUNASHOP</Typography>
                                <Typography>Chi nhánh: TP.HCM</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                                <Typography sx={{ fontWeight: 600 }}>Ngân hàng Techcombank</Typography>
                                <Typography>STK: 0987654321</Typography>
                                <Typography>Chủ TK: CÔNG TY TUNASHOP</Typography>
                                <Typography>Chi nhánh: TP.HCM</Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Credit Card */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        💳 Thanh toán thẻ tín dụng/ghi nợ
                    </Typography>
                    <Typography paragraph>
                        Chúng tôi chấp nhận các loại thẻ: Visa, Mastercard, JCB, American Express được phát hành tại Việt Nam.
                    </Typography>
                    <Alert severity="success">
                        An toàn 100% với công nghệ bảo mật SSL 256-bit
                    </Alert>
                </Box>

                {/* E-wallet */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        📱 Ví điện tử
                    </Typography>
                    <Typography paragraph>
                        Thanh toán nhanh chóng qua các ví điện tử phổ biến:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label="MoMo" />
                        <Chip label="ZaloPay" />
                        <Chip label="VNPay" />
                        <Chip label="ShopeePay" />
                    </Box>
                </Box>
            </Card>

            {/* Payment Process */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    QUY TRÌNH THANH TOÁN
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>1</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>Chọn sản phẩm</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Thêm sản phẩm vào giỏ hàng
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>2</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>Điền thông tin</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Nhập địa chỉ giao hàng
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>3</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>Chọn thanh toán</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Lựa chọn phương thức phù hợp
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                bgcolor: '#f26522',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>4</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>Hoàn tất</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Xác nhận và đặt hàng
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Important Notes */}
            <Card sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    LƯU Ý QUAN TRỌNG
                </Typography>
                <ul>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 600 }}>Kiểm tra thông tin:</Typography>
                        <Typography component="span"> Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi thanh toán</Typography>
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 600 }}>Thời gian xử lý:</Typography>
                        <Typography component="span"> Đơn hàng được xử lý trong vòng 2-4 giờ sau khi thanh toán thành công</Typography>
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 600 }}>Bảo mật:</Typography>
                        <Typography component="span"> Mọi giao dịch đều được mã hóa và bảo mật tuyệt đối</Typography>
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 600 }}>Hỗ trợ:</Typography>
                        <Typography component="span"> Liên hệ hotline 1900 1234 nếu gặp vấn đề trong quá trình thanh toán</Typography>
                    </li>
                </ul>
            </Card>
        </Container>
    )
}