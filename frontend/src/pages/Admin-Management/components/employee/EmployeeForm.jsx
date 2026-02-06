import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';

function EmployeeForm(props) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit],
  );

  const handleChange = React.useCallback((e) => {
    onFieldChange(e.target.name, e.target.value);
  }, [onFieldChange]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? '/management/employees');
  }, [navigate, backButtonPath]);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ width: '100%' }}>
      <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="username" label="Tên đăng nhập" value={formValues.username ?? ''} onChange={handleChange} error={!!formErrors.username} helperText={formErrors.username ?? ' '} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="email" label="Email" value={formValues.email ?? ''} onChange={handleChange} error={!!formErrors.email} helperText={formErrors.email ?? ' '} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="name" label="Họ và tên" value={formValues.name ?? ''} onChange={handleChange} error={!!formErrors.name} helperText={formErrors.name ?? ' '} />
        </Grid>


        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="phone" label="Số điện thoại" value={formValues.phone ?? ''} onChange={handleChange} error={!!formErrors.phone} helperText={formErrors.phone ?? ' '} />
        </Grid>



        <Grid item xs={12} sm={8}>
          <FormControl fullWidth error={!!formErrors.role}>
            <InputLabel id="employee-role-label">Vai trò</InputLabel>
            <Select labelId="employee-role-label" name="role" value={formValues.role ?? 'user'} label="Role" onChange={handleChange}>
              <MenuItem value="user">Người dùng</MenuItem>
              <MenuItem value="staff">Nhân viên</MenuItem>
              <MenuItem value="admin">Quản trị</MenuItem>
            </Select>
            <FormHelperText>{formErrors.role ?? ' '}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth type="password" name="password" label="Mật khẩu" value={formValues.password ?? ''} onChange={handleChange} error={!!formErrors.password} helperText={formValues._isEdit ? (formErrors.password ?? 'Để trống để giữ mật khẩu hiện tại') : (formErrors.password ?? ' ')} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth type="password" name="passwordConfirm" label="Xác nhận mật khẩu" value={formValues.passwordConfirm ?? ''} onChange={handleChange} error={!!formErrors.passwordConfirm} helperText={formErrors.passwordConfirm ?? ' '} />
        </Grid>
      </Grid>


      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>Quay lại</Button>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>{submitButtonLabel}</Button>
      </Stack>
    </Box>
  );
}

EmployeeForm.propTypes = {
  backButtonPath: PropTypes.string,
  formState: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
  submitButtonLabel: PropTypes.string.isRequired,
};

export default EmployeeForm;


