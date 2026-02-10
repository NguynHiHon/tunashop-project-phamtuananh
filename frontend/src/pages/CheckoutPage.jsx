import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
    LocalShipping,
    Payment,
    CheckCircle,
    ShoppingCart,
    ArrowBack,
} from '@mui/icons-material';
import { createOrder, clearCreatedOrder } from '../redux/clices/orderSlice';
import { clearCart } from '../redux/clices/cartSlice';
import { getProvinces, getDistricts, getWards, formatFullAddress } from '../services/addressService';

const SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 50000;

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { items: cartItems, subtotal: cartSubtotal } = useSelector((state) => state.cart);
    const { createdOrder, loading, error } = useSelector((state) => state.order);
    const { currentUser: user } = useSelector((state) => state.auth);

    // Check if coming from "Buy Now" with single product
    const buyNowItem = location.state?.buyNowItem;
    const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

    // Address form state
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        provinceCode: '',
        provinceName: '',
        districtCode: '',
        districtName: '',
        wardCode: '',
        wardName: '',
        addressDetail: '',
        note: '',
    });

    // Address options
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Payment method (only COD for now)
    const [paymentMethod] = useState('cod');

    // Order success state
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Calculate totals
    const subtotal = buyNowItem
        ? buyNowItem.finalPrice * buyNowItem.quantity
        : cartSubtotal;
    const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    // Form validation
    const [formErrors, setFormErrors] = useState({});

    // Load provinces on mount
    useEffect(() => {
        const loadProvinces = async () => {
            setLoadingAddress(true);
            try {
                const data = await getProvinces();
                setProvinces(data);
            } catch (err) {
                console.error('Failed to load provinces:', err);
            } finally {
                setLoadingAddress(false);
            }
        };
        loadProvinces();
    }, []);

    // Load districts when province changes
    useEffect(() => {
        if (formData.provinceCode) {
            const loadDistricts = async () => {
                setLoadingAddress(true);
                try {
                    const data = await getDistricts(formData.provinceCode);
                    setDistricts(data);
                    setWards([]);
                    setFormData((prev) => ({
                        ...prev,
                        districtCode: '',
                        districtName: '',
                        wardCode: '',
                        wardName: '',
                    }));
                } catch (err) {
                    console.error('Failed to load districts:', err);
                } finally {
                    setLoadingAddress(false);
                }
            };
            loadDistricts();
        }
    }, [formData.provinceCode]);

    // Load wards when district changes
    useEffect(() => {
        if (formData.districtCode) {
            const loadWards = async () => {
                setLoadingAddress(true);
                try {
                    const data = await getWards(formData.districtCode);
                    setWards(data);
                    setFormData((prev) => ({
                        ...prev,
                        wardCode: '',
                        wardName: '',
                    }));
                } catch (err) {
                    console.error('Failed to load wards:', err);
                } finally {
                    setLoadingAddress(false);
                }
            };
            loadWards();
        }
    }, [formData.districtCode]);

    // Handle createdOrder success
    useEffect(() => {
        if (createdOrder) {
            setOrderSuccess(true);
            if (!buyNowItem) {
                dispatch(clearCart());
            }
        }
    }, [createdOrder, buyNowItem, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearCreatedOrder());
        };
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleProvinceChange = (e) => {
        const province = provinces.find((p) => p.code === e.target.value);
        if (province) {
            setFormData((prev) => ({
                ...prev,
                provinceCode: province.code,
                provinceName: province.name,
            }));
        }
    };

    const handleDistrictChange = (e) => {
        const district = districts.find((d) => d.code === e.target.value);
        if (district) {
            setFormData((prev) => ({
                ...prev,
                districtCode: district.code,
                districtName: district.name,
            }));
        }
    };

    const handleWardChange = (e) => {
        const ward = wards.find((w) => w.code === e.target.value);
        if (ward) {
            setFormData((prev) => ({
                ...prev,
                wardCode: ward.code,
                wardName: ward.name,
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
        if (!formData.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }
        if (!formData.provinceCode) errors.provinceCode = 'Vui lòng chọn tỉnh/thành phố';
        if (!formData.districtCode) errors.districtCode = 'Vui lòng chọn quận/huyện';
        if (!formData.wardCode) errors.wardCode = 'Vui lòng chọn phường/xã';
        if (!formData.addressDetail.trim()) errors.addressDetail = 'Vui lòng nhập địa chỉ chi tiết';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitOrder = async () => {
        if (!validateForm()) return;

        const orderData = {
            items: checkoutItems.map((item) => ({
                productId: item.productId || item._id,
                variantId: item.variantId || null,
                variantInfo: item.variantInfo || null,
                quantity: item.quantity,
            })),
            shippingAddress: {
                fullName: formData.fullName,
                phone: formData.phone,
                provinceCode: formData.provinceCode,
                provinceName: formData.provinceName,
                districtCode: formData.districtCode,
                districtName: formData.districtName,
                wardCode: formData.wardCode,
                wardName: formData.wardName,
                addressDetail: formData.addressDetail,
            },
            paymentMethod: 'cod',
            note: formData.note,
        };

        dispatch(createOrder(orderData));
    };

    // Redirect if no items to checkout
    if (!buyNowItem && cartItems.length === 0 && !orderSuccess) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Không có sản phẩm để thanh toán
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/cart')}
                        sx={{ mt: 2 }}
                    >
                        Quay lại giỏ hàng
                    </Button>
                </Paper>
            </Container>
        );
    }

    // Order success screen
    if (orderSuccess && createdOrder) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" color="success.main" gutterBottom>
                        Đặt hàng thành công!
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Mã đơn hàng: <strong>{createdOrder.orderCode}</strong>
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
                    </Typography>
                    <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                        <Typography variant="body2">
                            <strong>Địa chỉ giao hàng:</strong>{' '}
                            {formatFullAddress(createdOrder.shippingAddress)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Tổng thanh toán:</strong> {formatPrice(createdOrder.total)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD)
                        </Typography>
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="outlined" onClick={() => navigate('/orders')}>
                            Xem đơn hàng của tôi
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/')}>
                            Tiếp tục mua sắm
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Thanh toán
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Left: Shipping Address Form */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Thông tin giao hàng</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Họ và tên *"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    error={!!formErrors.fullName}
                                    helperText={formErrors.fullName}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Số điện thoại *"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    error={!!formErrors.phone}
                                    helperText={formErrors.phone}
                                    placeholder="0912345678"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth error={!!formErrors.provinceCode}>
                                    <InputLabel>Tỉnh/Thành phố *</InputLabel>
                                    <Select
                                        value={formData.provinceCode}
                                        onChange={handleProvinceChange}
                                        label="Tỉnh/Thành phố *"
                                        disabled={loadingAddress && provinces.length === 0}
                                    >
                                        {provinces.map((province) => (
                                            <MenuItem key={province.code} value={province.code}>
                                                {province.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.provinceCode && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {formErrors.provinceCode}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth error={!!formErrors.districtCode}>
                                    <InputLabel>Quận/Huyện *</InputLabel>
                                    <Select
                                        value={formData.districtCode}
                                        onChange={handleDistrictChange}
                                        label="Quận/Huyện *"
                                        disabled={!formData.provinceCode || loadingAddress}
                                    >
                                        {districts.map((district) => (
                                            <MenuItem key={district.code} value={district.code}>
                                                {district.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.districtCode && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {formErrors.districtCode}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth error={!!formErrors.wardCode}>
                                    <InputLabel>Phường/Xã *</InputLabel>
                                    <Select
                                        value={formData.wardCode}
                                        onChange={handleWardChange}
                                        label="Phường/Xã *"
                                        disabled={!formData.districtCode || loadingAddress}
                                    >
                                        {wards.map((ward) => (
                                            <MenuItem key={ward.code} value={ward.code}>
                                                {ward.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.wardCode && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {formErrors.wardCode}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Địa chỉ chi tiết *"
                                    name="addressDetail"
                                    value={formData.addressDetail}
                                    onChange={handleInputChange}
                                    error={!!formErrors.addressDetail}
                                    helperText={formErrors.addressDetail}
                                    placeholder="Số nhà, tên đường, tòa nhà..."
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Ghi chú đơn hàng"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={2}
                                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn..."
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Payment Method */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Payment sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Phương thức thanh toán</Typography>
                        </Box>

                        <FormControl component="fieldset">
                            <RadioGroup value={paymentMethod}>
                                <FormControlLabel
                                    value="cod"
                                    control={<Radio />}
                                    label={
                                        <Box>
                                            <Typography variant="body1">
                                                Thanh toán khi nhận hàng (COD)
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Thanh toán bằng tiền mặt khi nhận hàng
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                </Grid>

                {/* Right: Order Summary */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
                        <Typography variant="h6" gutterBottom>
                            Đơn hàng ({checkoutItems.length} sản phẩm)
                        </Typography>

                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {checkoutItems.map((item) => {
                                const itemId = item.productId || item._id;
                                const itemPrice = item.finalPrice || item.price;
                                const itemOriginalPrice = item.price;
                                const hasSale = item.salePercent > 0;
                                const variantInfo = item.variantInfo;

                                return (
                                    <ListItem key={itemId} alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                src={item.productImage || item.image}
                                                alt={item.productName || item.name}
                                                variant="rounded"
                                                sx={{ width: 60, height: 60, mr: 1 }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {item.productName || item.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box component="span">
                                                    {(variantInfo?.color || variantInfo?.size) && (
                                                        <Typography variant="caption" component="span" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                            {variantInfo.color}{variantInfo.color && variantInfo.size ? ' - ' : ''}{variantInfo.size ? `Size: ${variantInfo.size}` : ''}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body2" component="span" sx={{ display: 'block' }}>SL: {item.quantity}</Typography>
                                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" component="span" color="primary" fontWeight="500">
                                                            {formatPrice(itemPrice)}
                                                        </Typography>
                                                        {hasSale && (
                                                            <Typography
                                                                variant="caption"
                                                                component="span"
                                                                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                                            >
                                                                {formatPrice(itemOriginalPrice)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                            secondaryTypographyProps={{ component: 'div' }}
                                        />
                                        <Typography variant="body2" fontWeight="500">
                                            {formatPrice(itemPrice * item.quantity)}
                                        </Typography>
                                    </ListItem>
                                );
                            })}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">Tạm tính:</Typography>
                            <Typography>{formatPrice(subtotal)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">Phí vận chuyển:</Typography>
                            <Typography color={shippingFee === 0 ? 'success.main' : 'inherit'}>
                                {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                            </Typography>
                        </Box>

                        {shippingFee === 0 && (
                            <Alert severity="success" sx={{ mb: 2, py: 0 }}>
                                <Typography variant="caption">
                                    Bạn được miễn phí vận chuyển cho đơn hàng từ {formatPrice(SHIPPING_THRESHOLD)}
                                </Typography>
                            </Alert>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6">Tổng cộng:</Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                                {formatPrice(total)}
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleSubmitOrder}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                        >
                            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            sx={{ mt: 1 }}
                            onClick={() => navigate(buyNowItem ? -1 : '/cart')}
                        >
                            Quay lại
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CheckoutPage;
