import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Container, Typography, Button, IconButton, Divider,
    Paper, Stack, Skeleton, Breadcrumbs, Link, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { fetchCart, updateCartItem, removeFromCart } from '../redux/clices/cartSlice';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

export default function CartPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const cart = useSelector((state) => state.cart);
    const { items, subtotal, shippingFee, total, amountToFreeShipping, loading } = cart;

    const [updatingItems, setUpdatingItems] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleUpdateQuantity = async (productId, newQuantity, variantId = null) => {
        if (newQuantity < 1) return;
        const key = variantId ? `${productId}-${variantId}` : productId;
        setUpdatingItems((prev) => ({ ...prev, [key]: true }));
        await dispatch(updateCartItem({ productId, quantity: newQuantity, variantId }));
        setUpdatingItems((prev) => ({ ...prev, [key]: false }));
    };

    const handleRemoveItem = async (productId, variantId = null) => {
        const key = variantId ? `${productId}-${variantId}` : productId;
        setUpdatingItems((prev) => ({ ...prev, [key]: true }));
        await dispatch(removeFromCart({ productId, variantId }));
        setUpdatingItems((prev) => ({ ...prev, [key]: false }));
    };

    // Get unique key for cart item (considering variants)
    const getItemKey = (item) => item.variantId ? `${item.productId}-${item.variantId}` : item.productId;

    if (!isAuthenticated) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Vui lòng đăng nhập để xem giỏ hàng
                </Alert>
                <Button variant="contained" onClick={() => navigate('/signin')}>
                    Đăng nhập
                </Button>
            </Container>
        );
    }

    if (loading && items.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Skeleton variant="text" height={40} width={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={300} />
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="lg">
                {/* Breadcrumbs */}
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                    <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" />
                        Trang chủ
                    </Link>
                    <Typography color="text.primary" fontWeight={600}>Giỏ hàng</Typography>
                </Breadcrumbs>

                <Typography variant="h4" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon /> Giỏ hàng của bạn
                </Typography>

                {items.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <ShoppingCartIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Giỏ hàng trống
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Hãy thêm sản phẩm vào giỏ hàng để tiến hành mua sắm
                        </Typography>
                        <Button component={RouterLink} to="/products" variant="contained" sx={{ bgcolor: '#f26522' }}>
                            Tiếp tục mua sắm
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {/* Cart Items */}
                        <Grid item xs={12} md={8}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Sản phẩm</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Đơn giá</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Số lượng</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Thành tiền</TableCell>
                                            <TableCell align="center" sx={{ width: 60 }}></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((item) => {
                                            const itemKey = getItemKey(item);
                                            return (
                                                <TableRow key={itemKey} sx={{ opacity: updatingItems[itemKey] ? 0.5 : 1 }}>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Box
                                                                component={RouterLink}
                                                                to={`/products/${item.productId}`}
                                                                sx={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    flexShrink: 0,
                                                                    bgcolor: '#f9f9f9',
                                                                    borderRadius: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <img
                                                                    src={item.product?.image || '/vite.svg'}
                                                                    alt={item.product?.name}
                                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                />
                                                            </Box>
                                                            <Box>
                                                                <Typography
                                                                    component={RouterLink}
                                                                    to={`/products/${item.productId}`}
                                                                    variant="body1"
                                                                    fontWeight={600}
                                                                    sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#f26522' } }}
                                                                >
                                                                    {item.product?.name}
                                                                </Typography>
                                                                {/* Variant info display */}
                                                                {item.variantInfo && (item.variantInfo.size || item.variantInfo.color) && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                                        {item.variantInfo.color && (
                                                                            <Typography variant="caption" color="text.secondary" sx={{ bgcolor: '#f0f0f0', px: 0.75, py: 0.25, borderRadius: 0.5 }}>
                                                                                {item.variantInfo.color}
                                                                            </Typography>
                                                                        )}
                                                                        {item.variantInfo.size && (
                                                                            <Typography variant="caption" color="text.secondary" sx={{ bgcolor: '#f0f0f0', px: 0.75, py: 0.25, borderRadius: 0.5 }}>
                                                                                Size: {item.variantInfo.size}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                                {item.product?.isOnSale && (
                                                                    <Typography variant="caption" color="error" fontWeight={700}>
                                                                        Giảm {item.product.salePercent}%
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Stack>
                                                            <Typography variant="body1" fontWeight={600} color={item.product?.isOnSale ? 'error' : 'inherit'}>
                                                                {formatPrice(item.product?.finalPrice || 0)}
                                                            </Typography>
                                                            {item.product?.isOnSale && (
                                                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#999' }}>
                                                                    {formatPrice(item.product?.price || 0)}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                                                disabled={item.quantity <= 1 || updatingItems[itemKey]}
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                            <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                                                                {item.quantity}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                                                disabled={updatingItems[itemKey]}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body1" fontWeight={700} color="error">
                                                            {formatPrice(item.subtotal)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleRemoveItem(item.productId, item.variantId)}
                                                            disabled={updatingItems[itemKey]}
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        {/* Order Summary */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                    Tóm tắt đơn hàng
                                </Typography>

                                {amountToFreeShipping > 0 && (
                                    <Alert severity="info" icon={<LocalShippingOutlinedIcon />} sx={{ mb: 2 }}>
                                        Mua thêm <strong>{formatPrice(amountToFreeShipping)}</strong> để được <strong>MIỄN PHÍ SHIP</strong>
                                    </Alert>
                                )}

                                <Stack spacing={1.5} divider={<Divider />}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Tạm tính</Typography>
                                        <Typography fontWeight={600}>{formatPrice(subtotal)}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Phí vận chuyển</Typography>
                                        <Typography fontWeight={600} color={shippingFee === 0 ? 'success.main' : 'inherit'}>
                                            {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                                        <Typography variant="h6" fontWeight={700}>Tổng cộng</Typography>
                                        <Typography variant="h6" fontWeight={700} color="error">
                                            {formatPrice(total)}
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/checkout')}
                                    sx={{ mt: 3, bgcolor: '#f26522', py: 1.5, fontWeight: 700, fontSize: '1rem' }}
                                >
                                    Tiến hành thanh toán
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component={RouterLink}
                                    to="/products"
                                    sx={{ mt: 1.5, borderColor: '#f26522', color: '#f26522' }}
                                >
                                    Tiếp tục mua sắm
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
