
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useSelector, useDispatch } from 'react-redux'
import { setupJwtInterceptors } from './config/axiosJWT'
import { store } from './redux/store'
import socketService from './services/socketService'
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
      <Toaster position='top-right' richColors/>
      <Router>
        <Routes>
          <Route path='/signup' element={<SignUpPage/>}/>
          <Route path='/signin' element={<SignInPage/>}/>
          <Route path='/profile' element={<ProfilePage/>}/>
          <Route path='/chat' element={<ChatAppPages/>}/>
          <Route path='/' element={<ProfilePage/>}/>
        </Routes>
      </Router> 
    </>
  )
}

export default App
