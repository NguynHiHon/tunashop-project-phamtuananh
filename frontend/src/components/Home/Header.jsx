import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
    InputBase,
    Badge,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Collapse,
    Popper,
    Paper,
    ClickAwayListener,
    Grow,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    ShoppingCart as CartIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Close as CloseIcon,
    KeyboardArrowDown as ArrowDownIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { fetchCartCount } from '../../redux/clices/cartSlice';
import { signOutUser } from '../../services/authService';

// Mega menu data for "Sản phẩm"
const productMegaMenu = [
    {
        title: 'VỢT CẦU LÔNG',
        color: '#f26522',
        links: [
            { name: 'Vợt cầu lông Yonex', path: '/products?brand=yonex&productType=Badminton+Racket' },
            { name: 'Vợt cầu lông Victor', path: '/products?brand=victor&productType=Badminton+Racket' },
            { name: 'Vợt cầu lông Lining', path: '/products?brand=lining&productType=Badminton+Racket' },
            { name: 'Vợt cầu lông Mizuno', path: '/products?brand=mizuno&productType=Badminton+Racket' },
            { name: 'Vợt cầu lông Apacs', path: '/products?brand=apacs&productType=Badminton+Racket' },
            { name: 'Vợt cầu lông Kawasaki', path: '/products?brand=kawasaki&productType=Badminton+Racket' },
        ],
    },
    {
        title: 'GIÀY CẦU LÔNG',
        color: '#f26522',
        links: [
            { name: 'Giày cầu lông Yonex', path: '/products?brand=yonex&productType=Sneaker+badminton' },
            { name: 'Giày cầu lông Victor', path: '/products?brand=victor&productType=Sneaker+badminton' },
            { name: 'Giày cầu lông Lining', path: '/products?brand=lining&productType=Sneaker+badminton' },
            { name: 'Giày cầu lông Mizuno', path: '/products?brand=mizuno&productType=Sneaker+badminton' },
            { name: 'Giày cầu lông Kawasaki', path: '/products?brand=kawasaki&productType=Sneaker+badminton' },
            { name: 'Giày cầu lông Kumpoo', path: '/products?brand=kumpoo&productType=Sneaker+badminton' },
        ],
    },
    {
        title: 'ÁO CẦU LÔNG',
        color: '#f26522',
        links: [
            { name: 'Áo cầu lông Yonex', path: '/products?brand=yonex&productType=Badminton+Apparel' },
            { name: 'Áo cầu lông Victor', path: '/products?brand=victor&productType=Badminton+Apparel' },
            { name: 'Áo cầu lông Kamito', path: '/products?brand=kamito&productType=Badminton+Apparel' },
            { name: 'Áo cầu lông Lining', path: '/products?brand=lining&productType=Badminton+Apparel' },
            { name: 'Áo cầu lông Kawasaki', path: '/products?brand=kawasaki&productType=Badminton+Apparel' },
        ],
    },
    {
        title: 'VỢT TENNIS',
        color: '#4CAF50',
        links: [
            { name: 'Vợt tennis Wilson', path: '/products?brand=wilson&productType=Tennis+Racket' },
            { name: 'Vợt tennis Head', path: '/products?brand=head&productType=Tennis+Racket' },
            { name: 'Vợt tennis Babolat', path: '/products?brand=babolat&productType=Tennis+Racket' },
            { name: 'Vợt tennis Yonex', path: '/products?brand=yonex&productType=Tennis+Racket' },
        ],
    },
    {
        title: 'VỢT PICKLEBALL',
        color: '#2196F3',
        links: [
            { name: 'Vợt Pickleball Head', path: '/products?brand=head&productType=Pickleball+Racket' },
            { name: 'Vợt Pickleball Joola', path: '/products?brand=joola&productType=Pickleball+Racket' },
            { name: 'Vợt Pickleball Selkirk', path: '/products?brand=selkirk&productType=Pickleball+Racket' },
        ],
    },
    {
        title: 'PHỤ KIỆN',
        color: '#9c27b0',
        links: [
            { name: 'Túi vợt cầu lông', path: '/products?productType=Racket+Bag' },
            { name: 'Balo cầu lông', path: '/products?productType=Backpack' },
            { name: 'Vớ cầu lông', path: '/products?productType=Socks' },
            { name: 'Quấn cán vợt', path: '/products?productType=Grip' },
            { name: 'Cầu lông', path: '/products?productType=Shuttlecock' },
        ],
    },
];

// Dropdown data for "Hướng dẫn"
const guideDropdown = [
    { name: 'Hướng dẫn thanh toán', path: '/guide/payment' },
    { name: 'Hướng dẫn mua hàng', path: '/guide/ordering' },
    { name: 'Hướng dẫn chọn vợt cầu lông', path: '/guide/racket-selection' },
    { name: 'Xem tất cả hướng dẫn', path: '/guide' },
];

const navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/products', hasMega: true },
    { label: 'Sale Off', path: '/sale' },
    { label: 'Tin tức', path: '/news' },
    { label: 'Chính sách nhượng quyền', path: '/franchise' },
    { label: 'Hướng dẫn', path: '/guide', hasDropdown: true },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Liên hệ', path: '/contact' },
];

export default function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
    const { accessToken } = useSelector((state) => state.token);
    const { totalItems } = useSelector((state) => state.cart);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);
    const [guideMenuOpen, setGuideMenuOpen] = useState(false);
    const [megaAnchorEl, setMegaAnchorEl] = useState(null);
    const [guideAnchorEl, setGuideAnchorEl] = useState(null);
    // Mobile expand states
    const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
    const [mobileGuideOpen, setMobileGuideOpen] = useState(false);

    const megaTimer = useRef(null);
    const guideTimer = useRef(null);

    // Fetch cart count when authenticated AND token is ready
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            dispatch(fetchCartCount());
        }
    }, [isAuthenticated, accessToken, dispatch]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Mega menu hover handlers
    const handleMegaEnter = (e) => {
        clearTimeout(megaTimer.current);
        setMegaAnchorEl(e.currentTarget);
        setMegaMenuOpen(true);
    };
    const handleMegaLeave = () => {
        megaTimer.current = setTimeout(() => setMegaMenuOpen(false), 200);
    };
    const handleMegaPopperEnter = () => {
        clearTimeout(megaTimer.current);
    };
    const handleMegaPopperLeave = () => {
        setMegaMenuOpen(false);
    };

    // Guide dropdown hover handlers
    const handleGuideEnter = (e) => {
        clearTimeout(guideTimer.current);
        setGuideAnchorEl(e.currentTarget);
        setGuideMenuOpen(true);
    };
    const handleGuideLeave = () => {
        guideTimer.current = setTimeout(() => setGuideMenuOpen(false), 200);
    };
    const handleGuidePopperEnter = () => {
        clearTimeout(guideTimer.current);
    };
    const handleGuidePopperLeave = () => {
        setGuideMenuOpen(false);
    };

    const drawer = (
        <Box sx={{ width: 300, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#f26522', fontWeight: 700 }}>
                    TunaShop
                </Typography>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <React.Fragment key={item.label}>
                        {item.hasMega ? (
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                                        sx={{ '&:hover': { bgcolor: '#fff5f0' } }}
                                    >
                                        <ListItemText primary={item.label} />
                                        {mobileProductsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItemButton>
                                </ListItem>
                                <Collapse in={mobileProductsOpen}>
                                    <List disablePadding sx={{ bgcolor: '#fafafa' }}>
                                        {productMegaMenu.map((cat) => (
                                            <React.Fragment key={cat.title}>
                                                <ListItem sx={{ pl: 3, py: 0.5 }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ fontWeight: 700, color: cat.color, textTransform: 'uppercase', fontSize: '0.75rem' }}
                                                    >
                                                        {cat.title}
                                                    </Typography>
                                                </ListItem>
                                                {cat.links.slice(0, 3).map((link) => (
                                                    <ListItem key={link.name} disablePadding>
                                                        <ListItemButton
                                                            component={Link}
                                                            to={link.path}
                                                            onClick={handleDrawerToggle}
                                                            sx={{ pl: 5, py: 0.3, '&:hover': { bgcolor: '#fff5f0' } }}
                                                        >
                                                            <ListItemText
                                                                primary={link.name}
                                                                primaryTypographyProps={{ fontSize: '0.85rem', color: '#555' }}
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                component={Link}
                                                to="/products"
                                                onClick={handleDrawerToggle}
                                                sx={{ pl: 3, py: 0.5, '&:hover': { bgcolor: '#fff5f0' } }}
                                            >
                                                <ListItemText
                                                    primary="Xem tất cả →"
                                                    primaryTypographyProps={{ fontSize: '0.85rem', color: '#f26522', fontWeight: 600 }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </Collapse>
                            </>
                        ) : item.hasDropdown ? (
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => setMobileGuideOpen(!mobileGuideOpen)}
                                        sx={{ '&:hover': { bgcolor: '#fff5f0' } }}
                                    >
                                        <ListItemText primary={item.label} />
                                        {mobileGuideOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItemButton>
                                </ListItem>
                                <Collapse in={mobileGuideOpen}>
                                    <List disablePadding sx={{ bgcolor: '#fafafa' }}>
                                        {guideDropdown.map((link) => (
                                            <ListItem key={link.name} disablePadding>
                                                <ListItemButton
                                                    component={Link}
                                                    to={link.path}
                                                    onClick={handleDrawerToggle}
                                                    sx={{ pl: 4, '&:hover': { bgcolor: '#fff5f0' } }}
                                                >
                                                    <ListItemText
                                                        primary={link.name}
                                                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </>
                        ) : (
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    onClick={handleDrawerToggle}
                                    sx={{ '&:hover': { bgcolor: '#fff5f0' } }}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            {/* Top Bar */}
            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #eee', py: 1, display: { xs: 'none', md: 'block' } }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Logo + Hotline */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SportsTennisIcon sx={{ fontSize: 40, color: '#f26522' }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#333' }}>
                                    TUNA<span style={{ color: '#f26522' }}>SHOP</span>
                                </Typography>
                            </Link>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ color: '#f26522' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    HOTLINE: <span style={{ color: '#f26522' }}>0977508430 | 0338000308</span>
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon sx={{ color: '#f26522' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#00a651' }}>
                                    HỆ THỐNG CỬA HÀNG
                                </Typography>
                            </Box>
                        </Box>

                        {/* Search + Icons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                component="form"
                                onSubmit={handleSearch}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 2,
                                    px: 2,
                                    py: 0.5,
                                    width: 300,
                                }}
                            >
                                <InputBase
                                    placeholder="Tìm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{ flex: 1 }}
                                />
                                <IconButton type="submit" size="small">
                                    <SearchIcon />
                                </IconButton>
                            </Box>

                            {isAuthenticated ? (
                                <>
                                    <Tooltip title="Tài khoản">
                                        <IconButton onClick={handleOpenUserMenu}>
                                            <Avatar
                                                src={currentUser?.avatar}
                                                sx={{ width: 36, height: 36, bgcolor: '#f26522' }}
                                            >
                                                {currentUser?.name?.[0] || currentUser?.username?.[0]}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorElUser}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    >
                                        <MenuItem component={Link} to="/profile" onClick={handleCloseUserMenu}>
                                            Tài khoản
                                        </MenuItem>
                                        {currentUser?.role === 'admin' && (
                                            <MenuItem component={Link} to="/management" onClick={handleCloseUserMenu}>
                                                Quản lý
                                            </MenuItem>
                                        )}
                                        <MenuItem component={Link} to="/orders" onClick={handleCloseUserMenu}>
                                            Đơn hàng
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={async () => { handleCloseUserMenu(); await signOutUser(dispatch, navigate); }}>
                                            Đăng xuất
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    component={Link}
                                    to="/signin"
                                    startIcon={<PersonIcon />}
                                    sx={{ color: '#333', textTransform: 'none' }}
                                >
                                    Tài khoản
                                </Button>
                            )}

                            <Tooltip title="Giỏ hàng">
                                <IconButton component={Link} to="/cart">
                                    <Badge badgeContent={totalItems} color="error">
                                        <CartIcon sx={{ color: '#f26522' }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Navigation Bar */}
            <AppBar position="sticky" sx={{ bgcolor: '#f26522', boxShadow: 'none' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 48 } }}>
                        {/* Mobile menu button */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Mobile Logo */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
                            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SportsTennisIcon sx={{ fontSize: 28, color: '#fff' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                                    TUNASHOP
                                </Typography>
                            </Link>
                        </Box>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, width: '100%', justifyContent: 'center' }}>
                            {navItems.map((item) => {
                                if (item.hasMega) {
                                    return (
                                        <Box
                                            key={item.label}
                                            onMouseEnter={handleMegaEnter}
                                            onMouseLeave={handleMegaLeave}
                                            sx={{ position: 'relative' }}
                                        >
                                            <Button
                                                component={Link}
                                                to={item.path}
                                                endIcon={<ArrowDownIcon sx={{ fontSize: 18 }} />}
                                                sx={{
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    px: 3,
                                                    py: 1,
                                                    textTransform: 'none',
                                                    fontSize: '0.95rem',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        </Box>
                                    );
                                }
                                if (item.hasDropdown) {
                                    return (
                                        <Box
                                            key={item.label}
                                            onMouseEnter={handleGuideEnter}
                                            onMouseLeave={handleGuideLeave}
                                            sx={{ position: 'relative' }}
                                        >
                                            <Button
                                                component={Link}
                                                to={item.path}
                                                endIcon={<ArrowDownIcon sx={{ fontSize: 18 }} />}
                                                sx={{
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    px: 3,
                                                    py: 1,
                                                    textTransform: 'none',
                                                    fontSize: '0.95rem',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        </Box>
                                    );
                                }
                                return (
                                    <Button
                                        key={item.label}
                                        component={Link}
                                        to={item.path}
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                );
                            })}
                        </Box>

                        {/* Mobile icons */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
                            <IconButton color="inherit" component={Link} to="/cart">
                                <Badge badgeContent={totalItems} color="error">
                                    <CartIcon />
                                </Badge>
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
                }}
            >
                {drawer}
            </Drawer>

            {/* Mega Menu Dropdown for "Sản phẩm" */}
            <Popper
                open={megaMenuOpen}
                anchorEl={megaAnchorEl}
                placement="bottom-start"
                transition
                disablePortal={false}
                sx={{ zIndex: 1300, width: '100%', maxWidth: 1100, left: '50% !important', transform: 'translateX(-50%) !important' }}
                modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: 'top center' }}>
                        <Paper
                            onMouseEnter={handleMegaPopperEnter}
                            onMouseLeave={handleMegaPopperLeave}
                            sx={{
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                borderRadius: 2,
                                border: '1px solid #eee',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                                    gap: 0,
                                    p: 3,
                                }}
                            >
                                {productMegaMenu.map((category) => (
                                    <Box key={category.title} sx={{ mb: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 700,
                                                color: category.color,
                                                textTransform: 'uppercase',
                                                fontSize: '0.8rem',
                                                mb: 1,
                                                pb: 0.5,
                                                borderBottom: `2px solid ${category.color}20`,
                                            }}
                                        >
                                            {category.title}
                                        </Typography>
                                        {category.links.map((link) => (
                                            <Box
                                                key={link.name}
                                                component={Link}
                                                to={link.path}
                                                onClick={() => setMegaMenuOpen(false)}
                                                sx={{
                                                    display: 'block',
                                                    color: '#555',
                                                    textDecoration: 'none',
                                                    py: 0.4,
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        color: '#f26522',
                                                        pl: 0.5,
                                                    },
                                                }}
                                            >
                                                {link.name}
                                            </Box>
                                        ))}
                                        <Box
                                            component={Link}
                                            to="/products"
                                            onClick={() => setMegaMenuOpen(false)}
                                            sx={{
                                                display: 'inline-block',
                                                color: category.color,
                                                textDecoration: 'none',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                mt: 0.5,
                                                '&:hover': { textDecoration: 'underline' },
                                            }}
                                        >
                                            Xem thêm
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grow>
                )}
            </Popper>

            {/* Guide Dropdown */}
            <Popper
                open={guideMenuOpen}
                anchorEl={guideAnchorEl}
                placement="bottom-start"
                transition
                disablePortal={false}
                sx={{ zIndex: 1300 }}
                modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: 'top left' }}>
                        <Paper
                            onMouseEnter={handleGuidePopperEnter}
                            onMouseLeave={handleGuidePopperLeave}
                            sx={{
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                borderRadius: 2,
                                border: '1px solid #eee',
                                py: 1,
                                minWidth: 260,
                            }}
                        >
                            {guideDropdown.map((link) => (
                                <Box
                                    key={link.name}
                                    component={Link}
                                    to={link.path}
                                    onClick={() => setGuideMenuOpen(false)}
                                    sx={{
                                        display: 'block',
                                        px: 3,
                                        py: 1.2,
                                        color: '#444',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s',
                                        borderLeft: '3px solid transparent',
                                        '&:hover': {
                                            bgcolor: '#fff5f0',
                                            color: '#f26522',
                                            borderLeftColor: '#f26522',
                                        },
                                    }}
                                >
                                    {link.name}
                                </Box>
                            ))}
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}
