import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Typography, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import ProductCard from './ProductCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/clices/productSlice';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function ProductTabs() {
    const dispatch = useDispatch();
    const { items: products, loading } = useSelector((state) => state.product);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Extract unique categories from products
    const categories = useMemo(() => {
        if (products && products.length > 0) {
            const uniqueCategories = products
                .filter(p => p.productTypeId?.name)
                .map(p => ({
                    id: p.productTypeId._id,
                    name: p.productTypeId.name_vi,
                }));

            // Dedupe by id
            const seen = new Set();
            const deduped = uniqueCategories.filter(cat => {
                if (seen.has(cat.id)) return false;
                seen.add(cat.id);
                return true;
            });

            return [{ id: 'all', name: 'Tất cả' }, ...deduped.slice(0, 5)];
        }
        return [{ id: 'all', name: 'Tất cả' }];
    }, [products]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Filter products based on active tab
    const filteredProducts = activeTab === 0
        ? products
        : products.filter(p => p.productTypeId?._id === categories[activeTab]?.id);

    const displayProducts = filteredProducts.slice(0, 10);

    return (
        <Box sx={{ py: 5, bgcolor: '#fff' }}>
            <Container maxWidth="xl">
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Box sx={{ flex: 1, height: 2, background: 'linear-gradient(90deg, transparent, #e0e0e0)' }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: '#333',
                            fontSize: { xs: '1.4rem', md: '1.8rem' },
                            whiteSpace: 'nowrap',
                            position: 'relative',
                            '& span': { color: '#f26522' },
                        }}
                    >
                        Sản phẩm <span>nổi bật</span>
                    </Typography>
                    <Box sx={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #e0e0e0, transparent)' }} />
                </Box>

                {/* Tabs */}
                <Box
                    sx={{
                        border: '2px solid #e8e8e8',
                        borderRadius: 2,
                        mb: 3,
                        overflow: 'hidden',
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            bgcolor: '#fafafa',
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: '#666',
                                py: 1.5,
                                px: 3,
                                minHeight: 48,
                                transition: 'all 0.25s',
                                '&.Mui-selected': {
                                    bgcolor: '#f26522',
                                    color: '#fff',
                                    borderRadius: 1,
                                },
                                '&:hover:not(.Mui-selected)': {
                                    color: '#f26522',
                                    bgcolor: '#fff5f0',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                display: 'none',
                            },
                        }}
                    >
                        {categories.map((cat) => (
                            <Tab key={cat.id} label={cat.name} />
                        ))}
                    </Tabs>
                </Box>

                {/* Products Grid */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress sx={{ color: '#f26522' }} />
                    </Box>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: 'repeat(2, 1fr)',
                                    sm: 'repeat(3, 1fr)',
                                    md: 'repeat(4, 1fr)',
                                    lg: 'repeat(5, 1fr)',
                                },
                                gap: 2.5,
                                p: 2,
                            }}
                        >
                            {displayProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </Box>

                        {/* View All Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button
                                component={Link}
                                to="/products"
                                variant="outlined"
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    color: '#f26522',
                                    borderColor: '#f26522',
                                    fontWeight: 600,
                                    px: 5,
                                    py: 1.2,
                                    borderRadius: 3,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        bgcolor: '#f26522',
                                        color: '#fff',
                                        borderColor: '#f26522',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(242, 101, 34, 0.3)',
                                    },
                                }}
                            >
                                Xem tất cả sản phẩm
                            </Button>
                        </Box>
                    </>
                )}
            </Container>
        </Box>
    );
}
