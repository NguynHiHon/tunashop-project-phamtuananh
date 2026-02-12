import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Alert,
    Tooltip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
    Visibility,
    CheckCircle,
    Cancel,
    LocalShipping,
    Done,
    FilterList,
    Refresh,
} from '@mui/icons-material';
import { fetchAllOrders, fetchOrderDetail, updateOrderStatus, clearCurrentOrder } from '../../redux/clices/orderSlice';
import { formatFullAddress } from '../../services/addressService';

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
    pending: { label: 'Chờ duyệt', color: 'warning', icon: '⏳' },
    approved: { label: 'Đã duyệt', color: 'info', icon: '✓' },
    rejected: { label: 'Từ chối', color: 'error', icon: '✗' },
    shipping: { label: 'Đang giao', color: 'primary', icon: '🚚' },
    cancelled: { label: 'Đã hủy', color: 'default', icon: '🚫' },
    delivered: { label: 'Đã giao', color: 'success', icon: '✅' },
};

const OrderManagement = () => {
    const dispatch = useDispatch();
    const { allOrders, currentOrder, loading, error, actionLoading } = useSelector((state) => state.order);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    const [detailOpen, setDetailOpen] = useState(false);
    const [actionDialog, setActionDialog] = useState({ open: false, action: '', orderId: '' });
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionNote, setActionNote] = useState('');

    const loadOrders = React.useCallback(() => {
        const params = {};
        if (statusFilter !== 'all') {
            params.status = statusFilter;
        }
        dispatch(fetchAllOrders(params));
    }, [dispatch, statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleViewDetail = (orderId) => {
        dispatch(fetchOrderDetail(orderId));
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        dispatch(clearCurrentOrder());
    };

    const handleOpenActionDialog = (action, orderId) => {
        setActionDialog({ open: true, action, orderId });
        setRejectionReason('');
        setActionNote('');
    };

    const handleCloseActionDialog = () => {
        setActionDialog({ open: false, action: '', orderId: '' });
    };

    const handleConfirmAction = async () => {
        const { action, orderId } = actionDialog;
        let newStatus = '';
        let note = actionNote;

        switch (action) {
            case 'approve':
                newStatus = 'approved';
                break;
            case 'reject':
                newStatus = 'rejected';
                note = rejectionReason;
                break;
            case 'ship':
                newStatus = 'shipping';
                break;
            case 'deliver':
                newStatus = 'delivered';
                break;
            default:
                return;
        }

        try {
            await dispatch(updateOrderStatus({ orderId, status: newStatus, note })).unwrap();
            handleCloseActionDialog();
            loadOrders();
        } catch (err) {
            console.error('Failed to update order status:', err);
        }
    };

    const getAvailableActions = (status) => {
        switch (status) {
            case 'pending':
                return [
                    { action: 'approve', label: 'Duyệt', icon: <CheckCircle />, color: 'success' },
                    { action: 'reject', label: 'Từ chối', icon: <Cancel />, color: 'error' },
                ];
            case 'approved':
                return [
                    { action: 'ship', label: 'Giao hàng', icon: <LocalShipping />, color: 'primary' },
                ];
            case 'shipping':
                return [
                    { action: 'deliver', label: 'Đã giao', icon: <Done />, color: 'success' },
                ];
            default:
                return [];
        }
    };

    const filteredOrders = allOrders || [];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Quản lý đơn hàng
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterList color="action" />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Trạng thái"
                    >
                        <MenuItem value="all">Tất cả</MenuItem>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <MenuItem key={key} value={key}>
                                {config.icon} {config.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button startIcon={<Refresh />} onClick={loadOrders} disabled={loading}>
                    Làm mới
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                    Tổng: {filteredOrders.length} đơn hàng
                </Typography>
            </Paper>

            {/* Orders Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Mã đơn</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Số sản phẩm</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ngày đặt</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">
                                Thao tác
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">Không có đơn hàng nào</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((order) => {
                                    const statusConfig = STATUS_CONFIG[order.status] || {};
                                    const actions = getAvailableActions(order.status);

                                    return (
                                        <TableRow key={order._id} hover>
                                            <TableCell>
                                                <Typography fontWeight="500" color="primary">
                                                    {order.orderCode}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{order.shippingAddress?.fullName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.shippingAddress?.phone}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {order.items?.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight="600" color="primary">
                                                    {formatPrice(order.total)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statusConfig.label}
                                                    color={statusConfig.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Xem chi tiết">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => handleViewDetail(order._id)}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {actions.map((act) => (
                                                        <Tooltip key={act.action} title={act.label}>
                                                            <IconButton
                                                                size="small"
                                                                color={act.color}
                                                                onClick={() => handleOpenActionDialog(act.action, order._id)}
                                                            >
                                                                {act.icon}
                                                            </IconButton>
                                                        </Tooltip>
                                                    ))}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredOrders.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Số dòng:"
                />
            </TableContainer>

            {/* Order Detail Dialog */}
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
                <DialogTitle>
                    Chi tiết đơn hàng {currentOrder?.orderCode}
                </DialogTitle>
                <DialogContent dividers>
                    {!currentOrder ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Order Info */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Thông tin đơn hàng
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Mã đơn:</Typography>
                                                <Typography fontWeight="500">{currentOrder.orderCode}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography color="text.secondary">Trạng thái:</Typography>
                                                <Chip
                                                    label={STATUS_CONFIG[currentOrder.status]?.label}
                                                    color={STATUS_CONFIG[currentOrder.status]?.color}
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Ngày đặt:</Typography>
                                                <Typography>{formatDate(currentOrder.createdAt)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Thanh toán:</Typography>
                                                <Typography>COD - Thanh toán khi nhận hàng</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Shipping Info */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Thông tin giao hàng
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Typography>
                                                <strong>Người nhận:</strong> {currentOrder.shippingAddress?.fullName}
                                            </Typography>
                                            <Typography>
                                                <strong>SĐT:</strong> {currentOrder.shippingAddress?.phone}
                                            </Typography>
                                            <Typography>
                                                <strong>Địa chỉ:</strong> {formatFullAddress(currentOrder.shippingAddress)}
                                            </Typography>
                                            {currentOrder.note && (
                                                <Typography>
                                                    <strong>Ghi chú:</strong> {currentOrder.note}
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Order Items */}
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Sản phẩm
                                        </Typography>
                                        <List disablePadding>
                                            {currentOrder.items?.map((item, idx) => (
                                                <ListItem key={idx} sx={{ px: 0 }}>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            variant="rounded"
                                                            sx={{ width: 56, height: 56 }}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box>
                                                                <Typography fontWeight="500">{item.productName}</Typography>
                                                                {(item.variantInfo?.color || item.variantInfo?.size) && (
                                                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                                        {item.variantInfo.color && (
                                                                            <Chip
                                                                                label={item.variantInfo.color}
                                                                                size="small"
                                                                                color="primary"
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
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                <Typography variant="body2">
                                                                    {formatPrice(item.finalPrice)} x {item.quantity}
                                                                </Typography>
                                                                {item.salePercent > 0 && (
                                                                    <Chip label={`-${item.salePercent}%`} size="small" color="error" />
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                    <Typography fontWeight="600">{formatPrice(item.subtotal)}</Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                        <Divider sx={{ my: 2 }} />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                            <Box sx={{ display: 'flex', gap: 4 }}>
                                                <Typography color="text.secondary">Tạm tính:</Typography>
                                                <Typography>{formatPrice(currentOrder.subtotal)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 4 }}>
                                                <Typography color="text.secondary">Phí vận chuyển:</Typography>
                                                <Typography color={currentOrder.shippingFee === 0 ? 'success.main' : 'inherit'}>
                                                    {currentOrder.shippingFee === 0 ? 'Miễn phí' : formatPrice(currentOrder.shippingFee)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 4 }}>
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
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Lịch sử trạng thái
                                            </Typography>
                                            {currentOrder.statusHistory.map((history, idx) => (
                                                <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 150 }}>
                                                        {formatDate(history.changedAt)}
                                                    </Typography>
                                                    <Chip
                                                        label={STATUS_CONFIG[history.status]?.label}
                                                        color={STATUS_CONFIG[history.status]?.color}
                                                        size="small"
                                                    />
                                                    {history.note && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            - {history.note}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetail}>Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* Action Confirmation Dialog */}
            <Dialog open={actionDialog.open} onClose={handleCloseActionDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {actionDialog.action === 'approve' && 'Xác nhận duyệt đơn hàng'}
                    {actionDialog.action === 'reject' && 'Xác nhận từ chối đơn hàng'}
                    {actionDialog.action === 'ship' && 'Xác nhận giao hàng'}
                    {actionDialog.action === 'deliver' && 'Xác nhận đã giao thành công'}
                </DialogTitle>
                <DialogContent>
                    {actionDialog.action === 'reject' ? (
                        <TextField
                            fullWidth
                            label="Lý do từ chối *"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            multiline
                            rows={3}
                            sx={{ mt: 2 }}
                            placeholder="Nhập lý do từ chối đơn hàng..."
                        />
                    ) : (
                        <TextField
                            fullWidth
                            label="Ghi chú (tùy chọn)"
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                            multiline
                            rows={2}
                            sx={{ mt: 2 }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseActionDialog}>Hủy</Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAction}
                        disabled={actionLoading || (actionDialog.action === 'reject' && !rejectionReason.trim())}
                        color={actionDialog.action === 'reject' ? 'error' : 'primary'}
                    >
                        {actionLoading ? <CircularProgress size={20} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderManagement;
