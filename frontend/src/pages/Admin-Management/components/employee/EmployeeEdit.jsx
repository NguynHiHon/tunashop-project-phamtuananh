import React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import userService from '../../../../services/userService';
import { validateEmployee } from './validation';
import { useEffect } from 'react';
import EmployeeForm from './EmployeeForm';
import PageContainer from '../PageContainer';
import { useState } from 'react';


function EmployeeEditForm({ initialValues, onSubmit }) {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState(() => ({ values: initialValues, errors: {} }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues) => {
    setFormState((previousState) => ({ ...previousState, values: newFormValues }));
  }, []);

  const setFormErrors = React.useCallback((newFormErrors) => {
    setFormState((previousState) => ({ ...previousState, errors: newFormErrors }));
  }, []);

  const handleFormFieldChange = React.useCallback(
    (name, value) => {
      const { issues } = validateEmployee({ ...formValues, [name]: value }, { requirePassword: false });
      setFormErrors({
        ...formErrors,
        [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
      });
      setFormValues({ ...formValues, [name]: value });
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateEmployee(formValues, { requirePassword: false });
    if (issues && issues.length > 0) {
      setFormErrors(Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])));
      return;
    }
    setFormErrors({});

    try {
      await onSubmit(formValues);
      notifications.show('Cập nhật nhân viên thành công.', { severity: 'success', autoHideDuration: 3000 });
      navigate('/management/employees');
    } catch (editError) {
      notifications.show(`Cập nhật thất bại. Lỗi: ${editError.message}`, { severity: 'error', autoHideDuration: 3000 });
      throw editError;
    }
  }, [formValues, onSubmit, navigate, notifications, setFormErrors]);

  return (
    <EmployeeForm
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="Lưu"
      backButtonPath={`/management/employees/${employeeId}`}
    />
  );
}

const EmployeeEdit = () => {
  const { employeeId } = useParams();

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {


    const loadData = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const data = await userService.getUser(employeeId);
        setEmployee(data);

      } catch (showDataError) {
        setError(showDataError);
      }
      setIsLoading(false);
    }
    loadData();

  }, [employeeId]);



  const notifications = useNotifications();






  const handleSubmit = async (formValues) => {
    try {
      const payload = { ...formValues };
      const updatedData = await userService.updateUser(employeeId, payload);
      setEmployee(updatedData);
      notifications.show('Cập nhật nhân viên thành công.', { severity: 'success', autoHideDuration: 3000 });
    } catch (updateError) {
      notifications.show(`Cập nhật thất bại. Lỗi: ${updateError.message}`, { severity: 'error', autoHideDuration: 3000 });
    }
  };





  const displayName = employee?.username ?? employeeId;
  const pageTitle = `Chỉnh sửa nhân viên ${displayName}`;



  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <PageContainer
        title="Lỗi tải nhân viên"
        breadcrumbs={[
          { title: 'Nhân viên', path: '/management/employees' },
          { title: `Nhân viên ${employeeId}`, path: `/management/employees/${employeeId}` },
          { title: 'Chỉnh sửa' },
        ]}
      >
        <Alert severity="error">Đã xảy ra lỗi khi tải dữ liệu nhân viên: {error.message}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Nhân viên', path: '/management/employees' },
        { title: `Nhân viên ${displayName}`, path: `/management/employees/${employeeId}` },
        { title: 'Chỉnh sửa' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1 }}>
        <EmployeeEditForm initialValues={employee} onSubmit={handleSubmit} />
      </Box>
    </PageContainer>
  );
}
export default EmployeeEdit;
