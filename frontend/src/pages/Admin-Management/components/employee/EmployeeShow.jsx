import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import userService from '../../../../services/userService';

import PageContainer from '../PageContainer';

export default function EmployeeShow() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [employee, setEmployee] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await userService.getUser(employeeId);

      setEmployee(showData);
    } catch (showDataError) {
      setError(showDataError);
    }
    setIsLoading(false);
  }, [employeeId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEmployeeEdit = React.useCallback(() => {
    // navigate relative to /management
    navigate(`employees/${employeeId}/edit`);
  }, [navigate, employeeId]);

  const handleEmployeeDelete = React.useCallback(async () => {
    if (!employee) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Bạn có muốn xóa ${employee.name}?`,
      {
        title: `Xóa nhân viên?`,
        severity: 'error',
        okText: 'Xóa',
        cancelText: 'Hủy',
      }
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await userService.deleteUser(employeeId);

        // redirect to management employees list
        navigate('/management/employees');

        notifications.show('Xóa nhân viên thành công.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Xóa nhân viên thất bại. Lỗi: ${deleteError.message}`,
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
      setIsLoading(false);
    }
  }, [employee, dialogs, employeeId, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    // go back to employees list in management
    navigate('/management/employees');
  }, [navigate]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return employee ? (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Tên đăng nhập</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {employee.username}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {employee.email}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Số điện thoại</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {employee.phone || '—'}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Vai trò</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {employee.role}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Họ và tên</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {employee.name || '—'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEmployeeEdit}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleEmployeeDelete}
            >
              Xóa
            </Button>
          </Stack>
        </Stack>
      </Box>
    ) : null;
  }, [
    isLoading,
    error,
    employee,
    handleBack,
    handleEmployeeEdit,
    handleEmployeeDelete,
  ]);

  const pageTitle = employee?.name ? `Chi tiết: ${employee.name}` : `Chi tiết nhân viên ${employeeId}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Nhân viên', path: '/management/employees' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}
