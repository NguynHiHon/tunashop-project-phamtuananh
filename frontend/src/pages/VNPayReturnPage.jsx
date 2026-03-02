import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
    Divider,
} from '@mui/material';
import { CheckCircle, Cancel, ErrorOutline } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/clices/cartSlice';

const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const VNPayReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    // Lấy thông tin kết quả từ query params (do backend redirect về)
    const status = searchParams.get('status');       // success | failed | invalid | error
    const orderId = searchParams.get('orderId');
    const orderCode = searchParams.get('orderCode');
    const amount = searchParams.get('amount');
    const responseCode = searchParams.get('responseCode');

    const isSuccess = status === 'success';
    const isFailed = status === 'failed';

    useEffect(() => {
        // Giả lập loading nhỏ để tránh nhấp nháy
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    // Clear cart nếu thanh toán thành công
    useEffect(() => {
        if (isSuccess && !loading) {
            dispatch(clearCart());
        }
    }, [isSuccess, loading, dispatch]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 3 }}>
                    Đang xử lý kết quả thanh toán...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 5,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isSuccess ? 'success.light' : 'error.light',
                }}
            >
                {/* Icon kết quả */}
                {isSuccess ? (
                    <CheckCircle sx={{ fontSize: 90, color: 'success.main', mb: 2 }} />
                ) : isFailed ? (
                    <Cancel sx={{ fontSize: 90, color: 'error.main', mb: 2 }} />
                ) : (
                    <ErrorOutline sx={{ fontSize: 90, color: 'warning.main', mb: 2 }} />
                )}

                {/* Tiêu đề */}
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={isSuccess ? 'success.main' : 'error.main'}
                    gutterBottom
                >
                    {isSuccess
                        ? 'Thanh toán thành công!'
                        : isFailed
                            ? 'Thanh toán thất bại'
                            : 'Có lỗi xảy ra'}
                </Typography>

                {/* Mô tả */}
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {isSuccess
                        ? 'Đơn hàng của bạn đã được thanh toán qua VNPay. Chúng tôi sẽ xử lý và giao hàng sớm nhất.'
                        : isFailed
                            ? 'Giao dịch không thành công. Đơn hàng của bạn vẫn được lưu, bạn có thể thử thanh toán lại sau.'
                            : 'Có lỗi xảy ra trong quá trình xác thực giao dịch. Vui lòng liên hệ hỗ trợ.'}
                </Typography>

                {/* Thông tin chi tiết */}
                {(orderCode || amount) && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Box sx={{ textAlign: 'left', bgcolor: 'grey.50', p: 2.5, borderRadius: 2, mb: 3 }}>
                            {orderCode && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="text.secondary" variant="body2">Mã đơn hàng:</Typography>
                                    <Typography fontWeight="600" variant="body2">{orderCode}</Typography>
                                </Box>
                            )}
                            {amount && isSuccess && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="text.secondary" variant="body2">Số tiền thanh toán:</Typography>
                                    <Typography fontWeight="600" color="success.main" variant="body2">
                                        {formatPrice(parseFloat(amount))}
                                    </Typography>
                                </Box>
                            )}
                            {responseCode && !isSuccess && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary" variant="body2">Mã lỗi VNPay:</Typography>
                                    <Typography fontWeight="600" color="error.main" variant="body2">
                                        {responseCode}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </>
                )}

                {/* Nút hành động */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center' }}>
                    {orderId ? (
                        <Button
                            variant="contained"
                            color={isSuccess ? 'success' : 'primary'}
                            size="large"
                            onClick={() => navigate('/orders')}
                            sx={{ borderRadius: 2 }}
                        >
                            Xem đơn hàng của tôi
                        </Button>
                    ) : null}
                    <Button
                        variant={orderId ? 'outlined' : 'contained'}
                        size="large"
                        onClick={() => navigate('/')}
                        sx={{ borderRadius: 2 }}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default VNPayReturnPage;
