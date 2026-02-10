import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridActionsCellItem, gridClasses } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../PageContainer';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import { fetchProducts, deleteProduct } from '../../../../redux/clices/productSlice';

const INITIAL_PAGE_SIZE = 10;

export default function ProductList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const { items, loading, error } = useSelector(state => state.product);

  const [rowsState, setRowsState] = React.useState({ rows: [], rowCount: 0 });
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: INITIAL_PAGE_SIZE });
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await dispatch(fetchProducts()).unwrap();
      const productItems = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      const rows = productItems.map(p => ({ id: p._id || p.id, ...p }));
      setRowsState({ rows, rowCount: productItems.length });
    } catch (err) {
      notifications.show(`Failed to load products. ${err.message || ''}`, { severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => { if (!isLoading) loadData(); };

  const handleCreateClick = () => { navigate('/management/products/create'); };

  const handleRowEdit = (id) => () => { navigate(`/management/products/${id}/edit`); };

  const handleRowDelete = (row) => async () => {
    const confirmed = window.confirm(`Delete product "${row.name}"?`);
    if (!confirmed) return;
    try {
      await dispatch(deleteProduct(row.id)).unwrap();
      notifications.show('Product deleted', { severity: 'success' });
      loadData();
    } catch (err) {
      notifications.show(`Failed to delete product. ${err.message || ''}`, { severity: 'error' });
    }
  };

  // Keep rowsState synced when store items change (ensures UI updates if items updated elsewhere)
  React.useEffect(() => {
    const productItems = Array.isArray(items) ? items : [];
    const rows = productItems.map(p => ({ id: p._id || p.id, ...p }));
    setRowsState({ rows, rowCount: productItems.length });
  }, [items]);
  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', width: 240 },
    { field: 'price', headerName: 'Price', width: 120 },
    { field: 'stock', headerName: 'Stock', width: 100 },
    {
      field: 'defaultImage',
      headerName: 'Default Image',
      width: 260,
      renderCell: (params) => {
        const p = params.row;
        const img = p.defaultImageId;
        const src = img?.url_Image || img?.secure_url || img?.url;
        return src ? (
          <div style={{ width: 200, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', borderRadius: 8, overflow: 'hidden' }}>
            <img src={src} alt="default" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        ) : '—';
      }
    },


    {
      field: 'actions',
      headerName: 'Điều chỉnh',
      type: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<EditIcon />} label="Edit" onClick={() => { navigate(`/management/products/${row._id || row.id}/edit`); }} />,
        <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Delete" onClick={handleRowDelete(row)} />,
      ]
    }
  ];

  const pageTitle = 'Products';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={(
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}><div>
            <IconButton size="small" aria-label="refresh" onClick={handleRefresh}><RefreshIcon /></IconButton>
          </div></Tooltip>
          <Button variant="contained" onClick={handleCreateClick} startIcon={<AddIcon />}>Create</Button>
        </Stack>
      )}
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <div style={{ color: 'red' }}>
              {error?.message || (typeof error === 'string' && (/^\s*<!doctype/i.test(error) ? 'Server returned HTML. Check backend/proxy.' : error)) || JSON.stringify(error)}
            </div>
          </Box>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            columns={columns}
            pagination
            paginationModel={paginationModel}
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
            loading={isLoading}
            autoHeight
            rowHeight={180}
            sx={{ [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: { outline: 'transparent' } }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
