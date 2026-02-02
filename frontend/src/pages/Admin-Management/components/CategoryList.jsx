import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
    fetchProductTypes,
    fetchAllAttributes,
    fetchAttributes,
    createProductType,
    updateProductType,
    deleteProductType,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    clearErrors
} from '../../../redux/clices/categorySlice';

export default function CategoryList() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        productTypes,
        productTypesTotal,
        productTypesLoading,
        productTypesError,
        attributes,
        attributesTotal,
        attributesLoading,
        attributesError,
        deleteLoading,
        allAttributes,
        createLoading,
        updateLoading,
        createError,
        updateError
    } = useSelector((state) => state.category);
    const { currentUser } = useSelector((state) => state.auth);

    // Tab state
    const [activeTab, setActiveTab] = React.useState(0); // 0: Categories, 1: Attributes

    // Pagination and sorting states for both tabs
    const [categoryPaginationModel, setCategoryPaginationModel] = React.useState({ page: 0, pageSize: 10 });
    const [categorySortModel, setCategorySortModel] = React.useState([{ field: 'name', sort: 'asc' }]);
    const [attributePaginationModel, setAttributePaginationModel] = React.useState({ page: 0, pageSize: 10 });
    const [attributeSortModel, setAttributeSortModel] = React.useState([{ field: 'name', sort: 'asc' }]);

    const [search, setSearch] = React.useState('');
    const [searchInput, setSearchInput] = React.useState('');

    // Modal states
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);

    // Form states
    const [formData, setFormData] = React.useState({
        name: '',
        name_vi: '',
        type: 'text', // for attributes
        listAttributeIds: [], // for categories
        options: [], // for attributes
    });
    const [formErrors, setFormErrors] = React.useState({});

    // Check admin
    React.useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            alert('Bạn không có quyền truy cập trang này');
            navigate('/');
        }
    }, [currentUser, navigate]);

    // Fetch data based on active tab
    React.useEffect(() => {
        if (activeTab === 0) {
            // Categories tab
            dispatch(fetchProductTypes({
                page: categoryPaginationModel.page + 1,
                perPage: categoryPaginationModel.pageSize,
                sortField: categorySortModel[0]?.field || 'name',
                sortOrder: categorySortModel[0]?.sort || 'asc',
                search
            }));
        } else {
            // Attributes tab
            dispatch(fetchAttributes({
                page: attributePaginationModel.page + 1,
                perPage: attributePaginationModel.pageSize,
                sortField: attributeSortModel[0]?.field || 'name',
                sortOrder: attributeSortModel[0]?.sort || 'asc',
                search
            }));
        }
    }, [dispatch, activeTab, categoryPaginationModel, categorySortModel, attributePaginationModel, attributeSortModel, search]);

    // Fetch all attributes for category dropdown
    React.useEffect(() => {
        if (activeTab === 0) {
            dispatch(fetchAllAttributes());
        }
    }, [dispatch, activeTab]);

    // Show error notifications
    React.useEffect(() => {
        if (createError) {
            alert(`Lỗi: ${createError}`);
        }
        if (updateError) {
            alert(`Lỗi: ${updateError}`);
        }
    }, [createError, updateError]);

    const handleDelete = React.useCallback(async (id, name) => {
        const itemType = activeTab === 0 ? 'loại sản phẩm' : 'thuộc tính';
        const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa ${itemType} "${name}"?`);
        if (confirmed) {
            try {
                if (activeTab === 0) {
                    await dispatch(deleteProductType(id)).unwrap();
                } else {
                    await dispatch(deleteAttribute(id)).unwrap();
                }
                alert(`Xóa ${itemType} thành công`);
            } catch (error) {
                alert(`Lỗi: ${error}`);
            }
        }
    }, [activeTab, dispatch]);

    const handleCreate = () => {
        if (activeTab === 0) {
            // Category
            setFormData({
                name: '',
                name_vi: '',
                type: 'text',
                listAttributeIds: [],
            });
        } else {
            // Attribute
            setFormData({
                name: '',
                name_vi: '',
                type: 'text',
                listAttributeIds: [],
                options: [],
            });
        }
        setFormErrors({});
        dispatch(clearErrors());
        setEditingItem(null);
        setCreateModalOpen(true);
    };

    const handleEdit = (item) => {
        if (activeTab === 0) {
            // Category
            setFormData({
                name: item.name,
                name_vi: item.name_vi,
                type: 'text',
                listAttributeIds: item.listAttributeIds?.map(a => a._id) || [],
            });
        } else {
            // Attribute
            setFormData({
                name: item.name,
                name_vi: item.name_vi,
                type: item.type,
                listAttributeIds: [],
                options: item.options || [],
            });
        }
        setEditingItem(item);
        setFormErrors({});
        dispatch(clearErrors());
        setEditModalOpen(true);
    };

    const handleFormSubmit = async () => {
        // Validate
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Tên (EN) là bắt buộc';
        if (!formData.name_vi.trim()) errors.name_vi = 'Tên (VI) là bắt buộc';
        if (activeTab === 1 && !formData.type) errors.type = 'Loại thuộc tính là bắt buộc';
        if (activeTab === 1 && formData.type === 'select') {
            if (!formData.options || formData.options.length === 0) {
                errors.options = 'Phải có ít nhất một lựa chọn';
            } else {
                const emptyOptions = formData.options.filter(option => !option.trim());
                if (emptyOptions.length > 0) {
                    errors.options = 'Không được để trống lựa chọn';
                }
            }
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            if (editingItem) {
                if (activeTab === 0) {
                    await dispatch(updateProductType({
                        id: editingItem._id,
                        data: formData
                    })).unwrap();
                    alert('Cập nhật loại sản phẩm thành công');
                } else {
                    await dispatch(updateAttribute({
                        id: editingItem._id,
                        data: formData
                    })).unwrap();
                    alert('Cập nhật thuộc tính thành công');
                }
                setEditModalOpen(false);
            } else {
                if (activeTab === 0) {
                    await dispatch(createProductType(formData)).unwrap();
                    alert('Tạo loại sản phẩm thành công');
                } else {
                    await dispatch(createAttribute(formData)).unwrap();
                    alert('Tạo thuộc tính thành công');
                }
                setCreateModalOpen(false);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            // Error handled by useEffect
        }
    };

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            if (activeTab === 0) {
                setCategoryPaginationModel(prev => ({ ...prev, page: 0 }));
            } else {
                setAttributePaginationModel(prev => ({ ...prev, page: 0 }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, activeTab]);

    const categoryColumns = React.useMemo(() => [
        {
            field: '_id',
            headerName: 'ID',
            width: 220,
            sortable: false
        },
        {
            field: 'name',
            headerName: 'Tên (EN)',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'name_vi',
            headerName: 'Tên (VI)',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'listAttributeIds',
            headerName: 'Thuộc tính',
            flex: 1.5,
            minWidth: 200,
            sortable: false,
            renderCell: (params) => {
                const attributes = params.value || [];
                if (attributes.length === 0) {
                    return <Typography variant="body2" color="text.secondary">Chưa có thuộc tính</Typography>;
                }
                return (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ py: 0.5 }}>
                        {attributes.slice(0, 3).map((attr) => (
                            <Chip
                                key={attr._id}
                                label={attr.name}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                        {attributes.length > 3 && (
                            <Chip
                                label={`+${attributes.length - 3}`}
                                size="small"
                                color="default"
                            />
                        )}
                    </Stack>
                );
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Thao tác',
            width: 120,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<EditIcon />}
                    label="Sửa"
                    onClick={() => handleEdit(params.row)}
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<DeleteIcon />}
                    label="Xóa"
                    onClick={() => handleDelete(params.id, params.row.name)}
                    disabled={deleteLoading}
                />,
            ],
        },
    ], [handleDelete, handleEdit, deleteLoading]);

    const attributeColumns = React.useMemo(() => [
        {
            field: '_id',
            headerName: 'ID',
            width: 220,
            sortable: false
        },
        {
            field: 'name',
            headerName: 'Tên (EN)',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'name_vi',
            headerName: 'Tên (VI)',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'type',
            headerName: 'Loại',
            width: 120,
            renderCell: (params) => {
                const typeLabels = {
                    text: 'Văn bản',
                    number: 'Số',
                    boolean: 'Có/Không',
                    select: 'Lựa chọn'
                };
                return (
                    <Chip
                        label={typeLabels[params.value] || params.value}
                        size="small"
                        color="secondary"
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: 'options',
            headerName: 'Lựa chọn',
            flex: 1,
            minWidth: 200,
            sortable: false,
            renderCell: (params) => {
                const options = params.value || [];
                if (options.length === 0) {
                    return <Typography variant="body2" color="text.secondary">Không có lựa chọn</Typography>;
                }
                return (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ py: 0.5 }}>
                        {options.slice(0, 3).map((option, index) => (
                            <Chip
                                key={index}
                                label={option}
                                size="small"
                                color="info"
                                variant="outlined"
                            />
                        ))}
                        {options.length > 3 && (
                            <Chip
                                label={`+${options.length - 3}`}
                                size="small"
                                color="default"
                            />
                        )}
                    </Stack>
                );
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Thao tác',
            width: 120,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<EditIcon />}
                    label="Sửa"
                    onClick={() => handleEdit(params.row)}
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<DeleteIcon />}
                    label="Xóa"
                    onClick={() => handleDelete(params.id, params.row.name)}
                    disabled={deleteLoading}
                />,
            ],
        },
    ], [handleDelete, handleEdit, deleteLoading]);

    const columns = activeTab === 0 ? categoryColumns : attributeColumns;

    const rows = React.useMemo(() => {
        const data = activeTab === 0 ? productTypes : attributes;
        return data.map(item => ({ ...item, id: item._id }));
    }, [activeTab, productTypes, attributes]);

    const currentData = activeTab === 0 ? {
        data: productTypes,
        total: productTypesTotal,
        loading: productTypesLoading,
        error: productTypesError,
        paginationModel: categoryPaginationModel,
        setPaginationModel: setCategoryPaginationModel,
        sortModel: categorySortModel,
        setSortModel: setCategorySortModel
    } : {
        data: attributes,
        total: attributesTotal,
        loading: attributesLoading,
        error: attributesError,
        paginationModel: attributePaginationModel,
        setPaginationModel: setAttributePaginationModel,
        sortModel: attributeSortModel,
        setSortModel: setAttributeSortModel
    };

    if (currentData.error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{currentData.error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Quản lý danh mục
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Thêm mới
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
                    <Tab label="Loại sản phẩm" />
                    <Tab label="Thuộc tính" />
                </Tabs>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField
                    placeholder="Tìm kiếm theo tên..."
                    size="small"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Box>

            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    rowCount={currentData.total}
                    loading={currentData.loading}
                    paginationMode="server"
                    sortingMode="server"
                    paginationModel={currentData.paginationModel}
                    onPaginationModelChange={currentData.setPaginationModel}
                    sortModel={currentData.sortModel}
                    onSortModelChange={currentData.setSortModel}
                    pageSizeOptions={[5, 10, 25, 50]}
                    disableRowSelectionOnClick
                    getRowHeight={() => 'auto'}
                    sx={{
                        '& .MuiDataGrid-cell': {
                            py: 1,
                        },
                    }}
                />
            </Box>

            {/* Create Modal */}
            <Dialog
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {activeTab === 0 ? 'Thêm loại sản phẩm mới' : 'Thêm thuộc tính mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên (EN)"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            required
                            placeholder={activeTab === 0 ? "e.g. Badminton Racket" : "e.g. Color"}
                        />
                        <TextField
                            fullWidth
                            label="Tên (VI)"
                            value={formData.name_vi}
                            onChange={(e) => setFormData(prev => ({ ...prev, name_vi: e.target.value }))}
                            error={!!formErrors.name_vi}
                            helperText={formErrors.name_vi}
                            required
                            placeholder={activeTab === 0 ? "e.g. Vợt cầu lông" : "e.g. Màu sắc"}
                        />
                        {activeTab === 0 ? (
                            // Category form
                            <Autocomplete
                                multiple
                                options={allAttributes}
                                getOptionLabel={(option) => `${option.name} (${option.type})`}
                                value={allAttributes.filter(attr => formData.listAttributeIds?.includes(attr._id))}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        listAttributeIds: newValue.map(attr => attr._id)
                                    }));
                                }}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Chọn thuộc tính"
                                        placeholder="Tìm và chọn thuộc tính..."
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option._id}
                                            label={`${option.name} (${option.type})`}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))
                                }
                            />
                        ) : (
                            <>
                                <FormControl fullWidth error={!!formErrors.type}>
                                    <InputLabel>Loại thuộc tính</InputLabel>
                                    <Select
                                        value={formData.type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                type: newType,
                                                options: newType === 'select' ? prev.options : []
                                            }));
                                        }}
                                        label="Loại thuộc tính"
                                    >
                                        <MenuItem value="text">Văn bản</MenuItem>
                                        <MenuItem value="number">Số</MenuItem>
                                        <MenuItem value="boolean">Có/Không</MenuItem>
                                        <MenuItem value="select">Lựa chọn</MenuItem>
                                    </Select>
                                    {formErrors.type && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                            {formErrors.type}
                                        </Typography>
                                    )}
                                </FormControl>
                                {formData.type === 'select' && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            Lựa chọn có sẵn
                                        </Typography>
                                        <Stack spacing={1}>
                                            {formData.options.map((option, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...formData.options];
                                                            newOptions[index] = e.target.value;
                                                            setFormData(prev => ({ ...prev, options: newOptions }));
                                                        }}
                                                        placeholder={`Lựa chọn ${index + 1}`}
                                                    />
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            const newOptions = formData.options.filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, options: newOptions }));
                                                        }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Box>
                                            ))}
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
                                                }}
                                                startIcon={<AddIcon />}
                                            >
                                                Thêm lựa chọn
                                            </Button>
                                        </Stack>
                                        {formErrors.options && (
                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                {formErrors.options}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleFormSubmit}
                        variant="contained"
                        disabled={createLoading}
                        startIcon={createLoading ? <CircularProgress size={20} /> : null}
                    >
                        {createLoading ? 'Đang tạo...' : 'Tạo mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {activeTab === 0 ? 'Chỉnh sửa loại sản phẩm' : 'Chỉnh sửa thuộc tính'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên (EN)"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            required
                            placeholder={activeTab === 0 ? "e.g. Badminton Racket" : "e.g. Color"}
                        />
                        <TextField
                            fullWidth
                            label="Tên (VI)"
                            value={formData.name_vi}
                            onChange={(e) => setFormData(prev => ({ ...prev, name_vi: e.target.value }))}
                            error={!!formErrors.name_vi}
                            helperText={formErrors.name_vi}
                            required
                            placeholder={activeTab === 0 ? "e.g. Vợt cầu lông" : "e.g. Màu sắc"}
                        />
                        {activeTab === 0 ? (
                            // Category form
                            <Autocomplete
                                multiple
                                options={allAttributes}
                                getOptionLabel={(option) => `${option.name} (${option.type})`}
                                value={allAttributes.filter(attr => formData.listAttributeIds?.includes(attr._id))}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        listAttributeIds: newValue.map(attr => attr._id)
                                    }));
                                }}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Chọn thuộc tính"
                                        placeholder="Tìm và chọn thuộc tính..."
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option._id}
                                            label={`${option.name} (${option.type})`}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))
                                }
                            />
                        ) : (
                            <>
                                <FormControl fullWidth error={!!formErrors.type}>
                                    <InputLabel>Loại thuộc tính</InputLabel>
                                    <Select
                                        value={formData.type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                type: newType,
                                                options: newType === 'select' ? prev.options : []
                                            }));
                                        }}
                                        label="Loại thuộc tính"
                                    >
                                        <MenuItem value="text">Văn bản</MenuItem>
                                        <MenuItem value="number">Số</MenuItem>
                                        <MenuItem value="boolean">Có/Không</MenuItem>
                                        <MenuItem value="select">Lựa chọn</MenuItem>
                                    </Select>
                                    {formErrors.type && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                            {formErrors.type}
                                        </Typography>
                                    )}
                                </FormControl>
                                {formData.type === 'select' && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            Lựa chọn có sẵn
                                        </Typography>
                                        <Stack spacing={1}>
                                            {formData.options.map((option, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...formData.options];
                                                            newOptions[index] = e.target.value;
                                                            setFormData(prev => ({ ...prev, options: newOptions }));
                                                        }}
                                                        placeholder={`Lựa chọn ${index + 1}`}
                                                    />
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            const newOptions = formData.options.filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, options: newOptions }));
                                                        }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Box>
                                            ))}
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
                                                }}
                                                startIcon={<AddIcon />}
                                            >
                                                Thêm lựa chọn
                                            </Button>
                                        </Stack>
                                        {formErrors.options && (
                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                {formErrors.options}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleFormSubmit}
                        variant="contained"
                        disabled={updateLoading}
                        startIcon={updateLoading ? <CircularProgress size={20} /> : null}
                    >
                        {updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}