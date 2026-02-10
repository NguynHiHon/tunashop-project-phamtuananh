import React from 'react'
import { Container, Box, Typography, Card, Alert } from '@mui/material'
import Grid from '@mui/material/GridLegacy';
export default function OrderingGuidePage() {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#f26522', mb: 1 }}>
                    HƯỚNG DẪN MUA HÀNG
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    Quy trình mua hàng đơn giản và nhanh chóng tại TunaShop
                </Typography>
            </Box>

            {/* Step by Step */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    CÁC BƯỚC MUA HÀNG
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                        Bước 1: Tìm kiếm sản phẩm
                    </Typography>
                    <Typography paragraph>
                        • Sử dụng thanh tìm kiếm để tìm sản phẩm mong muốn
                    </Typography>
                    <Typography paragraph>
                        • Lọc theo danh mục, thương hiệu, giá cả để thu hẹp kết quả
                    </Typography>
                    <Typography paragraph>
                        • Xem chi tiết sản phẩm, hình ảnh và đánh giá từ khách hàng khác
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                        Bước 2: Thêm vào giỏ hàng
                    </Typography>
                    <Typography paragraph>
                        • Chọn size, màu sắc (nếu có) phù hợp với nhu cầu
                    </Typography>
                    <Typography paragraph>
                        • Nhập số lượng mong muốn
                    </Typography>
                    <Typography paragraph>
                        • Click "Thêm vào giỏ hàng" hoặc "Mua ngay"
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Bạn có thể tiếp tục mua sắm và thêm nhiều sản phẩm khác vào giỏ hàng
                    </Alert>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                        Bước 3: Kiểm tra giỏ hàng
                    </Typography>
                    <Typography paragraph>
                        • Click vào biểu tượng giỏ hàng để xem tất cả sản phẩm đã chọn
                    </Typography>
                    <Typography paragraph>
                        • Kiểm tra lại số lượng, size, màu sắc
                    </Typography>
                    <Typography paragraph>
                        • Có thể thay đổi số lượng hoặc xóa sản phẩm không mong muốn
                    </Typography>
                    <Typography paragraph>
                        • Xem tổng tiền tạm tính (chưa bao gồm phí vận chuyển)
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                        Bước 4: Điền thông tin giao hàng
                    </Typography>
                    <Typography paragraph>
                        • Nhập họ tên người nhận chính xác
                    </Typography>
                    <Typography paragraph>
                        • Số điện thoại liên lạc (bắt buộc)
                    </Typography>
                    <Typography paragraph>
                        • Địa chỉ giao hàng chi tiết (số nhà, đường, phường, quận/huyện, tỉnh/thành)
                    </Typography>
                    <Typography paragraph>
                        • Ghi chú đặc biệt (nếu có): thời gian giao hàng mong muốn, địa chỉ cụ thể hơn
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                        Bước 5: Chọn phương thức thanh toán
                    </Typography>
                    <Typography paragraph>
                        • Thanh toán khi nhận hàng (COD) - phổ biến nhất
                    </Typography>
                    <Typography paragraph>
                        • Chuyển khoản ngân hàng
                    </Typography>
                    <Typography paragraph>
                        • Thẻ tín dụng/ghi nợ
                    </Typography>
                    <Typography paragraph>
                        • Ví điện tử (MoMo, ZaloPay, VNPay...)
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f26522' }}>
                        Bước 6: Xác nhận đơn hàng
                    </Typography>
                    <Typography paragraph>
                        • Kiểm tra lại toàn bộ thông tin đơn hàng
                    </Typography>
                    <Typography paragraph>
                        • Đọc và đồng ý với điều khoản sử dụng
                    </Typography>
                    <Typography paragraph>
                        • Click "Đặt hàng" để hoàn tất
                    </Typography>
                    <Typography paragraph>
                        • Nhận mã đơn hàng để theo dõi tình trạng
                    </Typography>
                </Box>
            </Card>

            {/* Shipping Information */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    THÔNG TIN GIAO HÀNG
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            📦 Thời gian giao hàng
                        </Typography>
                        <Typography paragraph>
                            • Nội thành TP.HCM, Hà Nội: 1-2 ngày
                        </Typography>
                        <Typography paragraph>
                            • Các tỉnh thành khác: 2-5 ngày
                        </Typography>
                        <Typography paragraph>
                            • Vùng sâu vùng xa: 3-7 ngày
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            💰 Phí vận chuyển
                        </Typography>
                        <Typography paragraph>
                            • Miễn phí: Đơn hàng ≥ 500K (nội thành)
                        </Typography>
                        <Typography paragraph>
                            • Miễn phí: Đơn hàng ≥ 1.000K (ngoại thành)
                        </Typography>
                        <Typography paragraph>
                            • Phí chuẩn: 25K - 50K tùy khu vực
                        </Typography>
                    </Grid>
                </Grid>
            </Card>

            {/* Order Status */}
            <Card sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    THEO DÕI TRẠNG THÁI ĐỚN HÀNG
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography sx={{ fontWeight: 600, color: '#ff9800' }}>Chờ xác nhận</Typography>
                            <Typography variant="body2">Đơn hàng đang được xử lý</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography sx={{ fontWeight: 600, color: '#2196f3' }}>Đã xác nhận</Typography>
                            <Typography variant="body2">Chuẩn bị hàng hóa</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography sx={{ fontWeight: 600, color: '#9c27b0' }}>Đang giao</Typography>
                            <Typography variant="body2">Shipper đang giao hàng</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>Đã giao</Typography>
                            <Typography variant="body2">Giao hàng thành công</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography sx={{ fontWeight: 600, color: '#f44336' }}>Đã hủy</Typography>
                            <Typography variant="body2">Đơn hàng bị hủy</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Tips */}
            <Card sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    MẸO MUA HÀNG HIỆU QUẢ
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>Mua hàng vào cuối tuần</Typography>
                    <Typography variant="body2">Thường có nhiều chương trình khuyến mãi và giảm giá đặc biệt</Typography>
                </Alert>
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>Đăng ký thành viên</Typography>
                    <Typography variant="body2">Nhận điểm tích lũy và ưu đãi độc quyền cho khách hàng thân thiết</Typography>
                </Alert>
                <Alert severity="warning">
                    <Typography sx={{ fontWeight: 600 }}>Kiểm tra kỹ sản phẩm khi nhận hàng</Typography>
                    <Typography variant="body2">Đảm bảo sản phẩm đúng như mô tả và không có lỗi hỏng</Typography>
                </Alert>
            </Card>
        </Container>
    )
}