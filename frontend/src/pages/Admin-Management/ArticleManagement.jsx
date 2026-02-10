import React, { useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
    CircularProgress,
    Alert,
    Tooltip,
    Switch,
    FormControlLabel,
    Card,
    CardMedia,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
    Add,
    Edit,
    Delete,
    Visibility,
    Publish,
    Archive,
    Refresh,
    FilterList,
    Image as ImageIcon,
    YouTube,
} from '@mui/icons-material';
import * as articleService from '../../services/articleService';
import { uploadFileToCloudinary } from '../../services/cloudinaryService';

const CATEGORY_CONFIG = {
    'tin-tuc': { label: 'Tin tức', color: 'error' },
    'review': { label: 'Review', color: 'warning' },
    'meo-hay': { label: 'Mẹo hay', color: 'success' },
    'kien-thuc': { label: 'Kiến thức', color: 'info' },
};

const STATUS_CONFIG = {
    draft: { label: 'Bản nháp', color: 'default' },
    published: { label: 'Đã đăng', color: 'success' },
    archived: { label: 'Lưu trữ', color: 'error' },
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Extract YouTube video ID from URL
const getYoutubeVideoId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
};

const initialFormData = {
    title: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    videoUrl: '',
    category: 'tin-tuc',
    tags: '',
    featured: false,
    status: 'draft',
};

// Quill editor modules config
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
    ],
};

const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
];

const ArticleManagement = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Dialog states
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [formLoading, setFormLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);

    // Preview dialog
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewArticle, setPreviewArticle] = useState(null);

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

    const loadArticles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page: page + 1,
                limit: rowsPerPage,
            };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (categoryFilter !== 'all') params.category = categoryFilter;

            const response = await articleService.getAllArticles(params);
            setArticles(response.data);
            setTotal(response.total);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, statusFilter, categoryFilter]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const handleOpenForm = (article = null) => {
        if (article) {
            setEditingId(article._id);
            setFormData({
                title: article.title,
                excerpt: article.excerpt,
                content: article.content,
                thumbnail: article.thumbnail,
                videoUrl: article.videoUrl || '',
                category: article.category,
                tags: article.tags?.join(', ') || '',
                featured: article.featured,
                status: article.status,
            });
        } else {
            setEditingId(null);
            setFormData(initialFormData);
        }
        setFormErrors({});
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingId(null);
        setFormData(initialFormData);
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const response = await uploadFileToCloudinary(file, 'articles');
            setFormData(prev => ({ ...prev, thumbnail: response.secure_url || response.url }));
        } catch {
            setFormErrors(prev => ({ ...prev, thumbnail: 'Không thể upload ảnh' }));
        } finally {
            setUploadingImage(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Vui lòng nhập tiêu đề';
        if (!formData.excerpt.trim()) errors.excerpt = 'Vui lòng nhập mô tả ngắn';
        // Check if content is empty (Quill might return <p><br></p> for empty content)
        const strippedContent = formData.content.replace(/<(.|\n)*?>/g, '').trim();
        if (!strippedContent) errors.content = 'Vui lòng nhập nội dung';
        if (!formData.thumbnail) errors.thumbnail = 'Vui lòng chọn ảnh đại diện';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setFormLoading(true);
            const submitData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            };

            if (editingId) {
                await articleService.updateArticle(editingId, submitData);
            } else {
                await articleService.createArticle(submitData);
            }

            handleCloseForm();
            loadArticles();
        } catch (err) {
            setFormErrors(prev => ({ ...prev, submit: err.response?.data?.message || 'Có lỗi xảy ra' }));
        } finally {
            setFormLoading(false);
        }
    };

    const handlePublish = async (id) => {
        try {
            await articleService.publishArticle(id);
            loadArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể đăng bài viết');
        }
    };

    const handleArchive = async (id) => {
        try {
            await articleService.archiveArticle(id);
            loadArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu trữ bài viết');
        }
    };

    const handleDelete = async () => {
        try {
            await articleService.deleteArticle(deleteDialog.id);
            setDeleteDialog({ open: false, id: null });
            loadArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa bài viết');
        }
    };

    const handlePreview = async (article) => {
        try {
            const response = await articleService.getArticleById(article._id);
            setPreviewArticle(response.data);
            setPreviewOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải bài viết');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý bài viết
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenForm()}
                >
                    Thêm bài viết
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterList color="action" />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Trạng thái"
                    >
                        <MenuItem value="all">Tất cả</MenuItem>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <MenuItem key={key} value={key}>{config.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        label="Danh mục"
                    >
                        <MenuItem value="all">Tất cả</MenuItem>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                            <MenuItem key={key} value={key}>{config.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button startIcon={<Refresh />} onClick={loadArticles} disabled={loading}>
                    Làm mới
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                    Tổng: {total} bài viết
                </Typography>
            </Paper>

            {/* Articles Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Ảnh</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tiêu đề</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Danh mục</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lượt xem</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : articles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">Chưa có bài viết nào</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            articles.map((article) => (
                                <TableRow key={article._id} hover>
                                    <TableCell>
                                        <Avatar
                                            src={article.thumbnail}
                                            variant="rounded"
                                            sx={{ width: 60, height: 40 }}
                                        >
                                            <ImageIcon />
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="500" noWrap sx={{ maxWidth: 300 }}>
                                            {article.title}
                                        </Typography>
                                        {article.featured && (
                                            <Chip label="Nổi bật" size="small" color="warning" sx={{ ml: 1 }} />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={CATEGORY_CONFIG[article.category]?.label}
                                            color={CATEGORY_CONFIG[article.category]?.color}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={STATUS_CONFIG[article.status]?.label}
                                            color={STATUS_CONFIG[article.status]?.color}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{article.viewCount || 0}</TableCell>
                                    <TableCell>{formatDate(article.createdAt)}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                            <Tooltip title="Xem">
                                                <IconButton size="small" onClick={() => handlePreview(article)}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sửa">
                                                <IconButton size="small" onClick={() => handleOpenForm(article)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {article.status === 'draft' && (
                                                <Tooltip title="Đăng bài">
                                                    <IconButton size="small" color="success" onClick={() => handlePublish(article._id)}>
                                                        <Publish fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {article.status === 'published' && (
                                                <Tooltip title="Lưu trữ">
                                                    <IconButton size="small" color="warning" onClick={() => handleArchive(article._id)}>
                                                        <Archive fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {article.status === 'archived' && (
                                                <Tooltip title="Đăng lại">
                                                    <IconButton size="small" color="success" onClick={() => handlePublish(article._id)}>
                                                        <Publish fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Xóa">
                                                <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: article._id })}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                labelRowsPerPage="Số dòng"
            />

            {/* Create/Edit Dialog */}
            <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
                <DialogTitle>{editingId ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</DialogTitle>
                <DialogContent>
                    {formErrors.submit && (
                        <Alert severity="error" sx={{ mb: 2 }}>{formErrors.submit}</Alert>
                    )}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                name="title"
                                label="Tiêu đề *"
                                fullWidth
                                value={formData.title}
                                onChange={handleInputChange}
                                error={!!formErrors.title}
                                helperText={formErrors.title}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    label="Danh mục"
                                >
                                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                        <MenuItem key={key} value={key}>{config.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="tags"
                                label="Tags (phân cách bằng dấu phẩy)"
                                fullWidth
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="tin tức, badminton, sale"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="excerpt"
                                label="Mô tả ngắn *"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                error={!!formErrors.excerpt}
                                helperText={formErrors.excerpt || 'Tối đa 500 ký tự'}
                                inputProps={{ maxLength: 500 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Nội dung * <span style={{ fontWeight: 'normal', color: '#666' }}>(Hỗ trợ định dạng văn bản, chèn ảnh, video)</span></Typography>
                            <Box sx={{
                                '.ql-container': { minHeight: 250, fontSize: '16px' },
                                '.ql-editor': { minHeight: 250 },
                                border: formErrors.content ? '1px solid #d32f2f' : 'none',
                                borderRadius: 1,
                            }}>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, content: value }));
                                        if (formErrors.content) {
                                            setFormErrors(prev => ({ ...prev, content: null }));
                                        }
                                    }}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Nhập nội dung bài viết..."
                                />
                            </Box>
                            {formErrors.content && (
                                <Typography color="error" variant="caption">{formErrors.content}</Typography>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Ảnh đại diện *</Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                {formData.thumbnail && (
                                    <Card sx={{ width: 200 }}>
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={formData.thumbnail}
                                            alt="Thumbnail"
                                        />
                                    </Card>
                                )}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={uploadingImage}
                                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <ImageIcon />}
                                >
                                    {uploadingImage ? 'Đang tải...' : 'Chọn ảnh'}
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </Button>
                            </Box>
                            {formErrors.thumbnail && (
                                <Typography color="error" variant="caption">{formErrors.thumbnail}</Typography>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="videoUrl"
                                label="Link Video YouTube (không bắt buộc)"
                                fullWidth
                                value={formData.videoUrl}
                                onChange={handleInputChange}
                                placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                                InputProps={{
                                    startAdornment: <YouTube sx={{ mr: 1, color: '#FF0000' }} />,
                                }}
                                helperText="Dán link video YouTube để nhúng vào bài viết"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                    />
                                }
                                label="Bài viết nổi bật"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm}>Hủy</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={formLoading}
                    >
                        {formLoading ? <CircularProgress size={20} /> : (editingId ? 'Cập nhật' : 'Tạo mới')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{previewArticle?.title}</Typography>
                        <Box>
                            <Chip
                                label={CATEGORY_CONFIG[previewArticle?.category]?.label}
                                color={CATEGORY_CONFIG[previewArticle?.category]?.color}
                                size="small"
                                sx={{ mr: 1 }}
                            />
                            <Chip
                                label={STATUS_CONFIG[previewArticle?.status]?.label}
                                color={STATUS_CONFIG[previewArticle?.status]?.color}
                                size="small"
                            />
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {previewArticle && (
                        <Box>
                            {/* Featured Image */}
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: '100%', height: 300, objectFit: 'cover' }}
                                    image={previewArticle.thumbnail}
                                    alt={previewArticle.title}
                                />
                            </Box>

                            <Box sx={{ p: 3 }}>
                                {/* Title */}
                                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                                    {previewArticle.title}
                                </Typography>

                                {/* Meta Info */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        👤 {previewArticle.author?.name || previewArticle.author?.username || 'Admin'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        📅 {formatDate(previewArticle.publishedAt || previewArticle.createdAt)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        👁 {previewArticle.viewCount || 0} lượt xem
                                    </Typography>
                                </Box>

                                {/* Excerpt */}
                                <Box sx={{
                                    p: 2.5,
                                    bgcolor: '#f5f5f5',
                                    borderLeft: '4px solid #f26522',
                                    borderRadius: 1,
                                    mb: 3,
                                }}>
                                    <Typography variant="body1" fontStyle="italic" color="text.secondary">
                                        {previewArticle.excerpt}
                                    </Typography>
                                </Box>

                                {/* YouTube Video */}
                                {previewArticle.videoUrl && getYoutubeVideoId(previewArticle.videoUrl) && (
                                    <Box sx={{
                                        mb: 3,
                                        position: 'relative',
                                        paddingTop: '56.25%',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    }}>
                                        <iframe
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                            }}
                                            src={`https://www.youtube.com/embed/${getYoutubeVideoId(previewArticle.videoUrl)}`}
                                            title="YouTube video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </Box>
                                )}

                                {/* Main Content */}
                                <Box
                                    sx={{
                                        '& img': {
                                            maxWidth: '100%',
                                            height: 'auto',
                                            borderRadius: 2,
                                            my: 2,
                                        },
                                        '& p': {
                                            mb: 2,
                                            lineHeight: 1.8,
                                            fontSize: '1rem',
                                        },
                                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                                            mt: 3,
                                            mb: 1.5,
                                            fontWeight: 700,
                                        },
                                        '& h2': { fontSize: '1.4rem' },
                                        '& h3': { fontSize: '1.2rem' },
                                        '& ul, & ol': {
                                            pl: 4,
                                            mb: 2,
                                            '& li': { mb: 0.5, lineHeight: 1.7 },
                                        },
                                        '& blockquote': {
                                            borderLeft: '4px solid #f26522',
                                            pl: 2,
                                            py: 1,
                                            my: 2,
                                            bgcolor: '#fff8f5',
                                            fontStyle: 'italic',
                                            color: 'text.secondary',
                                            borderRadius: 1,
                                        },
                                        '& a': {
                                            color: '#f26522',
                                            textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' },
                                        },
                                        '& pre, & code': {
                                            bgcolor: '#f5f5f5',
                                            borderRadius: 1,
                                            p: 0.5,
                                            fontFamily: 'monospace',
                                        },
                                        '& pre': { p: 2, overflow: 'auto' },
                                        '& iframe': {
                                            maxWidth: '100%',
                                            borderRadius: 2,
                                            my: 2,
                                        },
                                        '& .ql-video': {
                                            width: '100%',
                                            minHeight: 350,
                                        },
                                    }}
                                    dangerouslySetInnerHTML={{ __html: previewArticle.content }}
                                />

                                {/* Tags */}
                                {previewArticle.tags?.length > 0 && (
                                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags:</Typography>
                                        <Box>
                                            {previewArticle.tags.map((tag, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={tag}
                                                    size="small"
                                                    sx={{ mr: 0.5, mb: 0.5, bgcolor: '#f0f0f0' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa bài viết này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Hủy</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Xóa</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ArticleManagement;
