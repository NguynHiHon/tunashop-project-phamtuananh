import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Checkbox,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Search, Replay } from '@mui/icons-material';
import { toast } from 'sonner';
import returnService from '../../services/returnService';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
}).format(price || 0);

const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
});

const getItemId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || value.id || value.toString();
};

const buildItemKey = (item, index) => `${getItemId(item.productId)}|${getItemId(item.variantId)}|${index}`;
const buildQtyKey = (item) => `${getItemId(item.productId)}|${getItemId(item.variantId)}`;

export default function ReturnManagement() {
    const [orderCode, setOrderCode] = useState('');
    const [order, setOrder] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [searchLoading, setSearchLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [returnReason, setReturnReason] = useState('');

    const [returns, setReturns] = useState([]);
    const [returnsLoading, setReturnsLoading] = useState(false);

    const loadReturns = useCallback(async () => {
        setReturnsLoading(true);
        try {
            const res = await returnService.list({ limit: 50 });
            setReturns(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setReturnsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReturns();
    }, [loadReturns]);

    const handleSearch = async () => {
        if (!orderCode.trim()) {
            toast.error('Vui lòng nhập mã đơn hàng');
            return;
        }
        setSearchLoading(true);
        setError('');
        try {
            const res = await returnService.searchOrder(orderCode.trim());
            const foundOrder = res.data;
            setOrder(foundOrder);
            const initialSelection = {};
            const sourceItems = foundOrder.originalItems || foundOrder.items || [];
            sourceItems.forEach((item, idx) => {
                const key = buildItemKey(item, idx);
                initialSelection[key] = {
                    checked: false,
                    quantity: 1,
                };
            });
            setSelectedItems(initialSelection);
            setReturnReason('');
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Không tìm thấy đơn hàng';
            setOrder(null);
            setSelectedItems({});
            setReturnReason('');
            setError(message);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleToggleItem = (key) => {
        setSelectedItems((prev) => ({
            ...prev,
            [key]: { ...prev[key], checked: !prev[key]?.checked },
        }));
    };

    const handleQuantityChange = (key, max, value) => {
        const qty = Math.max(1, Math.min(max, Number(value) || 1));
        setSelectedItems((prev) => ({
            ...prev,
            [key]: { ...prev[key], quantity: qty },
        }));
    };

    const selectedPayload = useMemo(() => {
        const sourceItems = order?.originalItems || order?.items || [];
        if (sourceItems.length === 0) return [];
        return sourceItems
            .map((item, idx) => {
                const key = buildItemKey(item, idx);
                const state = selectedItems[key];
                const qtyKey = buildQtyKey(item);
                const remainingQty = order.remainingQuantities?.[qtyKey] ?? item.quantity;
                if (!state?.checked) return null;
                if (remainingQty <= 0) return null;
                return {
                    productId: getItemId(item.productId),
                    variantId: item.variantId ? getItemId(item.variantId) : null,
                    quantity: state.quantity,
                    unitPrice: item.finalPrice,
                };
            })
            .filter(Boolean);
    }, [order, selectedItems]);

    const refundAmount = selectedPayload.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const summary = useMemo(() => {
        if (!order) return null;
        const originalItems = order.originalItems || order.items || [];
        const returnedQuantities = order.returnedQuantities || {};
        const remainingQuantities = order.remainingQuantities || {};

        const totals = originalItems.reduce((acc, item) => {
            const key = buildQtyKey(item);
            const originalQty = item.quantity || 0;
            const returnedQty = returnedQuantities[key] || 0;
            const remainingQty = remainingQuantities[key] ?? Math.max(0, originalQty - returnedQty);
            const unitPrice = item.finalPrice || 0;

            acc.totalQty += originalQty;
            acc.returnedQty += returnedQty;
            acc.remainingQty += remainingQty;
            acc.originalAmount += unitPrice * originalQty;
            acc.returnedAmount += unitPrice * returnedQty;
            return acc;
        }, {
            totalQty: 0,
            returnedQty: 0,
            remainingQty: 0,
            originalAmount: 0,
            returnedAmount: 0,
        });

        return {
            ...totals,
            remainingAmount: Math.max(0, totals.originalAmount - totals.returnedAmount),
        };
    }, [order]);

    const handleConfirmReturn = async () => {
        if (!order) return;
        if (selectedPayload.length === 0) {
            toast.error('Vui lòng chọn sản phẩm trả hàng');
            return;
        }

        setActionLoading(true);
        try {
            await returnService.createReturn({
                orderCode: order.orderCode,
                items: selectedPayload.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
                reason: returnReason,
            });
            toast.success('Đã xác nhận hoàn hàng');
            setOrder(null);
            setSelectedItems({});
            setOrderCode('');
            setReturnReason('');
            loadReturns();
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Không thể hoàn hàng';
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Hoàn hàng
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Tìm đơn hàng theo mã
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="Mã đơn hàng"
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                        size="small"
                        sx={{ minWidth: 280 }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<Search />}
                        onClick={handleSearch}
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Đang tìm...' : 'Tìm đơn'}
                    </Button>
                </Box>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>

            {order && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={5}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Thông tin đơn hàng
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography><strong>Mã đơn:</strong> {order.orderCode}</Typography>
                                    <Typography><strong>Khách hàng:</strong> {order.shippingAddress?.fullName || order.userId?.username}</Typography>
                                    <Typography><strong>SĐT:</strong> {order.shippingAddress?.phone || order.userId?.phone}</Typography>
                                    <Typography><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</Typography>
                                    <Typography><strong>Trạng thái:</strong> {order.status}</Typography>
                                    <Typography><strong>Tổng tiền:</strong> {formatPrice(order.total)}</Typography>
                                    {summary && (
                                        <>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography><strong>Tổng SP:</strong> {summary.totalQty}</Typography>
                                            <Typography><strong>Đã hoàn:</strong> {summary.returnedQty} SP</Typography>
                                            <Typography><strong>Còn lại:</strong> {summary.remainingQty} SP</Typography>
                                            <Typography><strong>Tiền hàng:</strong> {formatPrice(summary.originalAmount)}</Typography>
                                            <Typography><strong>Đã hoàn:</strong> {formatPrice(summary.returnedAmount)}</Typography>
                                            <Typography><strong>Còn lại:</strong> {formatPrice(summary.remainingAmount)}</Typography>
                                        </>
                                    )}
                                </Box>
                                {!['delivered', 'returned'].includes(order.status) && (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        Chỉ có thể hoàn hàng với đơn đã giao thành công.
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Chọn sản phẩm hoàn hàng
                                </Typography>
                                {order.hasPreviousReturns && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Đơn hàng đã hoàn trước đó. Vui lòng chọn số lượng còn lại để hoàn tiếp.
                                    </Alert>
                                )}
                                <Divider sx={{ mb: 2 }} />
                                {(order.originalItems || order.items || []).map((item, idx) => {
                                    const key = buildItemKey(item, idx);
                                    const qtyKey = buildQtyKey(item);
                                    const remainingQty = order.remainingQuantities?.[qtyKey] ?? item.quantity;
                                    const returnedQty = order.returnedQuantities?.[qtyKey] ?? 0;
                                    const originalQty = remainingQty + returnedQty;
                                    const state = selectedItems[key] || {};
                                    return (
                                        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, opacity: remainingQty === 0 ? 0.5 : 1 }}>
                                            <Checkbox
                                                checked={!!state.checked}
                                                onChange={() => handleToggleItem(key)}
                                                disabled={!['delivered', 'returned'].includes(order.status) || remainingQty === 0}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography fontWeight={600}>{item.productName}</Typography>
                                                {(item.variantInfo?.color || item.variantInfo?.size) && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.variantInfo?.color}{item.variantInfo?.color && item.variantInfo?.size ? ' - ' : ''}{item.variantInfo?.size}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2" color="text.secondary">
                                                    Giá: {formatPrice(item.finalPrice)} | SL mua: {originalQty} | Đã hoàn: {returnedQty} | Còn: {remainingQty}
                                                </Typography>
                                            </Box>
                                            <TextField
                                                type="number"
                                                size="small"
                                                label="SL trả"
                                                value={state.quantity || 1}
                                                onChange={(e) => handleQuantityChange(key, remainingQty, e.target.value)}
                                                inputProps={{ min: 1, max: remainingQty }}
                                                sx={{ width: 110 }}
                                                disabled={!state.checked || !['delivered', 'returned'].includes(order.status) || remainingQty === 0}
                                            />
                                        </Box>
                                    );
                                })}
                                <Divider sx={{ my: 2 }} />
                                <TextField
                                    label="Lý do hoàn hàng"
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    placeholder="Nhập lý do hoàn hàng (nếu có)"
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography fontWeight={600}>Số tiền hoàn:</Typography>
                                    <Typography fontWeight={700} color="primary">
                                        {formatPrice(refundAmount)}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    fullWidth
                                    disabled={!['delivered', 'returned'].includes(order.status) || actionLoading}
                                    onClick={handleConfirmReturn}
                                >
                                    {actionLoading ? 'Đang xử lý...' : 'Xác nhận hoàn hàng'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Danh sách hoàn hàng</Typography>
                    <Button startIcon={<Replay />} onClick={loadReturns} disabled={returnsLoading}>
                        Làm mới
                    </Button>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Thời gian</TableCell>
                                <TableCell>Mã đơn</TableCell>
                                <TableCell>Khách hàng</TableCell>
                                <TableCell align="right">Số tiền hoàn</TableCell>
                                <TableCell>Sản phẩm hoàn</TableCell>
                                <TableCell>Lý do</TableCell>
                                <TableCell>Nhân viên</TableCell>
                                <TableCell>Trạng thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {returnsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <CircularProgress size={22} />
                                    </TableCell>
                                </TableRow>
                            ) : returns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                returns.map((record) => (
                                    <TableRow key={record._id} hover>
                                        <TableCell>{formatDate(record.createdAt)}</TableCell>
                                        <TableCell>{record.orderCode}</TableCell>
                                        <TableCell>{record.customerId?.username || record.customerId?.email}</TableCell>
                                        <TableCell align="right">{formatPrice(record.refundAmount)}</TableCell>
                                        <TableCell>
                                            {(record.items || []).map((item) => (
                                                <div key={`${item.productId}-${item.variantId || ''}`}>
                                                    {item.productName} x {item.quantity}
                                                </div>
                                            ))}
                                        </TableCell>
                                        <TableCell>{record.reason || '-'}</TableCell>
                                        <TableCell>{record.processedBy?.username || '-'}</TableCell>
                                        <TableCell>
                                            <Chip label={record.status || 'confirmed'} color="success" size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
