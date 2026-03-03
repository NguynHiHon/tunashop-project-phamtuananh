import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    TextField,
    Slider,
    Chip,
    CircularProgress,
    IconButton,
    Divider,
    Paper,
    Avatar,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormHelperText,
    Card,
    CardMedia,
    CardContent,
    CardActions,
} from '@mui/material';
import {
    Close as CloseIcon,
    AutoAwesome as AIIcon,
    SmartToy as RobotIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:9999';
const BRANDS = ['all', 'Yonex', 'Lining', 'Victor', 'Mizuno', 'Apacs', 'Adidas', 'Nike'];

const formatVND = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
};

const formatPrice = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const AIAdvisorModal = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [productTypes, setProductTypes] = useState([]);
    const [productType, setProductType] = useState('all');
    const [brand, setBrand] = useState('all');
    const [budget, setBudget] = useState([300000, 5000000]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [result, setResult] = useState('');
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        const fetchTypes = async () => {
            setLoadingTypes(true);
            try {
                const res = await axios.get(`${API_URL}/api/product-types/all`);
                const data = res.data?.data || [];
                setProductTypes(Array.isArray(data) ? data : []);
            } catch { /* silent */ } finally {
                setLoadingTypes(false);
            }
        };
        fetchTypes();
    }, [open]);

    const handleAsk = async () => {
        if (!description.trim()) return;
        setLoading(true);
        setResult('');
        setProducts([]);
        setError('');
        try {
            const res = await axios.post(
                `${API_URL}/api/ai/advisor`,
                { budget: { min: budget[0], max: budget[1] }, brand, productType: productType === 'all' ? '' : productType, description },
                { withCredentials: true }
            );
            if (res.data.status === 'success') {
                setResult(res.data.recommendation);
                setProducts(res.data.products || []);
            } else {
                setError('Không thể lấy kết quả. Vui lòng thử lại.');
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => { setResult(''); setProducts([]); setError(''); };
    const handleClose = () => { setResult(''); setProducts([]); setError(''); onClose(); };

    const handleViewProduct = (id) => {
        handleClose();
        navigate(`/products/${id}`);
    };

    const renderResult = (text) =>
        text.split('\n').map((line, i) => {
            if (!line.trim()) return <Box key={i} sx={{ mb: 0.5 }} />;
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
                <Typography key={i} variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
                    {parts.map((part, j) =>
                        part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j}>{part.slice(2, -2)}</strong>
                            : part
                    )}
                </Typography>
            );
        });

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>

            {/* Header */}
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #ff6600 0%, #ff9500 100%)',
                color: 'white', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                    <RobotIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" fontSize="1rem">✨ Tư vấn sản phẩm AI</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Powered by Gemini • Gợi ý sản phẩm phù hợp nhất với bạn
                    </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'white' }} onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                {result || error ? (
                    /* --- KẾT QUẢ --- */
                    <Box sx={{ p: 2.5 }}>
                        {error ? (
                            <Box sx={{ bgcolor: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 2, p: 2, color: 'error.main' }}>
                                <Typography variant="body2">{error}</Typography>
                            </Box>
                        ) : (
                            <>
                                {/* Lời tư vấn AI */}
                                <Paper elevation={0} sx={{ bgcolor: '#fffaf6', border: '1px solid #ffe0b2', borderRadius: 2, p: 2.5, mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <AIIcon sx={{ color: '#ff6600', fontSize: 18 }} />
                                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                            Phân tích từ AI
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 1.5 }} />
                                    <Box>{renderResult(result)}</Box>
                                </Paper>

                                {/* Sản phẩm gợi ý */}
                                {products.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: 'text.secondary' }}>
                                            🛍 Sản phẩm được gợi ý ({products.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {products.map((product, idx) => (
                                                <Card key={product._id} variant="outlined" sx={{
                                                    display: 'flex',
                                                    borderRadius: 2,
                                                    border: '1.5px solid #ffe0b2',
                                                    transition: 'box-shadow 0.2s',
                                                    '&:hover': { boxShadow: '0 4px 16px rgba(255,102,0,0.15)', borderColor: '#ff6600' },
                                                }}>
                                                    {/* Ảnh sản phẩm */}
                                                    <Box sx={{ width: 90, minWidth: 90, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                                                        {product.imageUrl ? (
                                                            <CardMedia
                                                                component="img"
                                                                image={product.imageUrl}
                                                                alt={product.name}
                                                                sx={{ width: 70, height: 70, objectFit: 'contain', borderRadius: 1 }}
                                                            />
                                                        ) : (
                                                            <Box sx={{ width: 70, height: 70, bgcolor: '#e0e0e0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Typography variant="caption" color="text.secondary">No img</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* Thông tin sản phẩm */}
                                                    <CardContent sx={{ flex: 1, p: '10px 12px !important', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                                <Chip label={`#${idx + 1} Gợi ý`} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                                                                {product.salePercent > 0 && (
                                                                    <Chip label={`-${product.salePercent}%`} size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                                                                )}
                                                            </Box>
                                                            <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 0.3 }}>
                                                                {product.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {product.brand} {product.productType && `• ${product.productType}`}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                                            <Box>
                                                                <Typography variant="subtitle2" color="primary.main" fontWeight="bold" fontSize="0.85rem">
                                                                    {formatPrice(product.finalPrice)}
                                                                </Typography>
                                                                {product.salePercent > 0 && (
                                                                    <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                                                                        {formatPrice(product.price)}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                                                                onClick={() => handleViewProduct(product._id)}
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    fontSize: '0.72rem',
                                                                    py: 0.5,
                                                                    px: 1.2,
                                                                    bgcolor: '#ff6600',
                                                                    '&:hover': { bgcolor: '#e55a00' },
                                                                }}
                                                            >
                                                                Xem chi tiết
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </>
                        )}
                        <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: 2 }} onClick={handleReset}>
                            🔄 Tư vấn lại
                        </Button>
                    </Box>
                ) : (
                    /* --- FORM BỘ LỌC --- */
                    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Danh mục */}
                        <FormControl fullWidth size="small">
                            <InputLabel>🏷 Danh mục sản phẩm</InputLabel>
                            <Select value={productType} label="🏷 Danh mục sản phẩm" onChange={(e) => setProductType(e.target.value)} sx={{ borderRadius: 2 }} disabled={loadingTypes}>
                                <MenuItem value="all">Tất cả sản phẩm</MenuItem>
                                {productTypes.map((pt) => (
                                    <MenuItem key={pt._id} value={pt._id}>{pt.name_vi || pt.name}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Chọn loại sản phẩm muốn tư vấn</FormHelperText>
                        </FormControl>

                        {/* Thương hiệu */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>🏷 Thương hiệu yêu thích</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                {BRANDS.map((b) => (
                                    <Chip key={b} label={b === 'all' ? 'Tất cả' : b} onClick={() => setBrand(b)}
                                        variant={brand === b ? 'filled' : 'outlined'} color={brand === b ? 'primary' : 'default'}
                                        size="small" sx={{ cursor: 'pointer', borderRadius: 2 }} />
                                ))}
                            </Box>
                        </Box>

                        {/* Ngân sách */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">💰 Ngân sách</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                    {formatVND(budget[0])} – {formatVND(budget[1])}
                                </Typography>
                            </Box>
                            <Slider value={budget} onChange={(_, val) => setBudget(val)} min={100000} max={15000000} step={100000} disableSwap sx={{ color: 'primary.main' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">100k</Typography>
                                <Typography variant="caption" color="text.secondary">15tr</Typography>
                            </Box>
                        </Box>

                        {/* Mô tả */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                💬 Mô tả nhu cầu của bạn <Box component="span" color="error.main">*</Box>
                            </Typography>
                            <TextField fullWidth multiline rows={3} required
                                placeholder="VD: Tôi muốn vợt cầu lông Lining tầm 2-3 triệu, nhẹ và cứng để smash..."
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }}
                            />
                            <FormHelperText sx={{ mx: 0 }}>AI sẽ không tư vấn size sản phẩm.</FormHelperText>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            {!result && !error && (
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button fullWidth variant="contained" size="large" onClick={handleAsk}
                        disabled={loading || !description.trim()}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AIIcon />}
                        sx={{
                            borderRadius: 2.5, background: 'linear-gradient(135deg, #ff6600, #ff9500)',
                            fontWeight: 'bold', fontSize: '0.95rem', py: 1.3,
                            '&:hover': { background: 'linear-gradient(135deg, #e55a00, #e67e00)' },
                            '&.Mui-disabled': { background: '#e0e0e0' },
                        }}>
                        {loading ? 'AI đang phân tích...' : '✨ Tư vấn ngay'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default AIAdvisorModal;
