import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, CardMedia, CardContent, Typography } from '@mui/material';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

export default function ProductCard({ product }) {
    // Image from populated defaultImageId (Image model has url_Image field)
    const imageUrl = product.defaultImageId?.url_Image || product.imageIds?.[0]?.url_Image || '/vite.svg';

    // Use backend virtual isOnSale and salePercent
    const isOnSale = !!product.isOnSale;
    const salePercent = Number(product.salePercent) || 0;
    const originalPrice = product.price;
    const finalPrice = product.finalPrice ?? product.price;

    return (
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
            <Card
                elevation={0}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: 'none',
                    borderRadius: 0,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    overflow: 'visible',
                    '&:hover': {
                        '& .product-image': {
                            transform: 'scale(1.05)',
                        },
                        '& .product-name': {
                            color: '#f26522',
                        },
                    },
                }}
            >
                {/* Product Image */}
                <Box sx={{ overflow: 'hidden', aspectRatio: '1 / 1', position: 'relative' }}>
                    {/* Sale Ribbon - Diagonal Corner Style */}
                    {isOnSale && salePercent > 0 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: -35,
                                zIndex: 2,
                                width: 120,
                                textAlign: 'center',
                                transform: 'rotate(-45deg)',
                                background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                py: 0.4,
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                                '&::before, &::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '100%',
                                    border: '3px solid transparent',
                                    borderTopColor: '#8b0000',
                                },
                                '&::before': {
                                    left: 0,
                                    borderLeftColor: '#8b0000',
                                },
                                '&::after': {
                                    right: 0,
                                    borderRightColor: '#8b0000',
                                },
                            }}
                        >
                            -{salePercent}%
                        </Box>
                    )}
                    <CardMedia
                        component="img"
                        className="product-image"
                        image={imageUrl}
                        alt={product.name}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: 2,
                            transition: 'transform 0.3s ease',
                        }}
                    />
                </Box>

                {/* Product Info */}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 1.5, px: 1.5, pb: 2 }}>
                    <Typography
                        className="product-name"
                        variant="body1"
                        sx={{
                            fontWeight: 500,
                            color: '#333',
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 48,
                            lineHeight: 1.4,
                            transition: 'color 0.2s ease',
                        }}
                    >
                        {product.name}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                        {isOnSale ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#e53935',
                                            fontWeight: 800,
                                            fontSize: '1.15rem',
                                        }}
                                    >
                                        {formatPrice(finalPrice)}
                                    </Typography>
                                    <Box
                                        component="span"
                                        sx={{
                                            bgcolor: '#e53935',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.65rem',
                                            px: 0.8,
                                            py: 0.2,
                                            borderRadius: 0.5,
                                        }}
                                    >
                                        SALE
                                    </Box>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#999',
                                        textDecoration: 'line-through',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {formatPrice(originalPrice)}
                                </Typography>
                            </>
                        ) : (
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#f26522',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                }}
                            >
                                {formatPrice(originalPrice)}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Link>
    );
}
