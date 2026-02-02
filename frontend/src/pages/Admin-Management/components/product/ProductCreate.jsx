import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useNotifications from '../../../../pages//Admin-Management/hooks/useNotifications/useNotifications';
import ProductForm from './ProductForm';
import PageContainer from '../PageContainer';
import { createProduct } from '../../../../redux/clices/productSlice';

export default function ProductCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const handleCreate = async (payload) => {
    try {
      await dispatch(createProduct(payload)).unwrap();
      notifications.show('Tạo sản phẩm thành công.', { severity: 'success', autoHideDuration: 3000 });
      navigate('/management/products');
    } catch (err) {
      const details = err?.details || err?.response?.data?.details;
      const message = err?.message || (typeof err === 'string' ? err : 'Tạo sản phẩm thất bại');
      if (Array.isArray(details) && details.length) {
        notifications.show(details.join('; '), { severity: 'error' });
      } else {
        notifications.show(`Tạo sản phẩm thất bại. ${message}`, { severity: 'error' });
      }
      // handled here, do not rethrow to avoid unhandled promise rejection
      return;
    }
  };

  return (
    <PageContainer title="New Product" breadcrumbs={[{ title: 'Products', path: '/management/products' }, { title: 'New' }]}>
      <ProductForm onSubmit={handleCreate} />
    </PageContainer>
  );
}
