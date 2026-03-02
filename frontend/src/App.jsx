
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useSelector, useDispatch } from 'react-redux'
import { setupJwtInterceptors } from './config/axiosJWT'
import { store } from './redux/store'
import socketService from './services/socketService'
import CrudDashboard from './pages//Admin-Management/CrudDashboard'
import DashboardLayout from './pages//Admin-Management/components/DashboardLayout'
import EmployeeList from './pages//Admin-Management/components/employee/EmployeeList'
import EmployeeShow from './pages//Admin-Management/components/employee/EmployeeShow'
import EmployeeCreate from './pages//Admin-Management/components/employee/EmployeeCreate'
import EmployeeEdit from './pages//Admin-Management/components/employee/EmployeeEdit'
import CategoryList from './pages//Admin-Management/components/CategoryList'
import ProductList from './pages//Admin-Management/components/product/ProductList'
import ProductCreate from './pages//Admin-Management/components/product/ProductCreate'
import ProductEdit from './pages//Admin-Management/components/product/ProductEdit'
import SaleManager from './pages//Admin-Management/components/events/SaleManager'
import {
  addOnlineUser,
  removeOnlineUser,
  updateConversation,
  addMessage,
} from './redux/clices/chatSlice'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import ProfilePage from './pages/ProfilePage'
import ChatAppPages from './pages/ChatAppPages'
import HomePage from './pages/HomePage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import FranchisePage from './pages/FranchisePage'
import AboutPage from './pages/AboutPage'
import GuidePage from './pages/GuidePage'
import PaymentGuidePage from './pages/guide/PaymentGuidePage'
import OrderingGuidePage from './pages/guide/OrderingGuidePage'
import RacketSelectionGuidePage from './pages/guide/RacketSelectionGuidePage'
import SaleOffPage from './pages/SaleOffPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import ArticleListPage from './pages/ArticleListPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import OrderManagement from './pages/Admin-Management/OrderManagement'
import DashboardPage from './pages/Admin-Management/DashboardPage'
import ArticleManagement from './pages/Admin-Management/ArticleManagement'
import SalesReportPage from './pages/Admin-Management/SalesReportPage'
import WarehouseManagement from './pages/Admin-Management/WarehouseManagement'
import SupportChatManagement from './pages/Admin-Management/SupportChatManagement'
import ContactRequests from './pages/Admin-Management/ContactRequests'
import Accounts from './pages/Admin-Management/Accounts'
import MainLayout from './components/Home/MainLayout'
import NotificationsProvider from './pages/Admin-Management/hooks/useNotifications/NotificationsProvider'
import ContactPage from './pages/ContactPage'
import VNPayReturnPage from './pages/VNPayReturnPage'
import ProtectedRoute, { AdminRoute, StaffRoute, AuthRoute, GuestRoute } from './components/ProtectedRoute'

// Setup axios interceptors once
setupJwtInterceptors(store)

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { accessToken } = useSelector((state) => state.token)

  // Connect socket và setup GLOBAL listeners khi user login
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketService.connect(accessToken)

      // Setup GLOBAL socket listeners
      socketService.onUserOnline((data) => {
        dispatch(addOnlineUser(data.userId))
      })

      socketService.onUserOffline((data) => {
        dispatch(removeOnlineUser(data.userId))
      })

      socketService.onConversationUpdated((data) => {
        dispatch(updateConversation(data.conversation))
      })

      // Nhận tin nhắn mới (GLOBAL)
      socketService.onReceiveMessage((data) => {
        dispatch(addMessage(data.message))
        if (data.conversation) {
          dispatch(updateConversation(data.conversation))
        }
      })

      socketService.onError((error) => {
        console.error('Socket error:', error)
      })
    }

    // Cleanup khi unmount hoặc logout
    return () => {
      if (!isAuthenticated) {
        socketService.offUserOnline()
        socketService.offUserOffline()
        socketService.offConversationUpdated()
        socketService.offReceiveMessage()
        socketService.offError()
        socketService.disconnect()
      }
    }
  }, [isAuthenticated, accessToken, dispatch])

  return (
    <>
      <Toaster position='top-right' richColors />
      <NotificationsProvider>
        <Router>
          <Routes>
            {/* Admin Management Routes - Protected by role */}
            <Route
              path='/management'
              element={
                <StaffRoute redirectTo='/'>
                  <CrudDashboard />
                </StaffRoute>
              }
            >
              {/* Dashboard - Admin & Staff */}
              <Route index element={<DashboardPage />} />

              {/* Orders & Support Chat - Admin & Staff can access */}
              <Route path='orders' element={<OrderManagement />} />
              <Route path='support-chat' element={<SupportChatManagement />} />

              {/* Admin only routes */}
              <Route
                path='employees'
                element={
                  <AdminRoute redirectTo='/management'>
                    <EmployeeList />
                  </AdminRoute>
                }
              />
              <Route
                path='accounts'
                element={
                  <AdminRoute redirectTo='/management'>
                    <Accounts />
                  </AdminRoute>
                }
              />
              <Route
                path='employees/new'
                element={
                  <AdminRoute redirectTo='/management'>
                    <EmployeeCreate />
                  </AdminRoute>
                }
              />
              <Route
                path='employees/:employeeId'
                element={
                  <AdminRoute redirectTo='/management'>
                    <EmployeeShow />
                  </AdminRoute>
                }
              />
              <Route
                path='employees/:employeeId/edit'
                element={
                  <AdminRoute redirectTo='/management'>
                    <EmployeeEdit />
                  </AdminRoute>
                }
              />

              {/* Categories - Admin only */}
              <Route
                path='categories'
                element={
                  <AdminRoute redirectTo='/management'>
                    <CategoryList />
                  </AdminRoute>
                }
              />

              {/* Products - Admin only */}
              <Route
                path='products'
                element={
                  <AdminRoute redirectTo='/management'>
                    <ProductList />
                  </AdminRoute>
                }
              />
              <Route
                path='products/create'
                element={
                  <AdminRoute redirectTo='/management'>
                    <ProductCreate />
                  </AdminRoute>
                }
              />
              <Route
                path='products/:id/edit'
                element={
                  <AdminRoute redirectTo='/management'>
                    <ProductEdit />
                  </AdminRoute>
                }
              />

              {/* Sales & Events - Admin only */}
              <Route
                path='activities/events'
                element={
                  <AdminRoute redirectTo='/management'>
                    <SaleManager />
                  </AdminRoute>
                }
              />

              {/* Sales Report - Admin only */}
              <Route
                path='sales'
                element={
                  <AdminRoute redirectTo='/management'>
                    <SalesReportPage />
                  </AdminRoute>
                }
              />

              {/* Articles - Admin only */}
              <Route
                path='articles'
                element={
                  <AdminRoute redirectTo='/management'>
                    <ArticleManagement />
                  </AdminRoute>
                }
              />

              {/* Contacts (public contact form submissions) - Admin only */}
              <Route
                path='contacts'
                element={
                  <AdminRoute redirectTo='/management'>
                    <ContactRequests />
                  </AdminRoute>
                }
              />

              {/* Warehouse - Admin only */}
              <Route
                path='warehouse'
                element={
                  <AdminRoute redirectTo='/management'>
                    <WarehouseManagement />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Public Routes with Header/Footer */}
            <Route path='/' element={<MainLayout />}>
              <Route path='' element={<HomePage />} />
              <Route path='products' element={<ProductListPage />} />
              <Route path='products/:id' element={<ProductDetailPage />} />
              <Route path='sale' element={<SaleOffPage />} />
              <Route path='franchise' element={<FranchisePage />} />
              <Route path='about' element={<AboutPage />} />
              <Route path='guide' element={<GuidePage />} />
              <Route path='guide/payment' element={<PaymentGuidePage />} />
              <Route path='guide/ordering' element={<OrderingGuidePage />} />
              <Route path='guide/racket-selection' element={<RacketSelectionGuidePage />} />
              <Route path='cart' element={<CartPage />} />
              <Route path='checkout' element={<CheckoutPage />} />
              <Route path='orders' element={<OrderHistoryPage />} />
              <Route path='news' element={<ArticleListPage />} />
              <Route path='news/:slug' element={<ArticleDetailPage />} />
              <Route path='contact' element={<ContactPage />} />
            </Route>

            {/* VNPay Return - standalone page (no header/footer) */}
            <Route path='/vnpay-return' element={<VNPayReturnPage />} />

            {/* Auth Routes (no header/footer) */}
            <Route
              path='/signup'
              element={
                <GuestRoute redirectTo='/'>
                  <SignUpPage />
                </GuestRoute>
              }
            />
            <Route
              path='/signin'
              element={
                <GuestRoute redirectTo='/'>
                  <SignInPage />
                </GuestRoute>
              }
            />
            <Route
              path='/profile'
              element={
                <AuthRoute>
                  <ProfilePage />
                </AuthRoute>
              }
            />
            <Route
              path='/chat'
              element={
                <AuthRoute>
                  <ChatAppPages />
                </AuthRoute>
              }
            />
          </Routes>
        </Router>
      </NotificationsProvider>
    </>
  )
}

export default App
