import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Avatar,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    ShoppingCart,
    Inventory,
    CalendarToday,
    Assessment,
} from '@mui/icons-material';
import Grid from '@mui/material/GridLegacy';

import * as dashboardService from '../../services/dashboardService';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
};

// Revenue Card Component
const RevenueCard = ({ title, value, subtitle, trend, trendValue, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                    {trend && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {trend === 'up' ? (
                                <TrendingUp sx={{ color: 'success.main', fontSize: 18, mr: 0.5 }} />
                            ) : (
                                <TrendingDown sx={{ color: 'error.main', fontSize: 18, mr: 0.5 }} />
                            )}
                            <Typography
                                variant="caption"
                                color={trend === 'up' ? 'success.main' : 'error.main'}
                            >
                                {trendValue}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

// Simple Bar Chart Component
const SimpleBarChart = ({ data, height = 200 }) => {
    if (!data || data.length === 0) return null;

    const maxRevenue = Math.max(...data.map(d => d.revenue || 0));

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height, gap: 1, px: 2 }}>
            {data.map((item, index) => {
                const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * (height - 40) : 0;
                return (
                    <Box
                        key={index}
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="caption" sx={{ mb: 0.5, fontSize: '0.65rem' }}>
                            {formatNumber(item.revenue)}
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                height: barHeight || 4,
                                bgcolor: 'primary.main',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 0.5,
                                fontSize: '0.6rem',
                                transform: 'rotate(-45deg)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.label || item.period?.day || item.period?.month || index + 1}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

export default function SalesReportPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('month');
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [orderTrends, setOrderTrends] = useState([]);

    const periodLabels = {
        day: 'Ngày',
        week: 'Tuần',
        month: 'Tháng',
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [overviewRes, revenueRes, topProductsRes, trendsRes] = await Promise.all([
                dashboardService.getOverviewStats(),
                dashboardService.getRevenueByPeriod(period, period === 'day' ? 30 : period === 'week' ? 12 : 12),
                dashboardService.getTopSellingProducts(10),
                dashboardService.getOrderTrends(),
            ]);

            setStats(overviewRes.data);

            // Format revenue data for chart
            const formattedRevenue = (revenueRes.data || []).map(item => {
                let label = '';
                if (period === 'day') {
                    label = `${item.period?.day}/${item.period?.month}`;
                } else if (period === 'week') {
                    label = `T${item.period?.week}`;
                } else {
                    label = `T${item.period?.month}/${item.period?.year?.toString().slice(-2)}`;
                }
                return {
                    ...item,
                    label,
                };
            });
            setRevenueData(formattedRevenue);
            setTopProducts(topProductsRes.data || []);
            setOrderTrends(trendsRes.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu báo cáo');
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate trend comparison
    const calculateTrend = () => {
        if (revenueData.length < 2) return { trend: null, value: '' };
        const current = revenueData[revenueData.length - 1]?.revenue || 0;
        const previous = revenueData[revenueData.length - 2]?.revenue || 0;
        if (previous === 0) return { trend: 'up', value: '+100%' };
        const change = ((current - previous) / previous) * 100;
        return {
            trend: change >= 0 ? 'up' : 'down',
            value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}% so với ${periodLabels[period].toLowerCase()} trước`,
        };
    };

    const trendInfo = calculateTrend();

    // Calculate totals from revenue data
    const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalOrders = revenueData.reduce((sum, item) => sum + (item.orders || 0), 0);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Báo Cáo Doanh Thu
                </Typography>
                <ToggleButtonGroup
                    value={period}
                    exclusive
                    onChange={(e, newPeriod) => newPeriod && setPeriod(newPeriod)}
                    size="small"
                >
                    <ToggleButton value="day">Ngày</ToggleButton>
                    <ToggleButton value="week">Tuần</ToggleButton>
                    <ToggleButton value="month">Tháng</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <RevenueCard
                        title="Tổng doanh thu"
                        value={formatPrice(stats?.revenue?.total || 0)}
                        subtitle={`${stats?.revenue?.ordersDelivered || 0} đơn hoàn thành`}
                        icon={<AttachMoney />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <RevenueCard
                        title={`Doanh thu ${period === 'day' ? '30 ngày' : period === 'week' ? '12 tuần' : '12 tháng'}`}
                        value={formatPrice(totalRevenue)}
                        subtitle={`${totalOrders} đơn hàng`}
                        trend={trendInfo.trend}
                        trendValue={trendInfo.value}
                        icon={<TrendingUp />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <RevenueCard
                        title="Giá trị trung bình/đơn"
                        value={formatPrice(stats?.revenue?.avgOrderValue || 0)}
                        subtitle="Đơn hàng hoàn thành"
                        icon={<ShoppingCart />}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <RevenueCard
                        title="Sản phẩm đang sale"
                        value={stats?.products?.onSale || 0}
                        subtitle={`Tổng ${stats?.products?.total || 0} sản phẩm`}
                        icon={<Inventory />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Revenue Chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Biểu đồ doanh thu theo {periodLabels[period].toLowerCase()}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {revenueData.length > 0 ? (
                            <SimpleBarChart data={revenueData} height={250} />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                                <Typography color="text.secondary">Chưa có dữ liệu</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Order Trends - Last 7 days */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Xu hướng 7 ngày gần nhất
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {orderTrends.length > 0 ? (
                            <List dense>
                                {orderTrends.map((trend, index) => (
                                    <ListItem key={index} sx={{ py: 1 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36 }}>
                                                <CalendarToday sx={{ fontSize: 18, color: 'primary.main' }} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={new Date(trend.date).toLocaleDateString('vi-VN', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'numeric',
                                            })}
                                            secondary={`${trend.orders} đơn`}
                                        />
                                        <Typography variant="body2" color="success.main" fontWeight="bold">
                                            {formatPrice(trend.revenue)}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150 }}>
                                <Typography color="text.secondary">Chưa có đơn hàng</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Top Selling Products */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Assessment color="primary" />
                    <Typography variant="h6">
                        Top 10 sản phẩm bán chạy
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>STT</TableCell>
                                <TableCell>Sản phẩm</TableCell>
                                <TableCell align="center">Số lượng bán</TableCell>
                                <TableCell align="right">Doanh thu</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography color="text.secondary">Chưa có dữ liệu</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                topProducts.map((product, index) => (
                                    <TableRow key={product._id} hover>
                                        <TableCell>
                                            <Chip
                                                label={index + 1}
                                                size="small"
                                                color={index < 3 ? 'primary' : 'default'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar
                                                    src={product.productImage}
                                                    variant="rounded"
                                                    sx={{ width: 48, height: 48 }}
                                                >
                                                    <Inventory />
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {product.productName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={formatNumber(product.totalSold)}
                                                color="info"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                                {formatPrice(product.totalRevenue)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Revenue Detail Table */}
            <Paper sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarToday color="primary" />
                    <Typography variant="h6">
                        Chi tiết doanh thu theo {periodLabels[period].toLowerCase()}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Thời gian</TableCell>
                                <TableCell align="center">Số đơn hàng</TableCell>
                                <TableCell align="right">Doanh thu</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {revenueData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography color="text.secondary">Chưa có dữ liệu</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                [...revenueData].reverse().map((item, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Typography variant="body2">{item.label}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={item.orders || 0} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                                {formatPrice(item.revenue || 0)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Total Row */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '2px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Tổng đơn hàng</Typography>
                            <Typography variant="h6" fontWeight="bold">{totalOrders}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Tổng doanh thu</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                {formatPrice(totalRevenue)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
