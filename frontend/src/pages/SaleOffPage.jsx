import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
    Box, Container, Typography, Breadcrumbs, Link,
    FormControlLabel, Checkbox, FormGroup, Select, MenuItem,
    Pagination as MuiPagination, Skeleton, Divider, Chip, Button,
    IconButton, Drawer, TextField, InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import useMediaQuery from '@mui/material/useMediaQuery';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { ProductCard } from '../components/Home';
import * as productService from '../services/productService';

/* ─── Constants ─── */
const PRICE_RANGES = [
    { label: 'Dưới 500.000đ', min: 0, max: 500000 },
    { label: '500.000đ - 1 triệu', min: 500000, max: 1000000 },
    { label: '1 - 2 triệu', min: 1000000, max: 2000000 },
    { label: '2 - 3 triệu', min: 2000000, max: 3000000 },
    { label: 'Trên 3 triệu', min: 3000000, max: null },
];

const SORT_OPTIONS = [
    { label: 'Mặc định', value: '' },
    { label: 'Giá tăng dần', value: 'price_asc' },
    { label: 'Giá giảm dần', value: 'price_desc' },
    { label: 'Tên A-Z', value: 'name_asc' },
    { label: 'Mới nhất', value: 'newest' },
];

const PRODUCTS_PER_PAGE = 20;

/* ─── Component ─── */
export default function SaleOffPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const isMobile = useMediaQuery('(max-width:899px)');

    const [products, setProducts] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [brandOptions, setBrandOptions] = useState([]);

    /* ── Derived values from URL ── */
    const productType = searchParams.get('productType') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const search = searchParams.get('search') || '';
    const brandFilter = searchParams.get('brand') || '';

    /* ── Find selected product type ── */
    const selectedType = useMemo(
        () => productTypes.find((t) => t.name === productType),
        [productTypes, productType],
    );

    /* ── Check if a price range is selected ── */
    const isPriceSelected = useCallback(
        (min, max) => {
            const pMin = searchParams.get('minPrice');
            const pMax = searchParams.get('maxPrice');
            return pMin === String(min) && (max === null ? !pMax : pMax === String(max));
        },
        [searchParams],
    );

    /* ── Check if a brand is selected ── */
    const isBrandSelected = useCallback(
        (b) => {
            const vals = (searchParams.get('brand') || '').split(',').filter(Boolean);
            return vals.includes(b);
        },
        [searchParams],
    );

    /* ── Fetch product types once ── */
    useEffect(() => {
        (async () => {
            try {
                const res = await productService.getProductTypesPublic();
                setProductTypes(res.data || []);
            } catch (err) {
                console.error('Failed to fetch product types', err);
            }
            try {
                const bRes = await productService.getBrands();
                setBrandOptions(Array.isArray(bRes) ? bRes : bRes.data || []);
            } catch {
                setBrandOptions(['Victor', 'Yonex', 'Li-Ning', 'Mizuno', 'Kumbo', 'Acer']);
            }
        })();
    }, []);

    /* ── Fetch products when URL params change ── */
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = { page, limit: PRODUCTS_PER_PAGE, isOnSale: 'true' };
                if (productType) params.productType = productType;
                if (sort) params.sort = sort;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                if (search) params.search = search;
                if (brandFilter) params.brand = brandFilter;

                const res = await productService.getAllProducts(params);
                setProducts(res.data || []);
                setTotalPages(res.totalPages || 0);
                setTotalProducts(res.total || 0);
            } catch (err) {
                console.error('Failed to fetch products', err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    /* ── Sync search input with URL ── */
    useEffect(() => {
        setSearchText(search);
    }, [search]);

    /* ──────────── Handlers ──────────── */

    const updateParams = useCallback(
        (updates, resetPage = true) => {
            const np = new URLSearchParams(searchParams);
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === undefined || value === '') np.delete(key);
                else np.set(key, String(value));
            }
            if (resetPage && !('page' in updates)) np.set('page', '1');
            setSearchParams(np);
        },
        [searchParams, setSearchParams],
    );

    const handleCategorySelect = (typeName) => {
        const np = new URLSearchParams();
        if (typeName) np.set('productType', typeName);
        np.set('page', '1');
        setSearchParams(np);
    };

    const handlePriceSelect = (min, max) => {
        if (isPriceSelected(min, max)) {
            updateParams({ minPrice: null, maxPrice: null });
        } else {
            updateParams({ minPrice: min, maxPrice: max });
        }
    };

    const handleBrandToggle = (brandName) => {
        const current = (searchParams.get('brand') || '').split(',').filter(Boolean);
        const newValues = current.includes(brandName)
            ? current.filter((v) => v !== brandName)
            : [...current, brandName];
        updateParams({ brand: newValues.length > 0 ? newValues.join(',') : null });
    };

    const handleSortChange = (e) => updateParams({ sort: e.target.value || null });

    const handlePageChange = (_, value) => {
        updateParams({ page: value }, false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateParams({ search: searchText || null });
    };

    const clearAllFilters = () => {
        const np = new URLSearchParams();
        np.set('page', '1');
        setSearchParams(np);
    };

    /* ── Active filter count ── */
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (minPrice) count++;
        if (brandFilter) count++;
        if (productType) count++;
        return count;
    }, [minPrice, brandFilter, productType]);

    /* ──────────── Sidebar Content ──────────── */
    const sidebarContent = (
        <Box sx={{ bgcolor: '#fff', borderRadius: 1, overflow: 'hidden' }}>
            {/* Search */}
            <Box sx={{ p: 2, pb: 1.5 }}>
                <form onSubmit={handleSearch}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Tìm sản phẩm sale..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton type="submit" size="small">
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </form>
            </Box>

            <Divider />

            {/* Price Range Filter */}
            <Box sx={{ p: 2, pb: 1.5 }}>
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 0.5 }}
                >
                    Chọn mức giá
                </Typography>
                <FormGroup>
                    {PRICE_RANGES.map((range, idx) => (
                        <FormControlLabel
                            key={idx}
                            control={
                                <Checkbox
                                    checked={isPriceSelected(range.min, range.max)}
                                    onChange={() => handlePriceSelect(range.min, range.max)}
                                    size="small"
                                    sx={{ '&.Mui-checked': { color: '#e53935' } }}
                                />
                            }
                            label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{range.label}</Typography>}
                            sx={{ mx: 0, '& .MuiFormControlLabel-label': { ml: 0.5 } }}
                        />
                    ))}
                </FormGroup>
            </Box>

            <Divider />

            {/* Brand Filter */}
            <Box sx={{ p: 2, pb: 1.5 }}>
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 0.5 }}
                >
                    Thương hiệu
                </Typography>
                <FormGroup>
                    {brandOptions.map((b, idx) => (
                        <FormControlLabel
                            key={idx}
                            control={
                                <Checkbox
                                    checked={isBrandSelected(b)}
                                    onChange={() => handleBrandToggle(b)}
                                    size="small"
                                    sx={{ '&.Mui-checked': { color: '#e53935' } }}
                                />
                            }
                            label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{b}</Typography>}
                            sx={{ mx: 0, '& .MuiFormControlLabel-label': { ml: 0.5 } }}
                        />
                    ))}
                </FormGroup>
            </Box>

            <Divider />

            {/* Category Filter */}
            <Box sx={{ p: 2 }}>
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 0.5 }}
                >
                    Danh mục sản phẩm
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    <Link
                        component="button"
                        underline="none"
                        onClick={() => handleCategorySelect('')}
                        sx={{
                            py: 0.6,
                            px: 1.5,
                            borderRadius: 1,
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            color: !productType ? '#e53935' : '#444',
                            fontWeight: !productType ? 700 : 400,
                            bgcolor: !productType ? 'rgba(229,57,53,0.08)' : 'transparent',
                            '&:hover': { color: '#e53935', bgcolor: 'rgba(229,57,53,0.05)' },
                        }}
                    >
                        Tất cả danh mục
                    </Link>
                    {productTypes.map((type) => (
                        <Link
                            key={type._id}
                            component="button"
                            underline="none"
                            onClick={() => handleCategorySelect(type.name)}
                            sx={{
                                py: 0.6,
                                px: 1.5,
                                borderRadius: 1,
                                textAlign: 'left',
                                fontSize: '0.9rem',
                                color: productType === type.name ? '#e53935' : '#444',
                                fontWeight: productType === type.name ? 700 : 400,
                                bgcolor: productType === type.name ? 'rgba(229,57,53,0.08)' : 'transparent',
                                '&:hover': { color: '#e53935', bgcolor: 'rgba(229,57,53,0.05)' },
                            }}
                        >
                            {type.name_vi}
                        </Link>
                    ))}
                </Box>
            </Box>
        </Box>
    );

    /* ──────────── Render ──────────── */
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Sale Banner */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #e53935 0%, #ff7043 50%, #ffab91 100%)',
                    py: { xs: 3, md: 5 },
                    mb: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -30,
                        left: '20%',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.08)',
                    }}
                />
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <LocalFireDepartmentIcon sx={{ fontSize: { xs: 40, md: 60 }, color: '#fff' }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    color: '#fff',
                                    fontWeight: 900,
                                    fontSize: { xs: '1.8rem', md: '3rem' },
                                    textTransform: 'uppercase',
                                    letterSpacing: 2,
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                                }}
                            >
                                🔥 Flash Sale 🔥
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                                    mt: 0.5,
                                }}
                            >
                                Săn deal khủng - Giá sốc mỗi ngày
                            </Typography>
                        </Box>
                        <LocalFireDepartmentIcon sx={{ fontSize: { xs: 40, md: 60 }, color: '#fff' }} />
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Breadcrumbs */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 2.5 }}
                >
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
                    <Typography color="error" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                        🔥 Sale Off
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                    {/* ── Sidebar (desktop) ── */}
                    {!isMobile && (
                        <Box
                            sx={{
                                width: 280,
                                flexShrink: 0,
                                position: 'sticky',
                                top: 16,
                                maxHeight: 'calc(100vh - 32px)',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': { width: 4 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 2 },
                            }}
                        >
                            {sidebarContent}
                        </Box>
                    )}

                    {/* ── Mobile Filter Drawer ── */}
                    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                        <Box sx={{ width: 310, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700} color="error">
                                    <TuneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Bộ lọc Sale
                                </Typography>
                                <IconButton onClick={() => setDrawerOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            {sidebarContent}
                        </Box>
                    </Drawer>

                    {/* ── Main Content ── */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Header Bar */}
                        <Box
                            sx={{
                                p: 2,
                                mb: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 1,
                                bgcolor: '#fff',
                                borderBottom: '2px solid #e53935',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {isMobile && (
                                    <Button
                                        startIcon={<FilterListIcon />}
                                        onClick={() => setDrawerOpen(true)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ borderColor: '#e53935', color: '#e53935' }}
                                    >
                                        Bộ lọc
                                        {activeFilterCount > 0 && (
                                            <Chip
                                                label={activeFilterCount}
                                                size="small"
                                                sx={{ ml: 0.5, height: 20, bgcolor: '#e53935', color: '#fff' }}
                                            />
                                        )}
                                    </Button>
                                )}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        fontSize: { xs: '0.95rem', md: '1.1rem' },
                                        color: '#e53935',
                                    }}
                                >
                                    {selectedType ? `Sale ${selectedType.name_vi}` : 'Tất cả sản phẩm Sale'}
                                </Typography>
                                {!loading && (
                                    <Typography variant="body2" color="text.secondary">
                                        ({totalProducts} sản phẩm)
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    Sắp xếp:
                                </Typography>
                                <Select
                                    value={sort}
                                    onChange={handleSortChange}
                                    size="small"
                                    displayEmpty
                                    sx={{ minWidth: 150, fontSize: '0.875rem' }}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        </Box>

                        {/* Active Filters Chips */}
                        {activeFilterCount > 0 && (
                            <Box sx={{ p: 2, bgcolor: '#fff', mb: 0, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                    Đang lọc:
                                </Typography>
                                {productType && (
                                    <Chip
                                        label={`Danh mục: ${selectedType?.name_vi || productType}`}
                                        onDelete={() => handleCategorySelect('')}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(229,57,53,0.1)', color: '#e53935', fontWeight: 500 }}
                                    />
                                )}
                                {minPrice && (
                                    <Chip
                                        label={PRICE_RANGES.find((r) => String(r.min) === minPrice)?.label || `${minPrice}đ - ${maxPrice}đ`}
                                        onDelete={() => updateParams({ minPrice: null, maxPrice: null })}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(229,57,53,0.1)', color: '#e53935', fontWeight: 500 }}
                                    />
                                )}
                                {brandFilter && brandFilter.split(',').filter(Boolean).map((b) => (
                                    <Chip
                                        key={`brand-${b}`}
                                        label={`Thương hiệu: ${b}`}
                                        onDelete={() => handleBrandToggle(b)}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(229,57,53,0.1)', color: '#e53935', fontWeight: 500 }}
                                    />
                                ))}
                                <Button size="small" onClick={clearAllFilters} sx={{ color: '#999', textTransform: 'none', fontSize: '0.8rem' }}>
                                    Xóa tất cả
                                </Button>
                            </Box>
                        )}

                        {/* Product Grid */}
                        {loading ? (
                            <Grid container spacing={0} sx={{ bgcolor: '#fff' }}>
                                {[...Array(8)].map((_, i) => (
                                    <Grid item xs={6} sm={4} md={4} lg={3} key={i}>
                                        <Box sx={{ p: 2 }}>
                                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1, mb: 1 }} />
                                            <Skeleton variant="text" height={24} width="90%" />
                                            <Skeleton variant="text" height={24} width="60%" />
                                            <Skeleton variant="text" height={28} width="45%" />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : products.length > 0 ? (
                            <Grid container spacing={0} sx={{ bgcolor: '#fff' }}>
                                {products.map((product) => (
                                    <Grid item xs={6} sm={4} md={4} lg={3} key={product._id}>
                                        <ProductCard product={product} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ p: 8, textAlign: 'center', bgcolor: '#fff' }}>
                                <LocalFireDepartmentIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Hiện chưa có sản phẩm sale
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Quay lại sau để săn deal nhé!
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/products"
                                    variant="outlined"
                                    sx={{ borderColor: '#e53935', color: '#e53935' }}
                                >
                                    Xem tất cả sản phẩm
                                </Button>
                            </Box>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                                <MuiPagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            fontSize: '0.95rem',
                                            '&.Mui-selected': {
                                                bgcolor: '#e53935',
                                                color: '#fff',
                                                '&:hover': { bgcolor: '#c62828' },
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
