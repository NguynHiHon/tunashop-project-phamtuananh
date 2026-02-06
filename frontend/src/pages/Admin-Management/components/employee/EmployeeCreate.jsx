import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import userService from '../../../../services/userService';
import { validateEmployee } from './validation';

import EmployeeForm from './EmployeeForm';
import PageContainer from '../PageContainer';

const INITIAL_FORM_VALUES = {
  username: '',
  password: '',
  passwordConfirm: '',
  email: '',
  phone: '',
  name: '',
  role: 'user',
  _isEdit: false,
};

export default function EmployeeCreate() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues) => {
    setFormState((previousState) => ({
      ...previousState,
      values: newFormValues,
    }));
  }, []);

  const setFormErrors = React.useCallback((newFormErrors) => {
    setFormState((previousState) => ({
      ...previousState,
      errors: newFormErrors,
    }));
  }, []);

  const handleFormFieldChange = React.useCallback(
    (name, value) => {
      const validateField = async (values) => {
        const { issues } = validateEmployee(values);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateEmployee(formValues, { requirePassword: true });
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      const res = await userService.createUser(formValues);
      const successMsg = res?.message || 'Tạo nhân viên thành công.';
      notifications.show(successMsg, {
        severity: 'success',
        autoHideDuration: 3000,
      });

      // redirect to management employees list
      navigate('/management/employees');
    } catch (createError) {
      const serverMsg = createError?.response?.data?.message || createError.message || 'Failed to create employee';

      // Map server error codes to user-friendly messages and field-level errors
      const fieldErrors = {};
      switch (serverMsg) {
        case 'INVALID_INPUT':
          notifications.show('Thiếu thông tin cần thiết.', { severity: 'error', autoHideDuration: 4000 });
          break;
        case 'PASSWORD_MISMATCH':
          fieldErrors.passwordConfirm = 'Mật khẩu xác nhận không khớp.';
          notifications.show('Mật khẩu xác nhận không khớp.', { severity: 'error', autoHideDuration: 4000 });
          break;
        case 'INVALID_EMAIL':
          fieldErrors.email = 'Email không hợp lệ.';
          notifications.show('Email không hợp lệ.', { severity: 'error', autoHideDuration: 4000 });
          break;
        case 'INVALID_PHONE':
          fieldErrors.phone = 'Số điện thoại không hợp lệ.';
          notifications.show('Số điện thoại không hợp lệ.', { severity: 'error', autoHideDuration: 4000 });
          break;
        case 'WEAK_PASSWORD':
          fieldErrors.password = 'Mật khẩu quá yếu (ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số).';
          notifications.show(fieldErrors.password, { severity: 'error', autoHideDuration: 5000 });
          break;
        case 'INVALID_ROLE':
          fieldErrors.role = 'Vai trò không hợp lệ.';
          notifications.show('Vai trò không hợp lệ.', { severity: 'error', autoHideDuration: 4000 });
          break;
        case 'USER_EXISTS':
        case 'USERNAME_EXISTS':
          fieldErrors.username = 'Tên đăng nhập hoặc email đã tồn tại.';
          notifications.show('Người dùng đã tồn tại.', { severity: 'error', autoHideDuration: 4000 });
          break;
        case 'EMAIL_EXISTS':
          fieldErrors.email = 'Email đã được sử dụng.';
          notifications.show('Email đã được sử dụng.', { severity: 'error', autoHideDuration: 4000 });
          break;
        default:
          // Use server message if it's readable, otherwise generic
          notifications.show(serverMsg, { severity: 'error', autoHideDuration: 4000 });
      }

      // set field-level errors if any
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors({ ...formErrors, ...fieldErrors });
      }

      // keep the error for upstream if needed but don't rethrow to avoid unhandled promise
      return;
    }
  }, [formValues, formErrors, navigate, notifications, setFormErrors]);

  return (
    <PageContainer
      title="Thêm nhân viên mới"
      breadcrumbs={[{ title: 'Nhân viên', path: '/management/employees' }, { title: 'Thêm mới' }]}
    >
      <EmployeeForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Create"
      />
    </PageContainer>
  );
}
