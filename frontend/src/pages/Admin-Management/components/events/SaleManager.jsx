import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SearchIcon from '@mui/icons-material/Search';
import PercentIcon from '@mui/icons-material/Percent';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import PageContainer from '../PageContainer';
import { fetchProducts, updateProductSale } from '../../../../redux/clices/productSlice';

const INITIAL_PAGE_SIZE = 10;

const toDateTimeLocalValue = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    // Keep to yyyy-MM-ddTHH:mm for input[type=datetime-local]
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};

const toISOStringOrNull = (value) => {
    if (!value) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

const sanitizePercentInput = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return '';
    const onlyDigits = String(raw).replace(/[^0-9]/g, '');
    if (onlyDigits === '') return '';
    const num = Math.min(100, Number(onlyDigits));
    return Number.isNaN(num) ? '' : String(num);
};

export default function SaleManager() {
    const dispatch = useDispatch();
    const notifications = useNotifications();
    const { items, loading } = useSelector((state) => state.product);

    const [rowsState, setRowsState] = useState({ rows: [], rowCount: 0 });
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: INITIAL_PAGE_SIZE });
    const [isLoading, setIsLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [edits, setEdits] = useState({}); // id -> sale fields

    useEffect(() => {
        loadData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await dispatch(fetchProducts()).unwrap();
            const productItems = Array.isArray(res) ? res : res?.data || [];
            const rows = productItems.map((p) => ({ id: p._id || p.id, ...p }));
            setRowsState({ rows, rowCount: productItems.length });
            const mappedEdits = {};
            rows.forEach((r) => {
                mappedEdits[r.id] = {
                    salePercent: r.salePercent ?? 0,
                    saleStartAt: r.saleStartAt || '',
                    saleEndAt: r.saleEndAt || '',
                };
            });
            setEdits(mappedEdits);
        } catch (err) {
            notifications.show(`Không tải được sản phẩm. ${err?.message || ''}`, { severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Keep rowsState synced when store items change
    useEffect(() => {
        const productItems = Array.isArray(items) ? items : [];
        const rows = productItems.map((p) => ({ id: p._id || p.id, ...p }));
        setRowsState({ rows, rowCount: productItems.length });
        const mappedEdits = {};
        rows.forEach((r) => {
            mappedEdits[r.id] = {
                salePercent: r.salePercent ?? 0,
                saleStartAt: r.saleStartAt || '',
                saleEndAt: r.saleEndAt || '',
            };
        });
        setEdits(mappedEdits);
    }, [items]);

    const visibleRows = useMemo(() => {
        const keyword = filterText.trim().toLowerCase();
        if (!keyword) return rowsState.rows;
        return rowsState.rows.filter((r) => (r.name || '').toLowerCase().includes(keyword));
    }, [filterText, rowsState.rows]);

    const handleEditChange = (id, field) => (event) => {
        let value = event.target.value;
        if (field === 'salePercent') {
            value = sanitizePercentInput(value);
        }
        setEdits((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const handleApply = (row) => async () => {
        const current = edits[row.id] || {};
        setSavingId(row.id);
        try {
            const pct = current.salePercent === '' ? 0 : Number(current.salePercent);
            if (Number.isNaN(pct)) {
                notifications.show('Sale % phải là số', { severity: 'error' });
                setSavingId(null);
                return;
            }
            if (pct < 0 || pct > 100) {
                notifications.show('Sale % phải trong khoảng 0 - 100', { severity: 'error' });
                setSavingId(null);
                return;
            }

            await dispatch(updateProductSale({
                id: row.id,
                data: {
                    salePercent: pct,
                    saleStartAt: toISOStringOrNull(current.saleStartAt),
                    saleEndAt: toISOStringOrNull(current.saleEndAt),
                },
            })).unwrap();
            notifications.show('Đã cập nhật sale', { severity: 'success' });
            loadData();
        } catch (err) {
            const msg = err?.message || err?.data?.message || 'Cập nhật thất bại';
            notifications.show(msg, { severity: 'error' });
        } finally {
            setSavingId(null);
        }
    };

    const handleClear = (row) => async () => {
        setSavingId(row.id);
        try {
            await dispatch(updateProductSale({
                id: row.id,
                data: {
                    salePercent: 0,
                    saleStartAt: undefined,
                    saleEndAt: undefined,
                },
            })).unwrap();
            notifications.show('Đã xoá sale', { severity: 'success' });
            loadData();
        } catch (err) {
            const msg = err?.message || err?.data?.message || 'Xoá sale thất bại';
            notifications.show(msg, { severity: 'error' });
        } finally {
            setSavingId(null);
        }
    };

    const columns = [
        {
            field: 'defaultImage',
            headerName: 'Sản phẩm',
            width: 320,
            sortable: false,
            renderCell: (params) => {
                const row = params.row || {};
                const img = row.defaultImageId;
                const src = img?.url_Image || img?.secure_url || img?.url;
                const isOnSale = !!row.isOnSale;
                return (
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                backgroundColor: 'rgba(0,0,0,0.03)',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: isOnSale ? '2px solid #e53935' : '1px solid #eee',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {src ? (
                                <img src={src} alt="thumb" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <LocalOfferIcon sx={{ fontSize: 32, color: '#ccc' }} />
                            )}
                            {isOnSale && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        bgcolor: '#e53935',
                                        color: '#fff',
                                        px: 0.5,
                                        py: 0.2,
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        borderBottomLeftRadius: 4,
                                    }}
                                >
                                    SALE
                                </Box>
                            )}
                        </Box>
                        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
                                {row.name || '—'}
                            </Typography>
                            {row.brand && (
                                <Chip label={row.brand} size="small" variant="outlined" sx={{ width: 'fit-content', fontSize: '0.7rem' }} />
                            )}
                            <Typography variant="caption" color="text.secondary">
                                ID: {(row._id || row.id || '').slice(-8)}...
                            </Typography>
                        </Stack>
                    </Stack>
                );
            },
        },
        {
            field: 'price',
            headerName: 'Giá gốc',
            width: 130,
            valueGetter: (params) => (params?.row ? Number(params.row.price || 0) : 0),
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                    {Number(params.value || 0).toLocaleString('vi-VN')}₫
                </Typography>
            ),
        },
        {
            field: 'salePercent',
            headerName: 'Giảm giá',
            width: 140,
            renderCell: (params) => {
                const edit = edits[params.row.id] || {};
                const hasValue = Number(edit.salePercent) > 0;
                return (
                    <TextField
                        size="small"
                        type="text"
                        placeholder="0"
                        value={edit.salePercent ?? ''}
                        onChange={handleEditChange(params.row.id, 'salePercent')}
                        InputProps={{
                            endAdornment: <InputAdornment position="end"><PercentIcon fontSize="small" sx={{ color: hasValue ? '#e53935' : '#999' }} /></InputAdornment>,
                        }}
                        sx={{
                            width: 100,
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#e53935' },
                            },
                            '& input': { textAlign: 'center', fontWeight: hasValue ? 700 : 400, color: hasValue ? '#e53935' : 'inherit' },
                        }}
                    />
                );
            },
        },
        {
            field: 'saleStartAt',
            headerName: 'Bắt đầu',
            width: 200,
            sortable: false,
            renderCell: (params) => {
                const edit = edits[params.row.id] || {};
                return (
                    <TextField
                        size="small"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        value={toDateTimeLocalValue(edit.saleStartAt)}
                        onChange={handleEditChange(params.row.id, 'saleStartAt')}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                    />
                );
            },
        },
        {
            field: 'saleEndAt',
            headerName: 'Kết thúc',
            width: 200,
            sortable: false,
            renderCell: (params) => {
                const edit = edits[params.row.id] || {};
                return (
                    <TextField
                        size="small"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        value={toDateTimeLocalValue(edit.saleEndAt)}
                        onChange={handleEditChange(params.row.id, 'saleEndAt')}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                    />
                );
            },
        },
        {
            field: 'finalPrice',
            headerName: 'Giá bán',
            width: 150,
            renderCell: (params) => {
                const row = params?.row || {};
                const finalPrice = row.finalPrice ?? row.price ?? 0;
                const onSale = !!row.isOnSale;
                const discount = row.salePercent || 0;
                return (
                    <Stack spacing={0.3}>
                        <Typography variant="body1" fontWeight={700} sx={{ color: onSale ? '#e53935' : 'inherit' }}>
                            {Number(finalPrice).toLocaleString('vi-VN')}₫
                        </Typography>
                        {onSale && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <Chip
                                    size="small"
                                    label={`-${discount}%`}
                                    sx={{ bgcolor: '#ffebee', color: '#e53935', fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                                />
                                <LocalFireDepartmentIcon sx={{ fontSize: 14, color: '#ff9800' }} />
                            </Stack>
                        )}
                    </Stack>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 180,
            sortable: false,
            renderCell: (params) => {
                const disabled = savingId === params.row.id || isLoading || loading;
                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            color="success"
                            startIcon={<CheckIcon />}
                            disabled={disabled}
                            onClick={handleApply(params.row)}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Lưu
                        </Button>
                        <Tooltip title="Xoá sale (đặt 0%)">
                            <span>
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={disabled}
                                    onClick={handleClear(params.row)}
                                    sx={{ border: '1px solid', borderColor: 'error.light' }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ];

    const pageTitle = 'Quản lí Sale sản phẩm';

    // Calculate stats
    const stats = useMemo(() => {
        const total = rowsState.rows.length;
        const onSale = rowsState.rows.filter((r) => r.isOnSale).length;
        const scheduled = rowsState.rows.filter((r) => {
            const pct = r.salePercent || 0;
            const start = r.saleStartAt ? new Date(r.saleStartAt) : null;
            return pct > 0 && start && start > new Date();
        }).length;
        return { total, onSale, scheduled };
    }, [rowsState.rows]);

    return (
        <PageContainer
            title={pageTitle}
            breadcrumbs={[{ title: 'Hoạt động' }, { title: 'Sự kiện' }, { title: 'Sale' }]}
            actions={(
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#999' }} /></InputAdornment>,
                        }}
                        sx={{ width: 260, bgcolor: '#fff', borderRadius: 1 }}
                    />
                    <Tooltip title="Tải lại dữ liệu" placement="bottom">
                        <span>
                            <IconButton size="small" onClick={loadData} disabled={isLoading} sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#f5f5f5' } }}>
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            )}
        >
            {/* Stats Cards */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Card sx={{ flex: 1, bgcolor: '#fff', boxShadow: 1 }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                                    Tổng sản phẩm
                                </Typography>
                                <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
                            </Box>
                            <LocalOfferIcon sx={{ fontSize: 40, color: '#e0e0e0' }} />
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1, bgcolor: 'linear-gradient(135deg, #e53935 0%, #ff7043 100%)', boxShadow: 1, background: 'linear-gradient(135deg, #ffebee 0%, #fff 100%)' }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5, color: '#e53935' }}>
                                    Đang Sale
                                </Typography>
                                <Typography variant="h4" fontWeight={700} sx={{ color: '#e53935' }}>{stats.onSale}</Typography>
                            </Box>
                            <LocalFireDepartmentIcon sx={{ fontSize: 40, color: '#ffcdd2' }} />
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1, bgcolor: '#fff', boxShadow: 1 }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                                    Đã lên lịch
                                </Typography>
                                <Typography variant="h4" fontWeight={700} color="warning.main">{stats.scheduled}</Typography>
                            </Box>
                            <PercentIcon sx={{ fontSize: 40, color: '#e0e0e0' }} />
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            {/* Data Grid */}
            <Card sx={{ boxShadow: 1 }}>
                <Box sx={{ width: '100%' }}>
                    <DataGrid
                        rows={visibleRows}
                        columns={columns}
                        pagination
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25, 50]}
                        loading={isLoading || loading}
                        autoHeight
                        disableRowSelectionOnClick
                        rowHeight={100}
                        getRowId={(row) => row.id}
                        sx={{
                            border: 'none',
                            [`& .${gridClasses.columnHeader}`]: {
                                bgcolor: '#fafafa',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: '#333',
                            },
                            [`& .${gridClasses.cell}`]: {
                                borderBottom: '1px solid #f0f0f0',
                            },
                            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                                outline: 'transparent',
                            },
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: '#fafafa',
                            },
                        }}
                    />
                </Box>
            </Card>
        </PageContainer>
    );
}
