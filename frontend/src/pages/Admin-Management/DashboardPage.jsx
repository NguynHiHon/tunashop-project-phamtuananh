import React, { useEffect, useState } from 'react';
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
    Chip,
    Avatar,
    CircularProgress,
    Alert,
    LinearProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    People,
    ShoppingCart,
    AttachMoney,
    Inventory,
    TrendingUp,
    ArticleOutlined,
    Warning,
    LocalShipping,
    CheckCircle,
    Cancel,
    Pending,
    ArrowForward,
    Category,
    Person,
    AdminPanelSettings,
} from '@mui/icons-material';
import Grid from '@mui/material/GridLegacy';

import { useNavigate } from 'react-router-dom';
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
    return num.toString();
};

const StatCard = ({ title, value, subtitle, icon, color = 'primary', onClick }) => (
    <Card
        sx={{
            height: '100%',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': onClick ? {
                transform: 'translateY(-4px)',
                boxShadow: 4,
            } : {},
        }}
        onClick={onClick}
    >
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
                </Box>
                <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

const STATUS_CONFIG = {
    pending: { label: 'Chờ duyệt', color: 'warning' },
    approved: { label: 'Đã duyệt', color: 'info' },
    rejected: { label: 'Từ chối', color: 'error' },
    shipping: { label: 'Đang giao', color: 'primary' },
    cancelled: { label: 'Đã hủy', color: 'default' },
    delivered: { label: 'Đã giao', color: 'success' },
    returned: { label: 'Hoàn hàng', color: 'secondary' },
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [inventoryAlerts, setInventoryAlerts] = useState({ outOfStock: [], lowStock: [] });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [overviewRes, ordersRes, productsRes, alertsRes] = await Promise.all([
                dashboardService.getOverviewStats(),
                dashboardService.getRecentOrders(5),
                dashboardService.getTopSellingProducts(5),
                dashboardService.getInventoryAlerts(),
            ]);

            setStats(overviewRes.data);
            setRecentOrders(ordersRes.data);
            setTopProducts(productsRes.data);
            setInventoryAlerts(alertsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                {error}
            </Alert>
        );
    }

    const totalAlerts = inventoryAlerts.outOfStock.length + inventoryAlerts.lowStock.length;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Tổng quan hệ thống
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Chào mừng bạn trở lại! Đây là tổng quan hoạt động của TunaShop.
            </Typography>

            {/* Main Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tổng doanh thu"
                        value={formatPrice(stats?.revenue?.total || 0)}
                        subtitle={`${stats?.revenue?.ordersDelivered || 0} đơn hoàn thành`}
                        icon={<AttachMoney />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tổng đơn hàng"
                        value={stats?.orders?.total || 0}
                        subtitle={`${stats?.orders?.pending || 0} chờ duyệt`}
                        icon={<ShoppingCart />}
                        color="primary"
                        onClick={() => navigate('/management/orders')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Sản phẩm"
                        value={stats?.products?.total || 0}
                        subtitle={`${stats?.products?.categories || 0} danh mục`}
                        icon={<Inventory />}
                        color="info"
                        onClick={() => navigate('/management/products')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Người dùng"
                        value={stats?.users?.total || 0}
                        subtitle={`${stats?.users?.byRole?.admin || 0} admin, ${stats?.users?.byRole?.staff || 0} staff`}
                        icon={<People />}
                        color="warning"
                        onClick={() => navigate('/management/employees')}
                    />
                </Grid>
            </Grid>

            {/* Secondary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Pending sx={{ fontSize: 32 }} />
                            <Typography variant="h5" fontWeight="bold">{stats?.orders?.pending || 0}</Typography>
                            <Typography variant="body2">Chờ duyệt</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: 'info.light', color: 'info.dark' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <LocalShipping sx={{ fontSize: 32 }} />
                            <Typography variant="h5" fontWeight="bold">{stats?.orders?.processing || 0}</Typography>
                            <Typography variant="body2">Đang xử lý</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: 'success.light', color: 'success.dark' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <CheckCircle sx={{ fontSize: 32 }} />
                            <Typography variant="h5" fontWeight="bold">{stats?.orders?.completed || 0}</Typography>
                            <Typography variant="body2">Hoàn thành</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: 'error.light', color: 'error.dark' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Cancel sx={{ fontSize: 32 }} />
                            <Typography variant="h5" fontWeight="bold">{stats?.orders?.cancelled || 0}</Typography>
                            <Typography variant="body2">Đã hủy</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <TrendingUp sx={{ fontSize: 32 }} />
                            <Typography variant="h5" fontWeight="bold">{stats?.products?.onSale || 0}</Typography>
                            <Typography variant="body2">Đang sale</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Recent Orders */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Đơn hàng gần đây
                            </Typography>
                            <Tooltip title="Xem tất cả">
                                <IconButton size="small" onClick={() => navigate('/management/orders')}>
                                    <ArrowForward />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã đơn</TableCell>
                                        <TableCell>Khách hàng</TableCell>
                                        <TableCell>Tổng tiền</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Typography color="text.secondary">Chưa có đơn hàng</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <TableRow key={order._id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" color="primary" fontWeight="500">
                                                        {order.orderCode}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {order.shippingAddress?.fullName || order.userId?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight="500">{formatPrice(order.total)}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={STATUS_CONFIG[order.status]?.label || order.status}
                                                        color={STATUS_CONFIG[order.status]?.color || 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Inventory Alerts */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Cảnh báo tồn kho
                            </Typography>
                            {totalAlerts > 0 && (
                                <Chip
                                    label={totalAlerts}
                                    color="error"
                                    size="small"
                                    icon={<Warning />}
                                />
                            )}
                        </Box>

                        {totalAlerts === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                <Typography color="text.secondary">Tồn kho ổn định</Typography>
                            </Box>
                        ) : (
                            <List dense>
                                {inventoryAlerts.outOfStock.slice(0, 3).map((product) => (
                                    <ListItem key={product._id}>
                                        <ListItemAvatar>
                                            <Avatar src={product.image} variant="rounded">
                                                <Inventory />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={product.name}
                                            secondary={
                                                <Chip label="Hết hàng" color="error" size="small" />
                                            }
                                            primaryTypographyProps={{ noWrap: true, maxWidth: 150 }}
                                        />
                                    </ListItem>
                                ))}
                                {inventoryAlerts.lowStock.slice(0, 3).map((product) => (
                                    <ListItem key={product._id}>
                                        <ListItemAvatar>
                                            <Avatar src={product.image} variant="rounded">
                                                <Inventory />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={product.name}
                                            secondary={
                                                <Chip label={`Còn ${product.stock}`} color="warning" size="small" />
                                            }
                                            primaryTypographyProps={{ noWrap: true, maxWidth: 150 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Top Selling Products */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Sản phẩm bán chạy
                        </Typography>
                        <List>
                            {topProducts.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    Chưa có dữ liệu
                                </Typography>
                            ) : (
                                topProducts.map((product, index) => (
                                    <ListItem key={product._id} divider={index < topProducts.length - 1}>
                                        <ListItemAvatar>
                                            <Avatar src={product.productImage} variant="rounded">
                                                {index + 1}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={product.productName}
                                            secondary={`Đã bán: ${product.totalSold} | Doanh thu: ${formatPrice(product.totalRevenue)}`}
                                            primaryTypographyProps={{ fontWeight: 500 }}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* User Stats */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Phân bổ người dùng
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                    <Person />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Khách hàng</Typography>
                                        <Typography fontWeight="bold">{stats?.users?.byRole?.user || 0}</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(stats?.users?.byRole?.user / stats?.users?.total) * 100 || 0}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                                    <People />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Nhân viên</Typography>
                                        <Typography fontWeight="bold">{stats?.users?.byRole?.staff || 0}</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(stats?.users?.byRole?.staff / stats?.users?.total) * 100 || 0}
                                        color="info"
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                                    <AdminPanelSettings />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Admin</Typography>
                                        <Typography fontWeight="bold">{stats?.users?.byRole?.admin || 0}</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(stats?.users?.byRole?.admin / stats?.users?.total) * 100 || 0}
                                        color="warning"
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Quick Stats Row */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Thống kê nhanh
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Category color="primary" sx={{ fontSize: 32 }} />
                                    <Typography variant="h5" fontWeight="bold">{stats?.products?.categories || 0}</Typography>
                                    <Typography variant="body2" color="text.secondary">Danh mục</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Inventory color="info" sx={{ fontSize: 32 }} />
                                    <Typography variant="h5" fontWeight="bold">{stats?.products?.lowStock || 0}</Typography>
                                    <Typography variant="body2" color="text.secondary">Sắp hết hàng</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <ArticleOutlined color="secondary" sx={{ fontSize: 32 }} />
                                    <Typography variant="h5" fontWeight="bold">{stats?.articles?.total || 0}</Typography>
                                    <Typography variant="body2" color="text.secondary">Bài viết</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <AttachMoney color="success" sx={{ fontSize: 32 }} />
                                    <Typography variant="h5" fontWeight="bold">
                                        {formatNumber(stats?.revenue?.avgOrderValue || 0)}đ
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Giá trị TB/đơn</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
