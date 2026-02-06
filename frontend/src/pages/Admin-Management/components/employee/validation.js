const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-() ]{7,20}$/;

export function validateEmployee(values = {}, opts = { requirePassword: true }) {
    const issues = [];
    if (!values.username || !String(values.username).trim()) {
        issues.push({ path: ['username'], message: 'Tên đăng nhập là bắt buộc' });
    }
    if (!values.email || !EMAIL_REGEX.test(values.email)) {
        issues.push({ path: ['email'], message: 'Vui lòng nhập Email hợp lệ' });
    }
    if (values.phone && !PHONE_REGEX.test(values.phone)) {
        issues.push({ path: ['phone'], message: 'Số điện thoại không hợp lệ' });
    }
    if (opts.requirePassword) {
        if (!values.password || values.password.length < 8) {
            issues.push({ path: ['password'], message: 'Mật khẩu phải có ít nhất 8 ký tự' });
        }
        if (!values.passwordConfirm || values.password !== values.passwordConfirm) {
            issues.push({ path: ['passwordConfirm'], message: 'Mật khẩu xác nhận không khớp' });
        }
    } else {
        if (values.password && values.password.length < 8) {
            issues.push({ path: ['password'], message: 'Mật khẩu phải có ít nhất 8 ký tự' });
        }
        if (values.password && values.passwordConfirm && values.password !== values.passwordConfirm) {
            issues.push({ path: ['passwordConfirm'], message: 'Mật khẩu xác nhận không khớp' });
        }
    }
    return { issues };
}
