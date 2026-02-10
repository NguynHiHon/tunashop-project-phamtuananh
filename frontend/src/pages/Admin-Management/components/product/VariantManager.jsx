import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Collapse,
    Divider,
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';

// Predefined common sizes
const COMMON_SIZES = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
};

// Predefined common categories/classifications (colors, special attributes)
const COMMON_CATEGORIES = [
    'Đen', 'Trắng', 'Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Cam', 'Hồng', 'Tím', 'Xám', 'Nâu', 'Navy',
    'Đế cao', 'Đế thấp', 'Có dây', 'Không dây', 'Thường', 'Cao cấp',
];

export default function VariantManager({ variants = [], onChange, hasVariants = false, onToggleVariants }) {
    // Compute initial categories from variants only once
    const getInitialCategories = () => {
        if (variants.length === 0) return [];
        const categoryMap = {};
        variants.forEach(v => {
            const cat = v.color || 'Mặc định';
            if (!categoryMap[cat]) {
                categoryMap[cat] = [];
            }
            if (v.size && !categoryMap[cat].includes(v.size)) {
                categoryMap[cat].push(v.size);
            }
        });
        return Object.entries(categoryMap).map(([name, sizes]) => ({ name, sizes }));
    };

    // State for categories and their sizes - initialized from variants
    const [categories, setCategories] = useState(() => getInitialCategories());
    const [newCategoryName, setNewCategoryName] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Dialog for editing variant details (stock, price, sku)
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [editFormData, setEditFormData] = useState({
        stock: 0,
        priceAdjustment: 0,
        sku: '',
        isActive: true,
    });

    // Generate variants from categories
    const generateVariants = (cats) => {
        const newVariants = [];
        cats.forEach(cat => {
            if (cat.sizes.length === 0) {
                // Category without sizes - create one variant with just color
                const existingVariant = variants.find(v => v.color === cat.name && !v.size);
                newVariants.push({
                    color: cat.name,
                    size: '',
                    stock: existingVariant?.stock || 0,
                    priceAdjustment: existingVariant?.priceAdjustment || 0,
                    sku: existingVariant?.sku || '',
                    isActive: existingVariant?.isActive !== false,
                    _id: existingVariant?._id,
                });
            } else {
                cat.sizes.forEach(size => {
                    // Find existing variant to preserve stock, price, sku
                    const existingVariant = variants.find(v => v.color === cat.name && v.size === size);
                    newVariants.push({
                        color: cat.name,
                        size,
                        stock: existingVariant?.stock || 0,
                        priceAdjustment: existingVariant?.priceAdjustment || 0,
                        sku: existingVariant?.sku || '',
                        isActive: existingVariant?.isActive !== false,
                        _id: existingVariant?._id,
                    });
                });
            }
        });
        onChange(newVariants);
    };

    // Add new category
    const handleAddCategory = (categoryName) => {
        const name = categoryName || newCategoryName.trim();
        if (!name) return;
        if (categories.some(c => c.name === name)) return; // Already exists

        const newCats = [...categories, { name, sizes: [] }];
        setCategories(newCats);
        setNewCategoryName('');
        setExpandedCategory(name);
        generateVariants(newCats);
    };

    // Delete category
    const handleDeleteCategory = (categoryName) => {
        const newCats = categories.filter(c => c.name !== categoryName);
        setCategories(newCats);
        generateVariants(newCats);
    };

    // Add size to category
    const handleAddSize = (categoryName, size) => {
        if (!size) return;
        const newCats = categories.map(c => {
            if (c.name === categoryName) {
                if (c.sizes.includes(size)) return c; // Already exists
                return { ...c, sizes: [...c.sizes, size] };
            }
            return c;
        });
        setCategories(newCats);
        generateVariants(newCats);
    };

    // Remove size from category
    const handleRemoveSize = (categoryName, size) => {
        const newCats = categories.map(c => {
            if (c.name === categoryName) {
                return { ...c, sizes: c.sizes.filter(s => s !== size) };
            }
            return c;
        });
        setCategories(newCats);
        generateVariants(newCats);
    };

    // Edit variant details (stock, price, sku)
    const handleOpenEditVariant = (variant) => {
        setEditingVariant(variant);
        setEditFormData({
            stock: variant.stock || 0,
            priceAdjustment: variant.priceAdjustment || 0,
            sku: variant.sku || '',
            isActive: variant.isActive !== false,
        });
        setEditDialogOpen(true);
    };

    const handleSaveVariant = () => {
        const updated = variants.map(v => {
            if (v.color === editingVariant.color && v.size === editingVariant.size) {
                return { ...v, ...editFormData };
            }
            return v;
        });
        onChange(updated);
        setEditDialogOpen(false);
    };

    // Delete single variant
    const handleDeleteVariant = (color, size) => {
        const updated = variants.filter(v => !(v.color === color && v.size === size));
        onChange(updated);

        // Also update categories
        const newCats = categories.map(c => {
            if (c.name === color) {
                return { ...c, sizes: c.sizes.filter(s => s !== size) };
            }
            return c;
        }).filter(c => c.sizes.length > 0 || variants.some(v => v.color === c.name));
        setCategories(newCats);
    };

    return (
        <Box>
            {/* Toggle variants */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={hasVariants}
                            onChange={(e) => onToggleVariants(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Sản phẩm có biến thể (Phân loại/Size)
                            </Typography>
                            {!hasVariants && variants.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    Đã ẩn biến thể. Bật lại để quản lý biến thể.
                                </Typography>
                            )}
                        </Box>
                    }
                />
            </Box>

            {hasVariants && (
                <>
                    {/* Step 1: Add Categories */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Bước 1: Tạo phân loại (Màu sắc, Đặc điểm...)
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                size="small"
                                placeholder="Nhập tên phân loại..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                sx={{ minWidth: 200 }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => handleAddCategory()}
                                disabled={!newCategoryName.trim()}
                            >
                                Thêm
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                Chọn nhanh:
                            </Typography>
                            {COMMON_CATEGORIES.filter(c => !categories.some(cat => cat.name === c)).slice(0, 12).map(cat => (
                                <Chip
                                    key={cat}
                                    label={cat}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleAddCategory(cat)}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Paper>

                    {/* Step 2: Categories list with sizes */}
                    {categories.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Bước 2: Thêm size cho từng phân loại
                            </Typography>

                            {categories.map((category) => (
                                <Card key={category.name} variant="outlined" sx={{ mb: 1 }}>
                                    <CardHeader
                                        title={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label={category.name} color="primary" size="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    ({category.sizes.length} size)
                                                </Typography>
                                            </Box>
                                        }
                                        action={
                                            <Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setExpandedCategory(
                                                        expandedCategory === category.name ? null : category.name
                                                    )}
                                                >
                                                    {expandedCategory === category.name ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteCategory(category.name)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        }
                                        sx={{ py: 1 }}
                                    />
                                    <Collapse in={expandedCategory === category.name}>
                                        <CardContent sx={{ pt: 0 }}>
                                            <Divider sx={{ mb: 2 }} />

                                            {/* Current sizes */}
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                    Các size đã thêm:
                                                </Typography>
                                                {category.sizes.length === 0 ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                        (Chưa có size)
                                                    </Typography>
                                                ) : (
                                                    category.sizes.map(size => (
                                                        <Chip
                                                            key={size}
                                                            label={size}
                                                            size="small"
                                                            onDelete={() => handleRemoveSize(category.name, size)}
                                                        />
                                                    ))
                                                )}
                                            </Box>

                                            {/* Quick add sizes */}
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                    Quần áo:
                                                </Typography>
                                                {COMMON_SIZES.clothing.map(size => (
                                                    <Chip
                                                        key={size}
                                                        label={size}
                                                        size="small"
                                                        variant={category.sizes.includes(size) ? 'filled' : 'outlined'}
                                                        color={category.sizes.includes(size) ? 'primary' : 'default'}
                                                        onClick={() => handleAddSize(category.name, size)}
                                                        sx={{ cursor: 'pointer' }}
                                                    />
                                                ))}
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                    Giày dép:
                                                </Typography>
                                                {COMMON_SIZES.shoes.map(size => (
                                                    <Chip
                                                        key={size}
                                                        label={size}
                                                        size="small"
                                                        variant={category.sizes.includes(size) ? 'filled' : 'outlined'}
                                                        color={category.sizes.includes(size) ? 'primary' : 'default'}
                                                        onClick={() => handleAddSize(category.name, size)}
                                                        sx={{ cursor: 'pointer' }}
                                                    />
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Collapse>
                                </Card>
                            ))}
                        </Paper>
                    )}

                    {/* Variants table */}
                    {variants.length > 0 && (
                        <Paper variant="outlined" sx={{ mb: 2 }}>
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Danh sách biến thể ({variants.length})
                                </Typography>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Phân loại</TableCell>
                                            <TableCell>Size</TableCell>
                                            <TableCell align="center">Tồn kho</TableCell>
                                            <TableCell align="right">Điều chỉnh giá</TableCell>
                                            <TableCell>SKU</TableCell>
                                            <TableCell align="center">Trạng thái</TableCell>
                                            <TableCell align="center">Thao tác</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {variants.map((variant, index) => (
                                            <TableRow key={`${variant.color}-${variant.size}-${index}`} hover>
                                                <TableCell>
                                                    <Chip label={variant.color || '-'} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={variant.size || '-'} size="small" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={variant.stock}
                                                        size="small"
                                                        color={variant.stock > 0 ? 'success' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {variant.priceAdjustment > 0 && '+'}
                                                    {(variant.priceAdjustment || 0).toLocaleString('vi-VN')}đ
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {variant.sku || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={variant.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                                                        size="small"
                                                        color={variant.isActive !== false ? 'success' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" onClick={() => handleOpenEditVariant(variant)}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteVariant(variant.color, variant.size)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Total stock info */}
                            <Box sx={{ display: 'flex', gap: 3, p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                                <Typography variant="body2">
                                    <strong>Tổng biến thể:</strong> {variants.length}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Tổng tồn kho:</strong> {variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {categories.length === 0 && (
                        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                Bắt đầu bằng cách thêm phân loại ở bước 1
                            </Typography>
                        </Paper>
                    )}
                </>
            )}

            {/* Edit Variant Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Chỉnh sửa biến thể: {editingVariant?.color} - {editingVariant?.size || 'Không có size'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="Tồn kho"
                                value={editFormData.stock}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                                fullWidth
                                size="small"
                                type="number"
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Điều chỉnh giá (VNĐ)"
                                value={editFormData.priceAdjustment}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, priceAdjustment: parseInt(e.target.value) || 0 }))}
                                fullWidth
                                size="small"
                                type="number"
                                helperText="Cộng thêm vào giá gốc"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="SKU (Mã sản phẩm)"
                                value={editFormData.sku}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, sku: e.target.value }))}
                                fullWidth
                                size="small"
                                placeholder="VD: SP001-DEN-39"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editFormData.isActive}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                }
                                label="Hiển thị biến thể này"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleSaveVariant} variant="contained">
                        Cập nhật
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
