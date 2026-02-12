import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Stack, Tooltip, IconButton, Typography, Chip } from '@mui/material';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageContainer from './components/PageContainer';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import useNotifications from './hooks/useNotifications/useNotifications';

const INITIAL_PAGE_SIZE = 10;

export default function Accounts() {
    const navigate = useNavigate();
    const [rowsState, setRowsState] = useState({ rows: [], rowCount: 0 });
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: INITIAL_PAGE_SIZE });
    const [isLoading, setIsLoading] = useState(false);
    const [filterText, setFilterText] = useState('');

    const notifications = useNotifications();

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await userService.getAllUser(null, { roles: 'user' });
            const list = Array.isArray(res) ? res : res?.users || [];
            setRowsState({ rows: list.map(u => ({ id: u._id || u.id, ...u })), rowCount: list.length });
        } catch (err) {
            console.error(err);
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                notifications.show('Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập lại.', { severity: 'warning' });
            } else {
                notifications.show('Không thể tải danh sách tài khoản', { severity: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [notifications]);

    useEffect(() => { load(); }, [load]);

    const handleRefresh = useCallback(() => { if (!isLoading) load(); }, [isLoading, load]);
    const handleView = (id) => () => navigate(`/management/employees/${id}`);

    const handleToggleBan = async (row) => {
        try {
            const newState = row.state === 'banned' ? 'active' : 'banned';
            await userService.updateUser(row.id, { state: newState });
            load();
        } catch (err) { console.error(err); }
    };

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 140 },
        { field: 'username', headerName: 'Tên tài khoản', width: 180 },
        { field: 'name', headerName: 'Tên', width: 200 },
        { field: 'email', headerName: 'Email', width: 240 },
        { field: 'createdAt', headerName: 'Đăng ký', width: 180, valueGetter: (p) => p?.row?.createdAt ? new Date(p.row.createdAt) : null },
        {
            field: 'state', headerName: 'Trạng thái', width: 130, renderCell: (params) => (
                <Chip label={params.value || 'active'} color={params.value === 'banned' ? 'error' : 'success'} size="small" />
            )
        },
        {
            field: 'actions', headerName: 'Thao tác', width: 160, sortable: false, renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Xem thông tin">
                        <IconButton size="small" onClick={handleView(params.row.id)}><VisibilityIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.state === 'banned' ? 'Bỏ cấm' : 'Cấm'}>
                        <IconButton size="small" onClick={() => handleToggleBan(params.row)}>
                            {params.row.state === 'banned' ? <CheckCircleIcon color="success" /> : <BlockIcon color="error" />}
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        },
    ], [handleView]);

    const visibleRows = useMemo(() => {
        const kw = filterText.trim().toLowerCase();
        if (!kw) return rowsState.rows;
        return rowsState.rows.filter(r => (r.username || '').toLowerCase().includes(kw) || (r.name || '').toLowerCase().includes(kw) || (r.email || '').toLowerCase().includes(kw));
    }, [filterText, rowsState.rows]);

    return (
        <PageContainer title="Tài khoản người dùng" breadcrumbs={[{ title: 'Tài khoản' }]}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6">Danh sách tài khoản (user)</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                    <input placeholder="Tìm kiếm..." value={filterText} onChange={(e) => setFilterText(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }} />
                    <Tooltip title="Tải lại">
                        <span>
                            <IconButton size="small" onClick={handleRefresh} disabled={isLoading}><RefreshIcon /></IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>

            <Box sx={{ height: 'auto', width: '100%' }}>
                <DataGrid
                    rows={visibleRows}
                    columns={columns}
                    loading={isLoading}
                    autoHeight
                    pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    getRowId={(r) => r.id}
                    sx={{ [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: { outline: 'transparent' } }}
                />
            </Box>
        </PageContainer>
    );
}
