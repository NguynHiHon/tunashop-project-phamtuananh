import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { signUpUser, googleSignIn } from '../services/authService'
import { GoogleLogin } from '@react-oauth/google'
import useNotifications from '../pages/Admin-Management/hooks/useNotifications/useNotifications'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  Divider,
} from '@mui/material'

const SignUpPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { register: registerState } = useSelector((state) => state.auth)
  const { isFetching: googleFetching } = useSelector((state) => state.googleAuth)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  const notifications = useNotifications()

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Mật khẩu không khớp' })
      return
    }
    try {
      const res = await signUpUser({ username: data.username, password: data.password, email: data.email }, dispatch, navigate)
      // Show server success message if present
      const message = res?.message || 'Đăng ký thành công'
      notifications.show(message, { severity: 'success', autoHideDuration: 3000 })
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Đăng ký thất bại'
      notifications.show(msg, { severity: 'error', autoHideDuration: 5000 })
      console.error('Sign up error:', e)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Đăng ký
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tạo tài khoản mới
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                type="text"
                fullWidth
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
                {...register('username', { required: 'Username là bắt buộc' })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register('password', { required: 'Password là bắt buộc' })}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email', { required: 'Email là bắt buộc' })}
              />

              <TextField
                label="Confirm password"
                type="password"
                fullWidth
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
                {...register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu' })}
              />

              {registerState.error && <Alert severity="error">Đăng ký thất bại</Alert>}

              <Button type="submit" variant="contained" disabled={registerState.isFetching || googleFetching}>
                {registerState.isFetching ? 'Đang xử lý...' : 'Đăng ký'}
              </Button>

              <Divider sx={{ my: 1 }}>hoặc</Divider>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      await googleSignIn(credentialResponse.credential, dispatch, navigate)
                      notifications.show('Đăng ký bằng Google thành công', { severity: 'success', autoHideDuration: 3000 })
                    } catch (e) {
                      const msg = e?.response?.data?.message || 'Đăng ký Google thất bại'
                      notifications.show(msg, { severity: 'error', autoHideDuration: 5000 })
                    }
                  }}
                  onError={() => {
                    notifications.show('Đăng ký Google thất bại', { severity: 'error', autoHideDuration: 5000 })
                  }}
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </Box>
            </Stack>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Đã có tài khoản?{' '}
            <Link to="/signin">Đăng nhập</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SignUpPage