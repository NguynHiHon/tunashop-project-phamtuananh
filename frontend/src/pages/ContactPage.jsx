import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Divider,
    Paper,
    Alert,
    Snackbar,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    YouTube as YouTubeIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import warehouseService from '../services/warehouseService';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [warehouse, setWarehouse] = useState(null);
    const [loadingWarehouse, setLoadingWarehouse] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
            };
            const res = await (await import('../services/contactService')).default.send(payload);
            setLoading(false);
            setSuccess(true);
            toast.success('Gửi tin nhắn thành công! Nhân viên sẽ liên hệ lại sớm.');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            setLoading(false);
            toast.error(err?.response?.data?.message || err?.message || 'Gửi tin thất bại');
        }
    };

    // Build contact info from warehouse data (fallback to defaults)
    const contactInfo = (() => {
        const addrLines = [];
        if (warehouse?.address) addrLines.push(warehouse.address);
        if (warehouse?.province || warehouse?.district) addrLines.push([warehouse.province, warehouse.district, warehouse.ward].filter(Boolean).join(' , '));
        const phones = [];
        if (warehouse?.hotline) phones.push(`Hotline: ${warehouse.hotline}`);
        if (warehouse?.phone) phones.push(`Di động: ${warehouse.phone}`);
        const emails = warehouse?.email ? [warehouse.email] : ['info@tunashop.vn'];
        const hours = [];
        if (warehouse?.workingHours) {
            const wh = warehouse.workingHours;
            // show a compact summary
            hours.push(`Thứ 2 - Thứ 7: ${wh.monday?.open || '08:00'} - ${wh.monday?.close || '18:00'}`);
            hours.push(`Chủ nhật: ${wh.sunday?.open || '09:00'} - ${wh.sunday?.close || '12:00'}`);
        } else {
            hours.push('Thứ 2 - Thứ 7: 8:00 - 21:00');
            hours.push('Chủ nhật: 9:00 - 18:00');
        }

        return [
            { icon: <LocationIcon sx={{ fontSize: 40, color: '#f26522' }} />, title: 'Địa chỉ', details: addrLines.length ? addrLines : ['123 Đường ABC, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'] },
            { icon: <PhoneIcon sx={{ fontSize: 40, color: '#f26522' }} />, title: 'Điện thoại', details: phones.length ? phones : ['Hotline: 1900 1234', 'Di động: 0909 123 456'] },
            { icon: <EmailIcon sx={{ fontSize: 40, color: '#f26522' }} />, title: 'Email', details: emails },
            { icon: <TimeIcon sx={{ fontSize: 40, color: '#f26522' }} />, title: 'Giờ làm việc', details: hours },
        ];
    })();

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingWarehouse(true);
                const res = await warehouseService.getWarehouse();
                if (!mounted) return;
                if (res && res.status === 'success') setWarehouse(res.data || null);
            } catch (err) {
                console.error('Failed to load warehouse for contact page', err);
            } finally {
                if (mounted) setLoadingWarehouse(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#f26522', mb: 2 }}>
                    LIÊN HỆ VỚI CHÚNG TÔI
                </Typography>
                <Typography variant="h6" sx={{ color: '#666', maxWidth: '800px', mx: 'auto' }}>
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ ngay!
                </Typography>
            </Box>

            {/* Contact Info Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                {contactInfo.map((info, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                textAlign: 'center',
                                p: 2,
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 10px 30px rgba(242, 101, 34, 0.2)',
                                },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ mb: 2 }}>{info.icon}</Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    {info.title}
                                </Typography>
                                {info.details.map((detail, i) => (
                                    <Typography key={i} variant="body2" color="text.secondary">
                                        {detail}
                                    </Typography>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Contact Form and Map */}
            <Grid container spacing={4}>
                {/* Contact Form */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                            GỬI TIN NHẮN CHO CHÚNG TÔI
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Họ và tên *"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email *"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Số điện thoại"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Tiêu đề"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Nội dung tin nhắn *"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        variant="outlined"
                                        multiline
                                        rows={5}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={loading}
                                        startIcon={<SendIcon />}
                                        sx={{
                                            bgcolor: '#f26522',
                                            py: 1.5,
                                            '&:hover': {
                                                bgcolor: '#d55419',
                                            },
                                        }}
                                    >
                                        {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Card>
                </Grid>

                {/* Map & Social */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                            VỊ TRÍ CỦA CHÚNG TÔI
                        </Typography>

                        {/* Google Maps Embed (use warehouse.mapUrl when available) */}
                        <Box
                            sx={{
                                width: '100%',
                                height: 300,
                                mb: 3,
                                bgcolor: '#e0e0e0',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <iframe
                                src={warehouse?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197773!2d106.69765937486095!3d10.778789089387898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d8d1bb3%3A0xd5e9e3e9a7f2cf27!2zQuG6v24gTmdo4buJIEdpYW8gVGjDtG5nIFPDoGkgR8Oybg!5e0!3m2!1svi!2s!4v1702000000000!5m2!1svi!2s"}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="TunaShop Location"
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Social Media */}
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Kết nối với chúng tôi
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {warehouse?.social?.facebook ? (
                                <Button
                                    component="a"
                                    href={warehouse.social.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outlined"
                                    startIcon={<FacebookIcon />}
                                    sx={{ borderColor: '#1877f2', color: '#1877f2' }}
                                >
                                    Facebook
                                </Button>
                            ) : null}

                            {warehouse?.social?.instagram ? (
                                <Button
                                    component="a"
                                    href={warehouse.social.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outlined"
                                    startIcon={<InstagramIcon />}
                                    sx={{ borderColor: '#e4405f', color: '#e4405f' }}
                                >
                                    Instagram
                                </Button>
                            ) : null}

                            {warehouse?.social?.youtube ? (
                                <Button
                                    component="a"
                                    href={warehouse.social.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outlined"
                                    startIcon={<YouTubeIcon />}
                                    sx={{ borderColor: '#ff0000', color: '#ff0000' }}
                                >
                                    YouTube
                                </Button>
                            ) : null}
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* FAQ Section */}
            <Card sx={{ mt: 5, p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f26522' }}>
                    CÂU HỎI THƯỜNG GẶP
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Có thể đổi trả sản phẩm trong bao lâu?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên tem mác và chưa qua sử dụng.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Thời gian giao hàng là bao lâu?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Đơn hàng nội thành được giao trong 1-2 ngày, các tỉnh khác trong 3-5 ngày làm việc.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Có hỗ trợ bảo hành sản phẩm không?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tất cả sản phẩm đều được bảo hành chính hãng. Thời gian bảo hành tùy thuộc vào từng loại sản phẩm.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Có thể thanh toán bằng những hình thức nào?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Chúng tôi chấp nhận thanh toán COD, chuyển khoản ngân hàng, và các ví điện tử phổ biến.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Card>
        </Container>
    );
};

export default ContactPage;
