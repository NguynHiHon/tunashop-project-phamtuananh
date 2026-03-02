import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Container, Typography, Breadcrumbs, Link, Paper,
    Button, Divider, Skeleton, Table, TableBody, TableRow, TableCell,
    Chip, Tab, Tabs, IconButton, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ProductCard } from '../components/Home';
import * as productService from '../services/productService';
import { addToCart } from '../redux/clices/cartSlice';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

/* ── Tab Panel ── */
function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

/* ── Main Component ── */
export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser: user } = useSelector((state) => state.auth);
    const { loading: cartLoading } = useSelector((state) => state.cart);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [buyNowLoading, setBuyNowLoading] = useState(false);

    // Variant selection
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    // Get available sizes and colors from product variants
    const getAvailableSizes = () => {
        if (!product?.hasVariants || !product.variants?.length) return [];
        return [...new Set(product.variants.filter(v => v.isActive !== false && v.size).map(v => v.size))];
    };

    const getAvailableColors = () => {
        if (!product?.hasVariants || !product.variants?.length) return [];
        const colorMap = new Map();
        product.variants
            .filter(v => v.isActive !== false && v.color)
            .forEach(v => {
                if (!colorMap.has(v.color)) {
                    colorMap.set(v.color, v.colorCode || '#000000');
                }
            });
        return Array.from(colorMap, ([name, code]) => ({ name, code }));
    };

    // Update selectedVariant when size/color changes
    React.useEffect(() => {
        if (product?.hasVariants && product?.variants?.length) {
            const variant = product.variants.find(v =>
                v.isActive !== false &&
                (!selectedSize || v.size === selectedSize) &&
                (!selectedColor || v.color === selectedColor)
            ) || null;
            setSelectedVariant(variant);
        }
    }, [selectedSize, selectedColor, product?.hasVariants, product?.variants]);

    // Reset variant selection when product changes
    React.useEffect(() => {
        if (product?.hasVariants && product?.variants?.length) {
            const firstVariant = product.variants.find(v => v.isActive !== false);
            if (firstVariant) {
                setSelectedSize(firstVariant.size || '');
                setSelectedColor(firstVariant.color || '');
            }
        } else {
            setSelectedSize('');
            setSelectedColor('');
            setSelectedVariant(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?._id]);

    // Helper: Check if product is on sale (matches backend logic)
    const checkIsOnSale = () => {
        if (!product) return false;
        // Use backend virtual if available
        if (product.isOnSale !== undefined) return product.isOnSale;
        // Fallback: calculate ourselves (same logic as backend)
        const now = new Date();
        const hasValue = (Number(product.salePercent) || 0) > 0;
        if (!hasValue) return false;
        const startOk = !product.saleStartAt || new Date(product.saleStartAt) <= now;
        const endOk = !product.saleEndAt || new Date(product.saleEndAt) >= now;
        return startOk && endOk;
    };

    // Calculate final price (with sale and variant adjustment) - matches backend logic
    const getFinalPrice = () => {
        if (!product) return 0;
        let basePrice = product.price || 0;

        // Add variant price adjustment if applicable
        if (product.hasVariants && selectedVariant?.priceAdjustment) {
            basePrice += selectedVariant.priceAdjustment;
        }

        // Apply sale discount
        if (checkIsOnSale()) {
            return Math.round(basePrice * (1 - product.salePercent / 100));
        }
        return basePrice;
    };

    // Get current stock based on variant or product
    const getCurrentStock = () => {
        if (product?.hasVariants && selectedVariant) {
            return selectedVariant.stock || 0;
        }
        return product?.stock || 0;
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Vui lòng đăng nhập để thêm vào giỏ hàng', severity: 'warning' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }
        // Check if variant is required but not selected
        if (product.hasVariants && !selectedVariant) {
            setSnackbar({ open: true, message: 'Vui lòng chọn size/màu sắc', severity: 'warning' });
            return;
        }
        try {
            const payload = { productId: product._id, quantity };
            if (product.hasVariants && selectedVariant) {
                payload.variantId = selectedVariant._id;
            }
            await dispatch(addToCart(payload)).unwrap();
            setSnackbar({ open: true, message: 'Đã thêm vào giỏ hàng!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err || 'Không thể thêm vào giỏ hàng', severity: 'error' });
        }
    };

    // Handle buy now
    const handleBuyNow = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Vui lòng đăng nhập để mua hàng', severity: 'warning' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }
        // Check if variant is required but not selected
        if (product.hasVariants && !selectedVariant) {
            setSnackbar({ open: true, message: 'Vui lòng chọn size/màu sắc', severity: 'warning' });
            return;
        }
        setBuyNowLoading(true);
        const buyNowItem = {
            _id: product._id,
            productId: product._id,
            productName: product.name,
            productImage: product.defaultImageId?.url_Image || product.imageIds?.[0]?.url_Image,
            name: product.name,
            image: product.defaultImageId?.url_Image || product.imageIds?.[0]?.url_Image,
            price: product.price,
            salePercent: product.salePercent || 0,
            finalPrice: getFinalPrice(),
            quantity,
            // Include variant info if applicable
            variantId: selectedVariant?._id || null,
            variantInfo: selectedVariant ? {
                size: selectedVariant.size,
                color: selectedVariant.color,
                colorCode: selectedVariant.colorCode,
                sku: selectedVariant.sku,
                priceAdjustment: selectedVariant.priceAdjustment,
            } : null,
        };
        navigate('/checkout', { state: { buyNowItem } });
        setBuyNowLoading(false);
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    /* ── Fetch product detail ── */
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setSelectedImage(0);
            try {
                const res = await productService.getProduct(id);
                setProduct(res.data || res);
            } catch (err) {
                console.error('Failed to fetch product', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    /* ── Fetch related products ── */
    useEffect(() => {
        if (!product?.productTypeId?._id) return;
        (async () => {
            try {
                const res = await productService.getAllProducts({
                    productType: product.productTypeId.name,
                    limit: 9,
                    page: 1,
                });
                const related = (res.data || []).filter((p) => p._id !== product._id).slice(0, 8);
                setRelatedProducts(related);
            } catch (err) {
                console.error('Failed to fetch related products', err);
            }
        })();
    }, [product]);

    /* ── Build images array ── */
    const images = (() => {
        if (!product) return [];
        const imgs = [];
        if (product.defaultImageId) imgs.push(product.defaultImageId);
        if (product.imageIds?.length) {
            product.imageIds.forEach((img) => {
                if (img._id !== product.defaultImageId?._id) imgs.push(img);
            });
        }
        return imgs;
    })();

    const handlePrevImage = () => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    const handleNextImage = () => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Skeleton variant="text" height={24} width={300} sx={{ mb: 3 }} />
                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} variant="rectangular" width={70} height={70} sx={{ borderRadius: 1 }} />
                            ))}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Skeleton variant="text" height={40} width="80%" />
                        <Skeleton variant="text" height={50} width="35%" sx={{ mt: 1 }} />
                        <Skeleton variant="rectangular" height={200} sx={{ mt: 3, borderRadius: 1 }} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    /* ── Not found ── */
    if (!product) {
        return (
            <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    Không tìm thấy sản phẩm
                </Typography>
                <Button component={RouterLink} to="/products" variant="contained" sx={{ mt: 2, bgcolor: '#f26522' }}>
                    Quay lại danh sách
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* ── Breadcrumbs ── */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                <Link
                    component={RouterLink}
                    to="/"
                    underline="hover"
                    color="inherit"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.9rem' }}
                >
                    <HomeIcon fontSize="small" />
                    Trang chủ
                </Link>
                {product.productTypeId?.name_vi && (
                    <Link
                        component={RouterLink}
                        to={`/products?productType=${encodeURIComponent(product.productTypeId.name)}`}
                        underline="hover"
                        color="inherit"
                        sx={{ fontSize: '0.9rem' }}
                    >
                        {product.productTypeId.name_vi}
                    </Link>
                )}
                <Typography
                    color="text.primary"
                    fontWeight={600}
                    sx={{
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 350,
                    }}
                >
                    {product.name}
                </Typography>
            </Breadcrumbs>

            <Grid container spacing={4}>
                {/* ───────── Image Gallery ───────── */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        {/* Main Image */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                paddingTop: '100%',
                                bgcolor: '#fafafa',
                                borderRadius: 2,
                                overflow: 'hidden',
                                mb: 2,
                            }}
                        >
                            {images.length > 0 && (
                                <Box
                                    component="img"
                                    src={images[selectedImage]?.url_Image}
                                    alt={product.name}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        p: 3,
                                        transition: 'opacity 0.3s ease',
                                    }}
                                />
                            )}

                            {/* Nav arrows */}
                            {images.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.85)',
                                            '&:hover': { bgcolor: '#fff' },
                                        }}
                                        size="small"
                                    >
                                        <ArrowBackIosNewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.85)',
                                            '&:hover': { bgcolor: '#fff' },
                                        }}
                                        size="small"
                                    >
                                        <ArrowForwardIosIcon fontSize="small" />
                                    </IconButton>
                                </>
                            )}
                        </Box>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                                {images.map((img, idx) => (
                                    <Box
                                        key={img._id || idx}
                                        onClick={() => setSelectedImage(idx)}
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            flexShrink: 0,
                                            border: selectedImage === idx ? '2px solid #f26522' : '2px solid #e0e0e0',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s',
                                            '&:hover': { borderColor: '#f26522' },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={img.url_Image}
                                            alt=""
                                            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* ───────── Product Info ───────── */}
                <Grid item xs={12} md={7}>
                    {/* Title */}
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.4, color: '#222' }}>
                        {product.name}
                    </Typography>

                    {/* Category chip */}
                    {product.productTypeId?.name_vi && (
                        <Chip
                            label={product.productTypeId.name_vi}
                            component={RouterLink}
                            to={`/products?productType=${encodeURIComponent(product.productTypeId.name)}`}
                            clickable
                            size="small"
                            sx={{ mb: 2, bgcolor: 'rgba(242,101,34,0.1)', color: '#f26522', fontWeight: 500 }}
                        />
                    )}

                    {/* Price */}
                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                            bgcolor: 'linear-gradient(135deg, #fff5f0 0%, #fff 100%)',
                            background: 'linear-gradient(135deg, #fff5f0 0%, #fff 100%)',
                            borderRadius: 2,
                            border: '1px solid #ffe0cc',
                        }}
                    >
                        {/* Check if product is on sale using our helper */}
                        {checkIsOnSale() ? (
                            <>
                                <Typography variant="h4" sx={{ color: '#e53935', fontWeight: 700 }}>
                                    {formatPrice(getFinalPrice())}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                                    <Typography variant="body1" sx={{ color: '#999', textDecoration: 'line-through' }}>
                                        {formatPrice(product.price)}
                                    </Typography>
                                    <Chip
                                        label={`-${product.salePercent}%`}
                                        size="small"
                                        sx={{ bgcolor: '#e53935', color: '#fff', fontWeight: 700 }}
                                    />
                                </Box>
                            </>
                        ) : (
                            <Typography variant="h4" sx={{ color: '#f26522', fontWeight: 700 }}>
                                {formatPrice(product.price + (selectedVariant?.priceAdjustment || 0))}
                            </Typography>
                        )}
                    </Box>

                    {/* Variant Selection (Color/Special → Size) */}
                    {product.hasVariants && product.variants?.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            {/* Color/Special Attribute Selection (First) */}
                            {getAvailableColors().length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                                        Phân loại:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {getAvailableColors().map((color) => (
                                            <Button
                                                key={color.name}
                                                variant={selectedColor === color.name ? 'contained' : 'outlined'}
                                                size="small"
                                                onClick={() => setSelectedColor(color.name)}
                                                sx={{
                                                    minWidth: 60,
                                                    borderColor: selectedColor === color.name ? '#f26522' : '#ddd',
                                                    bgcolor: selectedColor === color.name ? '#f26522' : 'transparent',
                                                    color: selectedColor === color.name ? '#fff' : '#333',
                                                    '&:hover': {
                                                        borderColor: '#f26522',
                                                        bgcolor: selectedColor === color.name ? '#d55820' : 'rgba(242,101,34,0.1)',
                                                    },
                                                }}
                                            >
                                                {color.name}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Size Selection (Second) */}
                            {getAvailableSizes().length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                                        Kích thước:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {getAvailableSizes().map((size) => (
                                            <Button
                                                key={size}
                                                variant={selectedSize === size ? 'contained' : 'outlined'}
                                                size="small"
                                                onClick={() => setSelectedSize(size)}
                                                sx={{
                                                    minWidth: 48,
                                                    borderColor: selectedSize === size ? '#f26522' : '#ddd',
                                                    bgcolor: selectedSize === size ? '#f26522' : 'transparent',
                                                    color: selectedSize === size ? '#fff' : '#333',
                                                    '&:hover': {
                                                        borderColor: '#f26522',
                                                        bgcolor: selectedSize === size ? '#d55820' : 'rgba(242,101,34,0.1)',
                                                    },
                                                }}
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Variant Stock Info */}
                            {selectedVariant && (
                                <Chip
                                    label={`${selectedVariant.color ? selectedVariant.color + ' - ' : ''}${selectedVariant.size ? 'Size ' + selectedVariant.size + ' - ' : ''}Còn ${selectedVariant.stock} sản phẩm`}
                                    size="small"
                                    variant="outlined"
                                    color={selectedVariant.stock > 0 ? 'success' : 'error'}
                                    sx={{ fontWeight: 500 }}
                                />
                            )}
                        </Box>
                    )}

                    {/* Attributes Table */}
                    {product.attributes?.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1rem' }}>
                                Thông số kỹ thuật
                            </Typography>
                            <Table size="small" sx={{ '& td': { py: 1, px: 2 } }}>
                                <TableBody>
                                    {product.attributes.map((attr, idx) => (
                                        <TableRow
                                            key={idx}
                                            sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' } }}
                                        >
                                            <TableCell
                                                sx={{ fontWeight: 600, width: '40%', color: '#555', border: 'none', fontSize: '0.9rem' }}
                                            >
                                                {attr.attributeId?.name_vi || attr.attributeId?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ border: 'none', fontSize: '0.9rem' }}>{attr.value}</TableCell>
                                        </TableRow>
                                    ))}
                                    {product.warranty && (
                                        <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' } }}>
                                            <TableCell sx={{ fontWeight: 600, width: '40%', color: '#555', border: 'none', fontSize: '0.9rem' }}>
                                                Bảo hành
                                            </TableCell>
                                            <TableCell sx={{ border: 'none', fontSize: '0.9rem' }}>{product.warranty}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Stock & Actions */}
                    <Box sx={{ mb: 3 }}>
                        {/* Only show general stock if not using variants */}
                        {!product.hasVariants && (
                            <Typography
                                variant="body1"
                                component="div"
                                sx={{
                                    mb: 2.5,
                                    fontWeight: 600,
                                    color: getCurrentStock() > 0 ? '#00a651' : '#e53935',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: getCurrentStock() > 0 ? '#00a651' : '#e53935',
                                    }}
                                />
                                {getCurrentStock() > 0 ? `Còn hàng (${getCurrentStock()} sản phẩm)` : 'Hết hàng'}
                            </Typography>
                        )}

                        {/* Quantity selector */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="body1" fontWeight={600}>Số lượng:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </IconButton>
                                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>{quantity}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => setQuantity(Math.min(getCurrentStock(), quantity + 1))}
                                    disabled={quantity >= getCurrentStock()}
                                >
                                    +
                                </IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                                disabled={getCurrentStock() === 0 || cartLoading || (product.hasVariants && !selectedVariant)}
                                onClick={handleAddToCart}
                                sx={{
                                    bgcolor: '#f26522',
                                    '&:hover': { bgcolor: '#d95a1a' },
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(242,101,34,0.3)',
                                }}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={buyNowLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingBagIcon />}
                                disabled={getCurrentStock() === 0 || buyNowLoading || (product.hasVariants && !selectedVariant)}
                                onClick={handleBuyNow}
                                sx={{
                                    bgcolor: '#e53935',
                                    '&:hover': { bgcolor: '#c62828' },
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(229,57,53,0.3)',
                                }}
                            >
                                Mua ngay
                            </Button>
                        </Box>
                    </Box>

                    {/* Service Info */}
                    <Paper
                        sx={{
                            p: 2.5,
                            bgcolor: '#f8faf8',
                            border: '1px solid #e8f5e9',
                            borderRadius: 2,
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(242,101,34,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <LocalShippingIcon sx={{ color: '#f26522', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            Giao hàng toàn quốc
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Miễn phí đơn từ 500K
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(0,166,81,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <VerifiedIcon sx={{ color: '#00a651', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            Chính hãng 100%
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Cam kết sản phẩm chính hãng
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(25,118,210,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ShieldIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            Bảo hành chính hãng
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Theo chính sách nhà sản xuất
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* ───────── Description Tabs ───────── */}
            <Paper sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: '#fafafa',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            minHeight: 56,
                        },
                        '& .Mui-selected': { color: '#f26522' },
                        '& .MuiTabs-indicator': { bgcolor: '#f26522', height: 3 },
                    }}
                >
                    <Tab label="Mô tả sản phẩm" />
                    <Tab label="Thông số kỹ thuật" />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    <Box
                        sx={{
                            px: 3,
                            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                            '& p': { lineHeight: 1.8, color: '#444', wordWrap: 'break-word', overflowWrap: 'break-word' },
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: '#444',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        {product.description ? (
                            <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        ) : (
                            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Chưa có mô tả cho sản phẩm này.
                            </Typography>
                        )}
                    </Box>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ px: 3 }}>
                        {product.attributes?.length > 0 ? (
                            <Table sx={{ '& td, & th': { py: 1.5 } }}>
                                <TableBody>
                                    {product.attributes.map((attr, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    width: '35%',
                                                    bgcolor: '#f9f9f9',
                                                    fontSize: '0.9rem',
                                                    color: '#444',
                                                }}
                                            >
                                                {attr.attributeId?.name_vi || attr.attributeId?.name}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.9rem' }}>{attr.value}</TableCell>
                                        </TableRow>
                                    ))}
                                    {product.warranty && (
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    width: '35%',
                                                    bgcolor: '#f9f9f9',
                                                    fontSize: '0.9rem',
                                                    color: '#444',
                                                }}
                                            >
                                                Bảo hành
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.9rem' }}>{product.warranty}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Chưa có thông số kỹ thuật.
                            </Typography>
                        )}
                    </Box>
                </TabPanel>
            </Paper>

            {/* ───────── Related Products ───────── */}
            {relatedProducts.length > 0 && (
                <Box sx={{ mt: 5, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ width: 4, height: 28, bgcolor: '#f26522', borderRadius: 1, mr: 1.5 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '1.2rem' }}>
                            Sản phẩm liên quan
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {relatedProducts.map((p) => (
                            <Grid item xs={6} sm={4} md={3} key={p._id}>
                                <ProductCard product={p} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Snackbar notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
