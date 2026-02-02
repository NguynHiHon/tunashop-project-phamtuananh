import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import useNotifications from '../../../../pages//Admin-Management/hooks/useNotifications/useNotifications';
import ProductForm from './ProductForm';
import PageContainer from '../PageContainer';
import { fetchProduct, updateProduct, clearCurrent } from '../../../../redux/clices/productSlice';

export default function ProductEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const product = useSelector(state => state.product.current);
  const loading = useSelector(state => state.product.loading);

  useEffect(() => {
    if (!id) {
      notifications.show('No product ID provided.', { severity: 'error' });
      navigate('/management/products');
      return;
    }

    let isMounted = true;
    // clear previous product so UI doesn't show stale data while loading new
    dispatch(clearCurrent());

    const load = async () => {
      try {
        await dispatch(fetchProduct(id)).unwrap();
      } catch (error) {
        console.error('Error fetching product:', error);
        if (!isMounted) return;
        notifications.show('Failed to fetch product.', { severity: 'error' });
        navigate('/management/products');
      }
    };

    load();

    return () => { isMounted = false; };
  }, [id, dispatch, navigate, notifications]);

  const handleUpdate = async (payload) => {
    try {
      await dispatch(updateProduct({ id, data: payload })).unwrap();
      notifications.show('Product updated successfully.', { severity: 'success', autoHideDuration: 3000 });
      navigate('/management/products');
    } catch (err) {
      const details = err?.details || err?.response?.data?.details;
      const message = err?.message || (typeof err === 'string' ? err : 'Failed to update product');
      if (Array.isArray(details) && details.length) {
        notifications.show(details.join('; '), { severity: 'error' });
      } else {
        notifications.show(`Failed to update product. ${message}`, { severity: 'error' });
      }
      // handled here, do not rethrow to avoid unhandled promise rejection
      return;
    }
  };

  return (
    <PageContainer title="Edit Product" breadcrumbs={[{ title: 'Products', path: '/management/products' }, { title: 'Edit' }]}>
      <ProductForm key={product?._id || id} initial={product || {}} onSubmit={handleUpdate} />
    </PageContainer>
  );
}
