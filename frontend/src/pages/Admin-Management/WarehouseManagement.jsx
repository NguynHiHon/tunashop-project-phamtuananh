import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    Switch,
    FormControlLabel,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Avatar,
    Slider,
    Divider,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
    Save,
    Refresh,
    Add,
    Delete,
    PersonAdd,
    SupportAgent,
    Store,
    Email,
    Phone,
    LocationOn,
    AccessTime,
} from '@mui/icons-material';
import warehouseService from '../../services/warehouseService';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`warehouse-tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const STRATEGY_OPTIONS = [
    { value: 'least-busy', label: 'Ít bận nhất', description: 'Phân công cho nhân viên đang xử lý ít chat nhất' },
    { value: 'round-robin', label: 'Luân phiên', description: 'Phân công theo thứ tự vòng tròn' },
    { value: 'priority', label: 'Ưu tiên', description: 'Phân công theo độ ưu tiên cao nhất' },
    { value: 'random', label: 'Ngẫu nhiên', description: 'Phân công ngẫu nhiên' },
];

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' },
];

const initialFormData = {
    name: '',
    email: '',
    phone: '',
    hotline: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    mapUrl: '',
    notes: '',
    chatAssignmentStrategy: 'least-busy',
    workingHours: {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '08:00', close: '17:00', isOpen: true },
        sunday: { open: '09:00', close: '12:00', isOpen: false },
    },
};

export default function WarehouseManagement() {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [supportStaff, setSupportStaff] = useState([]);
    const [availableStaff, setAvailableStaff] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [addStaffDialog, setAddStaffDialog] = useState(false);
    const [selectedStaffToAdd, setSelectedStaffToAdd] = useState('');
    const [newStaffOptions, setNewStaffOptions] = useState({
        isActive: true,
        priority: 0,
        maxConcurrentChats: 10,
    });

    // Fetch warehouse data
    const fetchWarehouse = useCallback(async () => {
        setLoading(true);
        try {
            const response = await warehouseService.getWarehouse();
            if (response.status === 'success' && response.data) {
                const data = response.data;
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    hotline: data.hotline || '',
                    address: data.address || '',
                    province: data.province || '',
                    district: data.district || '',
                    ward: data.ward || '',
                    mapUrl: data.mapUrl || '',
                    notes: data.notes || '',
                    chatAssignmentStrategy: data.chatAssignmentStrategy || 'least-busy',
                    workingHours: data.workingHours || initialFormData.workingHours,
                });
                setSupportStaff(data.supportStaff || []);
            }
        } catch (error) {
            console.error('Error fetching warehouse:', error);
            showSnackbar('Lỗi khi tải thông tin kho', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch available staff
    const fetchAvailableStaff = useCallback(async () => {
        try {
            const response = await warehouseService.getAvailableStaff();
            if (response.status === 'success') {
                setAvailableStaff(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching available staff:', error);
        }
    }, []);

    useEffect(() => {
        fetchWarehouse();
        fetchAvailableStaff();
    }, [fetchWarehouse, fetchAvailableStaff]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleWorkingHoursChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    [field]: value,
                },
            },
        }));
    };

    // Save warehouse info
    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await warehouseService.updateWarehouse(formData);
            if (response.status === 'success') {
                showSnackbar('Cập nhật thông tin kho thành công');
            }
        } catch (error) {
            console.error('Error saving warehouse:', error);
            showSnackbar('Lỗi khi lưu thông tin kho', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Add support staff
    const handleAddStaff = async () => {
        if (!selectedStaffToAdd) return;

        try {
            const response = await warehouseService.addSupportStaff(selectedStaffToAdd, newStaffOptions);
            if (response.status === 'success') {
                setSupportStaff(response.data.supportStaff || []);
                setAddStaffDialog(false);
                setSelectedStaffToAdd('');
                setNewStaffOptions({ isActive: true, priority: 0, maxConcurrentChats: 10 });
                fetchAvailableStaff();
                showSnackbar('Đã thêm nhân viên hỗ trợ');
            }
        } catch (error) {
            console.error('Error adding staff:', error);
            showSnackbar(error.response?.data?.message || 'Lỗi khi thêm nhân viên', 'error');
        }
    };

    // Remove support staff
    const handleRemoveStaff = async (userId) => {
        if (!window.confirm('Bạn có chắc muốn xóa nhân viên này khỏi danh sách hỗ trợ?')) return;

        try {
            const response = await warehouseService.removeSupportStaff(userId);
            if (response.status === 'success') {
                setSupportStaff(response.data.supportStaff || []);
                fetchAvailableStaff();
                showSnackbar('Đã xóa nhân viên khỏi danh sách');
            }
        } catch (error) {
            console.error('Error removing staff:', error);
            showSnackbar('Lỗi khi xóa nhân viên', 'error');
        }
    };

    // Toggle staff active status
    const handleToggleStaffActive = async (userId, currentStatus) => {
        try {
            const response = await warehouseService.updateStaffStatus(userId, { isActive: !currentStatus });
            if (response.status === 'success') {
                setSupportStaff(response.data.supportStaff || []);
                showSnackbar(`Đã ${!currentStatus ? 'bật' : 'tắt'} trạng thái làm việc`);
            }
        } catch (error) {
            console.error('Error toggling staff status:', error);
            showSnackbar('Lỗi khi cập nhật trạng thái', 'error');
        }
    };

    // Update chat strategy
    const handleStrategyChange = async (e) => {
        const strategy = e.target.value;
        setFormData(prev => ({ ...prev, chatAssignmentStrategy: strategy }));

        try {
            await warehouseService.updateChatStrategy(strategy);
            showSnackbar('Đã cập nhật chiến lược phân công');
        } catch (error) {
            console.error('Error updating strategy:', error);
            showSnackbar('Lỗi khi cập nhật chiến lược', 'error');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý kho
                </Typography>
                <Box>
                    <Button
                        startIcon={<Refresh />}
                        onClick={fetchWarehouse}
                        sx={{ mr: 1 }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<Store />} label="Thông tin kho" iconPosition="start" />
                    <Tab icon={<SupportAgent />} label="Nhân viên hỗ trợ" iconPosition="start" />
                    <Tab icon={<AccessTime />} label="Giờ làm việc" iconPosition="start" />
                </Tabs>

                {/* Tab 1: Thông tin kho */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tên kho"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <Store sx={{ mr: 1, color: 'text.secondary' }} /> }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Số điện thoại"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} /> }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Hotline"
                                name="hotline"
                                value={formData.hotline}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} /> }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Địa chỉ"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} /> }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Tỉnh/Thành phố"
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Quận/Huyện"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Phường/Xã"
                                name="ward"
                                value={formData.ward}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Google Maps URL"
                                name="mapUrl"
                                value={formData.mapUrl}
                                onChange={handleInputChange}
                                placeholder="https://www.google.com/maps/embed?..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Ghi chú nội bộ"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Tab 2: Nhân viên hỗ trợ */}
                <TabPanel value={tabValue} index={1}>
                    {/* Chat assignment strategy */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Chiến lược phân công chat
                        </Typography>
                        <FormControl sx={{ minWidth: 300 }}>
                            <InputLabel>Phương thức phân công</InputLabel>
                            <Select
                                value={formData.chatAssignmentStrategy}
                                onChange={handleStrategyChange}
                                label="Phương thức phân công"
                            >
                                {STRATEGY_OPTIONS.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Box>
                                            <Typography>{option.label}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.description}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Support staff list */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Danh sách nhân viên hỗ trợ ({supportStaff.length})
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => setAddStaffDialog(true)}
                            disabled={availableStaff.length === 0}
                        >
                            Thêm nhân viên
                        </Button>
                    </Box>

                    {supportStaff.length === 0 ? (
                        <Alert severity="info">
                            Chưa có nhân viên nào được phân công hỗ trợ chat. Thêm nhân viên để bắt đầu.
                        </Alert>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nhân viên</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Vai trò</TableCell>
                                        <TableCell align="center">Ưu tiên</TableCell>
                                        <TableCell align="center">Chat tối đa</TableCell>
                                        <TableCell align="center">Đang xử lý</TableCell>
                                        <TableCell align="center">Trạng thái</TableCell>
                                        <TableCell align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {supportStaff.map((staff) => (
                                        <TableRow key={staff._id || staff.userId?._id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                        {(staff.userId?.name || staff.userId?.username || '?')[0].toUpperCase()}
                                                    </Avatar>
                                                    <Typography>
                                                        {staff.userId?.name || staff.userId?.username || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{staff.userId?.email || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={staff.userId?.role === 'admin' ? 'Admin' : 'Nhân viên'}
                                                    color={staff.userId?.role === 'admin' ? 'error' : 'primary'}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{staff.priority || 0}</TableCell>
                                            <TableCell align="center">{staff.maxConcurrentChats || 10}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    label={staff.currentChatCount || 0}
                                                    color={staff.currentChatCount > 0 ? 'warning' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Switch
                                                    checked={staff.isActive}
                                                    onChange={() => handleToggleStaffActive(
                                                        staff.userId?._id || staff.userId,
                                                        staff.isActive
                                                    )}
                                                    color="success"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Xóa khỏi danh sách">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleRemoveStaff(staff.userId?._id || staff.userId)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                {/* Tab 3: Giờ làm việc */}
                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom>
                        Giờ làm việc của kho
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ngày</TableCell>
                                    <TableCell align="center">Mở cửa</TableCell>
                                    <TableCell align="center">Giờ mở</TableCell>
                                    <TableCell align="center">Giờ đóng</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {DAYS_OF_WEEK.map((day) => (
                                    <TableRow key={day.key}>
                                        <TableCell>
                                            <Typography fontWeight="medium">{day.label}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={formData.workingHours?.[day.key]?.isOpen ?? true}
                                                onChange={(e) => handleWorkingHoursChange(day.key, 'isOpen', e.target.checked)}
                                                color="success"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                type="time"
                                                size="small"
                                                value={formData.workingHours?.[day.key]?.open || '08:00'}
                                                onChange={(e) => handleWorkingHoursChange(day.key, 'open', e.target.value)}
                                                disabled={!formData.workingHours?.[day.key]?.isOpen}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                type="time"
                                                size="small"
                                                value={formData.workingHours?.[day.key]?.close || '18:00'}
                                                onChange={(e) => handleWorkingHoursChange(day.key, 'close', e.target.value)}
                                                disabled={!formData.workingHours?.[day.key]?.isOpen}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Paper>

            {/* Add Staff Dialog */}
            <Dialog open={addStaffDialog} onClose={() => setAddStaffDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Thêm nhân viên hỗ trợ chat</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Chọn nhân viên</InputLabel>
                            <Select
                                value={selectedStaffToAdd}
                                onChange={(e) => setSelectedStaffToAdd(e.target.value)}
                                label="Chọn nhân viên"
                            >
                                {availableStaff.map((user) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                                {(user.name || user.username)[0].toUpperCase()}
                                            </Avatar>
                                            <Typography>{user.name || user.username}</Typography>
                                            <Chip size="small" label={user.role} />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ mb: 3 }}>
                            <Typography gutterBottom>Độ ưu tiên: {newStaffOptions.priority}</Typography>
                            <Slider
                                value={newStaffOptions.priority}
                                onChange={(e, value) => setNewStaffOptions(prev => ({ ...prev, priority: value }))}
                                min={0}
                                max={10}
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography gutterBottom>Số chat tối đa cùng lúc: {newStaffOptions.maxConcurrentChats}</Typography>
                            <Slider
                                value={newStaffOptions.maxConcurrentChats}
                                onChange={(e, value) => setNewStaffOptions(prev => ({ ...prev, maxConcurrentChats: value }))}
                                min={1}
                                max={50}
                                marks={[{ value: 1 }, { value: 10 }, { value: 25 }, { value: 50 }]}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newStaffOptions.isActive}
                                    onChange={(e) => setNewStaffOptions(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                            }
                            label="Bắt đầu làm việc ngay"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddStaffDialog(false)}>Hủy</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddStaff}
                        disabled={!selectedStaffToAdd}
                    >
                        Thêm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
