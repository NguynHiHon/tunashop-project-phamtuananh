import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    CircularProgress,
    Alert,
    TextField,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore,
    ShoppingBag,
    LocalShipping,
    Cancel,
    CheckCircle,
    AccessTime,
    Receipt,
} from '@mui/icons-material';
import { fetchMyOrders, fetchOrderById, cancelOrder, clearCurrentOrder } from '../redux/clices/orderSlice';
import { formatFullAddress } from '../services/addressService';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const STATUS_CONFIG = {
    pending: { label: 'Chờ duyệt', color: 'warning', icon: <AccessTime /> },
    approved: { label: 'Đã duyệt', color: 'info', icon: <CheckCircle /> },
    rejected: { label: 'Từ chối', color: 'error', icon: <Cancel /> },
    shipping: { label: 'Đang giao', color: 'primary', icon: <LocalShipping /> },
    cancelled: { label: 'Đã hủy', color: 'default', icon: <Cancel /> },
    delivered: { label: 'Đã giao', color: 'success', icon: <CheckCircle /> },
};

const OrderHistoryPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myOrders, currentOrder, loading, error, actionLoading } = useSelector((state) => state.order);
    const { currentUser: user } = useSelector((state) => state.auth);

    const [tabValue, setTabValue] = useState(0);
    const [detailOpen, setDetailOpen] = useState(false);
    const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: '' });
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        dispatch(fetchMyOrders());
    }, [dispatch, user, navigate]);

    const handleViewDetail = (orderId) => {
        dispatch(fetchOrderById(orderId));
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        dispatch(clearCurrentOrder());
    };

    const handleOpenCancelDialog = (orderId, e) => {
        e.stopPropagation();
        setCancelDialog({ open: true, orderId });
        setCancelReason('');
    };

    const handleCloseCancelDialog = () => {
        setCancelDialog({ open: false, orderId: '' });
    };

    const handleConfirmCancel = async () => {
        try {
            await dispatch(cancelOrder({ orderId: cancelDialog.orderId, reason: cancelReason })).unwrap();
            handleCloseCancelDialog();
            dispatch(fetchMyOrders());
        } catch (err) {
            console.error('Failed to cancel order:', err);
        }
    };

    // Filter orders by status
    const filterOrders = (status) => {
        if (status === 'all') return myOrders || [];
        return (myOrders || []).filter((order) => order.status === status);
    };

    const tabs = [
        { label: 'Tất cả', value: 'all' },
        { label: 'Chờ duyệt', value: 'pending' },
        { label: 'Đang xử lý', value: 'approved' },
        { label: 'Đang giao', value: 'shipping' },
        { label: 'Đã giao', value: 'delivered' },
        { label: 'Đã hủy', value: 'cancelled' },
    ];

    const currentTab = tabs[tabValue]?.value || 'all';
    const filteredOrders = filterOrders(currentTab);

    if (!user) {
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Receipt sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4" fontWeight="bold">
                    Đơn hàng của tôi
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.value}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {tab.label}
                                    <Chip
                                        size="small"
                                        label={filterOrders(tab.value).length}
                                        sx={{ height: 20, fontSize: '0.75rem' }}
                                    />
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Orders List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : filteredOrders.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Chưa có đơn hàng nào
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
                        Mua sắm ngay
                    </Button>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredOrders.map((order) => {
                        const statusConfig = STATUS_CONFIG[order.status] || {};
                        const canCancel = ['pending', 'approved'].includes(order.status);

                        return (
                            <Card key={order._id} variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => handleViewDetail(order._id)}>
                                <CardContent>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" color="primary" fontWeight="600">
                                                #{order.orderCode}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Đặt ngày {formatDate(order.createdAt)}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={statusConfig.icon}
                                            label={statusConfig.label}
                                            color={statusConfig.color}
                                            size="small"
                                        />
                                    </Box>

                                    {/* Items Preview */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2, overflowX: 'auto', pb: 1 }}>
                                        {order.items?.slice(0, 4).map((item, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    minWidth: 200,
                                                    p: 1,
                                                    bgcolor: '#f9f9f9',
                                                    borderRadius: 1,
                                                }}
                                            >
                                                <Avatar
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    variant="rounded"
                                                    sx={{ width: 48, height: 48 }}
                                                />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="body2" noWrap fontWeight="500">
                                                        {item.productName}
                                                    </Typography>
                                                    {(item.variantInfo?.color || item.variantInfo?.size) && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.variantInfo.color}{item.variantInfo.color && item.variantInfo.size ? ' - ' : ''}{item.variantInfo.size}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        x{item.quantity} - {formatPrice(item.finalPrice)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                        {order.items?.length > 4 && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: 80,
                                                    p: 1,
                                                    bgcolor: '#f0f0f0',
                                                    borderRadius: 1,
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    +{order.items.length - 4} sản phẩm
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Footer */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {order.items?.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {canCancel && (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    onClick={(e) => handleOpenCancelDialog(order._id, e)}
                                                >
                                                    Hủy đơn
                                                </Button>
                                            )}
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Tổng tiền:
                                                </Typography>
                                                <Typography variant="h6" color="primary" fontWeight="bold">
                                                    {formatPrice(order.total)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* Order Detail Dialog */}
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Receipt />
                    Chi tiết đơn hàng {currentOrder?.orderCode}
                </DialogTitle>
                <DialogContent dividers>
                    {!currentOrder ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Status */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Chip
                                        icon={STATUS_CONFIG[currentOrder.status]?.icon}
                                        label={STATUS_CONFIG[currentOrder.status]?.label}
                                        color={STATUS_CONFIG[currentOrder.status]?.color}
                                        sx={{ fontSize: '1rem', py: 2.5, px: 2 }}
                                    />
                                </Box>
                                {currentOrder.rejectionReason && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        <strong>Lý do từ chối:</strong> {currentOrder.rejectionReason}
                                    </Alert>
                                )}
                            </Grid>

                            {/* Order Info */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                            Thông tin đơn hàng
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Mã đơn:</Typography>
                                                <Typography fontWeight="500">{currentOrder.orderCode}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Ngày đặt:</Typography>
                                                <Typography>{formatDate(currentOrder.createdAt)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Thanh toán:</Typography>
                                                <Typography>COD</Typography>
                                            </Box>
                                            {currentOrder.deliveredAt && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">Ngày giao:</Typography>
                                                    <Typography>{formatDate(currentOrder.deliveredAt)}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Shipping Info */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                            Địa chỉ giao hàng
                                        </Typography>
                                        <Typography fontWeight="500">{currentOrder.shippingAddress?.fullName}</Typography>
                                        <Typography color="text.secondary">{currentOrder.shippingAddress?.phone}</Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {formatFullAddress(currentOrder.shippingAddress)}
                                        </Typography>
                                        {currentOrder.note && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                <strong>Ghi chú:</strong> {currentOrder.note}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Products */}
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                            Sản phẩm đã đặt
                                        </Typography>
                                        <List disablePadding>
                                            {currentOrder.items?.map((item, idx) => (
                                                <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            variant="rounded"
                                                            sx={{ width: 64, height: 64, mr: 1 }}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primaryTypographyProps={{ component: 'div' }}
                                                        secondaryTypographyProps={{ component: 'div' }}
                                                        primary={
                                                            <Box>
                                                                <Typography fontWeight="500">{item.productName}</Typography>
                                                                {(item.variantInfo?.color || item.variantInfo?.size) && (
                                                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                                        {item.variantInfo.color && (
                                                                            <Chip
                                                                                label={item.variantInfo.color}
                                                                                size="small"
                                                                                variant="outlined"
                                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                                            />
                                                                        )}
                                                                        {item.variantInfo.size && (
                                                                            <Chip
                                                                                label={`Size: ${item.variantInfo.size}`}
                                                                                size="small"
                                                                                variant="outlined"
                                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                                                <Typography component="span" variant="body2" color="primary">
                                                                    {formatPrice(item.finalPrice)}
                                                                </Typography>
                                                                {item.salePercent > 0 && (
                                                                    <>
                                                                        <Typography
                                                                            component="span"
                                                                            variant="body2"
                                                                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                                                        >
                                                                            {formatPrice(item.price)}
                                                                        </Typography>
                                                                        <Chip label={`-${item.salePercent}%`} size="small" color="error" />
                                                                    </>
                                                                )}
                                                                <Typography component="span" variant="body2" color="text.secondary">
                                                                    x{item.quantity}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                    <Typography fontWeight="600">{formatPrice(item.subtotal)}</Typography>
                                                </ListItem>
                                            ))}
                                        </List>

                                        <Divider sx={{ my: 2 }} />

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                            <Box sx={{ display: 'flex', gap: 4, minWidth: 200, justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Tạm tính:</Typography>
                                                <Typography>{formatPrice(currentOrder.subtotal)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 4, minWidth: 200, justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Phí vận chuyển:</Typography>
                                                <Typography color={currentOrder.shippingFee === 0 ? 'success.main' : 'inherit'}>
                                                    {currentOrder.shippingFee === 0 ? 'Miễn phí' : formatPrice(currentOrder.shippingFee)}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ width: 200 }} />
                                            <Box sx={{ display: 'flex', gap: 4, minWidth: 200, justifyContent: 'space-between' }}>
                                                <Typography variant="h6">Tổng cộng:</Typography>
                                                <Typography variant="h6" color="primary" fontWeight="bold">
                                                    {formatPrice(currentOrder.total)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Status History */}
                            {currentOrder.statusHistory?.length > 0 && (
                                <Grid item xs={12}>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography fontWeight="600">Lịch sử đơn hàng</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {currentOrder.statusHistory.map((history, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 2,
                                                        mb: 1.5,
                                                        pb: 1.5,
                                                        borderBottom: idx < currentOrder.statusHistory.length - 1 ? '1px dashed #e0e0e0' : 'none',
                                                    }}
                                                >
                                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                                                        {formatDate(history.changedAt)}
                                                    </Typography>
                                                    <Chip
                                                        label={STATUS_CONFIG[history.status]?.label}
                                                        color={STATUS_CONFIG[history.status]?.color}
                                                        size="small"
                                                    />
                                                    {history.note && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {history.note}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    {currentOrder && ['pending', 'approved'].includes(currentOrder.status) && (
                        <Button
                            color="error"
                            onClick={(e) => {
                                handleCloseDetail();
                                handleOpenCancelDialog(currentOrder._id, e);
                            }}
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                    <Button onClick={handleCloseDetail} variant="contained">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel Order Dialog */}
            <Dialog open={cancelDialog.open} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                    </Alert>
                    <TextField
                        fullWidth
                        label="Lý do hủy (tùy chọn)"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        multiline
                        rows={2}
                        placeholder="Nhập lý do bạn muốn hủy đơn hàng..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCancelDialog}>Quay lại</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmCancel}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={20} /> : 'Xác nhận hủy'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OrderHistoryPage;
