import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    CircularProgress,
} from '@mui/material';
import contactService from '../../services/contactService';

export default function ContactRequests() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const contactTypeLabel = (type) => {
        switch (type) {
            case 'return':
                return { label: 'Hoàn hàng', color: 'warning' };
            case 'warranty':
                return { label: 'Bảo hành', color: 'info' };
            default:
                return { label: 'Tư vấn', color: 'default' };
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            const res = await contactService.list({ limit: 200 });
            setItems(res.data.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const markHandled = async (id) => {
        try {
            await contactService.update(id, { status: 'handled' });
            load();
        } catch (err) { console.error(err); }
    };

    const remove = async (id) => {
        if (!window.confirm('Xoá liên hệ này?')) return;
        try { await contactService.remove(id); load(); } catch (err) { console.error(err); }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Yêu cầu liên hệ</Typography>
            <Card>
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Thời gian</TableCell>
                                    <TableCell>Người gửi</TableCell>
                                    <TableCell>Loại liên hệ</TableCell>
                                    <TableCell>Thông tin</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <CircularProgress size={22} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((m) => {
                                        const type = contactTypeLabel(m.contactType);
                                        return (
                                            <TableRow key={m._id} hover>
                                                <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <strong>{m.name}</strong>
                                                    <div>{m.email}</div>
                                                    <div>{m.phone}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={type.label} color={type.color} size="small" />
                                                </TableCell>
                                                <TableCell style={{ maxWidth: 420 }}>
                                                    <div><strong>{m.subject || '(không đề)'}</strong></div>
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={m.status} color={m.status === 'new' ? 'warning' : m.status === 'handled' ? 'success' : 'info'} />
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="small" onClick={() => markHandled(m._id)}>Đánh dấu đã xử lý</Button>
                                                    <Button size="small" color="error" onClick={() => remove(m._id)}>Xóa</Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                                {!loading && items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Không có yêu cầu</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}
