
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
import MainLayout from './components/Home/MainLayout'
import NotificationsProvider from './pages/Admin-Management/hooks/useNotifications/NotificationsProvider'

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
            {/* Admin Management Routes (no header/footer) */}
            <Route path='/management' element={<CrudDashboard />}>
              <Route index element={<DashboardPage />} />
              <Route path='employees' element={<EmployeeList />} />
              <Route path='employees/new' element={<EmployeeCreate />} />
              <Route path='employees/:employeeId' element={<EmployeeShow />} />
              <Route path='employees/:employeeId/edit' element={<EmployeeEdit />} />

              {/* category  */}
              <Route path='categories' element={<CategoryList />} />
              {/* products */}
              <Route path='products' element={<ProductList />} />
              <Route path='products/create' element={<ProductCreate />} />
              <Route path='products/:id/edit' element={<ProductEdit />} />

              {/* sales / events */}
              <Route path='activities/events' element={<SaleManager />} />
              {/* sales report */}
              <Route path='sales' element={<SalesReportPage />} />
              {/* orders */}
              <Route path='orders' element={<OrderManagement />} />
              {/* articles */}
              <Route path='articles' element={<ArticleManagement />} />
              {/* warehouse */}
              <Route path='warehouse' element={<WarehouseManagement />} />
              {/* support chat */}
              <Route path='support-chat' element={<SupportChatManagement />} />
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
            </Route>

            {/* Auth Routes (no header/footer) */}
            <Route path='/signup' element={<SignUpPage />} />
            <Route path='/signin' element={<SignInPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/chat' element={<ChatAppPages />} />
          </Routes>
        </Router>
      </NotificationsProvider>
    </>
  )
}

export default App
