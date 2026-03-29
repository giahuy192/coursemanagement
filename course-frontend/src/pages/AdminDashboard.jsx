import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    AppBar, Toolbar, Alert, Snackbar, CssBaseline, FormLabel, Grid
} from '@mui/material';
import { Delete, Add, ArrowBack, CloudUpload, Edit, MenuBook, Group } from '@mui/icons-material';

export default function AdminDashboard() {
    const navigate = useNavigate();

    // State quản lý dữ liệu
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // State quản lý UI
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

    // State quản lý Form
    const [formData, setFormData] = useState({
        title: '', description: '', price: '', subjectId: '', teacherId: '',
        startDate: '', endDate: '', startTime: '', endTime: ''
    });

    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    // ===== STATE QUẢN LÝ THỐNG KÊ HỌC VIÊN =====
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [selectedCourseTitle, setSelectedCourseTitle] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'ADMIN') {
            navigate('/home');
        } else {
            fetchCourses();
            fetchSubjects();
            fetchTeachers();
        }
    }, [navigate]);

    // --- CÁC HÀM GỌI API ---
    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/courses');
            setCourses(response.data);
        } catch (error) {
            showAlert("Lỗi tải danh sách khóa học!", "error");
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/teachers');
            setTeachers(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách giáo viên:", error);
        }
    };

    // --- TÍNH TOÁN SỐ LIỆU TỔNG QUAN ---
    const totalCourses = courses.length;
    const totalTeachers = teachers.length;
    // Cộng dồn học viên dựa trên trường studentCount (nhớ đảm bảo sếp đã cấu hình @Formula bên Backend)
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.studentCount || 0), 0);

    // --- XỬ LÝ MỞ FORM ---
    const handleOpenAddForm = () => {
        setIsEditMode(false);
        setEditCourseId(null);
        setFormData({
            title: '', description: '', price: '', subjectId: '', teacherId: '',
            startDate: '', endDate: '', startTime: '', endTime: ''
        });
        setSelectedImageFile(null);
        setImagePreviewUrl('');
        setOpenDialog(true);
    };

    const handleOpenEditForm = (course) => {
        setIsEditMode(true);
        setEditCourseId(course.id);
        setFormData({
            title: course.title || '',
            description: course.description || '',
            price: course.price || '',
            subjectId: course.subject ? course.subject.id : '',
            teacherId: course.teacher ? course.teacher.id : '',
            startDate: course.startDate || '',
            endDate: course.endDate || '',
            startTime: course.startTime || '',
            endTime: course.endTime || ''
        });

        if (course.imageUrl) {
            setImagePreviewUrl(course.imageUrl.startsWith('http') ? course.imageUrl : `http://localhost:8080/uploads/${course.imageUrl}`);
        } else {
            setImagePreviewUrl('');
        }
        setSelectedImageFile(null);
        setOpenDialog(true);
    };

    // --- XỬ LÝ XEM HỌC VIÊN ĐĂNG KÝ ---
    const handleViewStudents = async (course) => {
        setSelectedCourseTitle(course.title);
        try {
            const response = await axios.get(`http://localhost:8080/api/enrollments/course/${course.id}`);
            setEnrolledStudents(response.data);
            setOpenStudentDialog(true);
        } catch (error) {
            console.error(error);
            setEnrolledStudents([]);
            setOpenStudentDialog(true);
        }
    };

    const handleSaveCourse = async () => {
        if (!formData.title || !formData.subjectId || !formData.price || (!selectedImageFile && !isEditMode)) {
            showAlert("Vui lòng điền các trường bắt buộc (*)", "warning");
            return;
        }

        try {
            const postData = new FormData();
            postData.append('title', formData.title);
            postData.append('description', formData.description);
            postData.append('price', formData.price);
            postData.append('subjectId', formData.subjectId);
            postData.append('teacherId', formData.teacherId);
            postData.append('startDate', formData.startDate);
            postData.append('endDate', formData.endDate);
            postData.append('startTime', formData.startTime);
            postData.append('endTime', formData.endTime);

            if (selectedImageFile) {
                postData.append('imageFile', selectedImageFile);
            }

            if (isEditMode) {
                await axios.put(`http://localhost:8080/api/courses/${editCourseId}`, postData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showAlert("Cập nhật khóa học thành công!", "success");
            } else {
                await axios.post('http://localhost:8080/api/courses', postData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showAlert("Thêm khóa học thành công!", "success");
            }

            setOpenDialog(false);
            fetchCourses();
        } catch (error) {
            showAlert(isEditMode ? "Lỗi khi cập nhật!" : "Lỗi khi thêm khóa học!", "error");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
            try {
                await axios.delete(`http://localhost:8080/api/courses/${id}`);
                showAlert("Đã xóa khóa học!", "success");
                fetchCourses();
            } catch (error) {
                showAlert("Không thể xóa! Có thể khóa học đang có học viên đăng ký.", "error");
            }
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const showAlert = (message, severity) => setAlertInfo({ open: true, message, severity });

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#f4f6f8', minHeight: '100vh', pb: 5 }}>
            <CssBaseline />

            <AppBar position="static" sx={{ backgroundColor: '#20232a', boxShadow: 'none' }}>
                <Toolbar>
                    <Button color="inherit" onClick={() => navigate('/home')} startIcon={<ArrowBack />} sx={{ mr: 2 }}>
                        Về Trang Chủ
                    </Button>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#61dafb' }}>
                        BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN
                    </Typography>
                </Toolbar>
            </AppBar>

            <Snackbar open={alertInfo.open} autoHideDuration={3000} onClose={() => setAlertInfo({ ...alertInfo, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={alertInfo.severity} sx={{ width: '100%' }}>{alertInfo.message}</Alert>
            </Snackbar>

            <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>

                {/* ===== BẢNG THỐNG KÊ TỔNG QUAN ===== */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 3, borderRadius: '12px', backgroundColor: '#3b82f6', color: '#fff', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}>
                            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 'bold' }}>TỔNG SỐ KHÓA HỌC</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{totalCourses}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 3, borderRadius: '12px', backgroundColor: '#10b981', color: '#fff', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}>
                            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 'bold' }}>TỔNG LƯỢT ĐĂNG KÝ</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{totalEnrollments}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 3, borderRadius: '12px', backgroundColor: '#8b5cf6', color: '#fff', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }}>
                            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 'bold' }}>GIÁO VIÊN HỢP TÁC</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{totalTeachers}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Quản lý Khóa học
                    </Typography>
                    <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenAddForm} sx={{ borderRadius: '8px', fontWeight: 'bold' }}>
                        Thêm Khóa Học Mới
                    </Button>
                </Box>

                <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Hình ảnh</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tên Khóa Học</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Danh Mục</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Giá (VNĐ)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2563eb' }}>Số HV</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: '300px' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id} hover>
                                    <TableCell>{course.id}</TableCell>
                                    <TableCell>
                                        <img
                                            src={course.imageUrl && !course.imageUrl.startsWith('http')
                                                ? `http://localhost:8080/uploads/${course.imageUrl}`
                                                : (course.imageUrl || 'https://via.placeholder.com/50')}
                                            alt="cover"
                                            style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: '500' }}>{course.title}</TableCell>
                                    <TableCell>{course.teacher ? course.teacher.user?.fullName || course.teacher.name : 'Chưa xếp'}</TableCell>
                                    <TableCell>{course.subject ? course.subject.name : 'N/A'}</TableCell>
                                    <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                        {course.price ? course.price.toLocaleString('vi-VN') : 'Miễn phí'}
                                    </TableCell>

                                    {/* CỘT HIỂN THỊ SỐ LƯỢNG HỌC VIÊN */}
                                    <TableCell align="center">
                                        <Box sx={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontWeight: 'bold', py: 0.5, px: 1.5, borderRadius: '20px', display: 'inline-block' }}>
                                            {course.studentCount || 0}
                                        </Box>
                                    </TableCell>

                                    {/* ===== CỘT HÀNH ĐỘNG ===== */}
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => handleOpenEditForm(course)} title="Sửa thông tin">
                                            <Edit />
                                        </IconButton>

                                        {/* Nút Xem Học Viên */}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="secondary"
                                            startIcon={<Group />}
                                            onClick={() => handleViewStudents(course)}
                                            sx={{ mx: 0.5, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                            Học viên
                                        </Button>

                                        {/* Nút sang trang Quản lý Bài giảng */}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<MenuBook />}
                                            onClick={() => navigate(`/admin/course/${course.id}/curriculum`)}
                                            sx={{ mx: 0.5, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                            Bài giảng
                                        </Button>

                                        <IconButton color="error" onClick={() => handleDeleteCourse(course.id)} title="Xóa khóa học">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* MODAL THÊM/SỬA KHÓA HỌC */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                    {isEditMode ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField label="Tên khóa học *" name="title" value={formData.title} onChange={handleChange} fullWidth required />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Danh mục (Môn học) *" name="subjectId" value={formData.subjectId} onChange={handleChange} select fullWidth required>
                                    {subjects.map((sub) => (
                                        <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Giáo viên giảng dạy" name="teacherId" value={formData.teacherId} onChange={handleChange} select fullWidth>
                                    <MenuItem value="">-- Chọn Giáo Viên --</MenuItem>
                                    {teachers.map((tea) => (
                                        <MenuItem key={tea.id} value={tea.id}>{tea.user?.fullName || tea.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Giá tiền (VNĐ) *" name="price" type="text" value={formData.price} onChange={handleChange} fullWidth required />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <TextField label="Ngày khai giảng" type="date" name="startDate" value={formData.startDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ style: { cursor: 'pointer' }, onClick: (e) => e.target.showPicker && e.target.showPicker() }} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField label="Ngày kết thúc" type="date" name="endDate" value={formData.endDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ style: { cursor: 'pointer' }, onClick: (e) => e.target.showPicker && e.target.showPicker() }} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField label="Giờ bắt đầu" type="time" name="startTime" value={formData.startTime} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ style: { cursor: 'pointer' }, onClick: (e) => e.target.showPicker && e.target.showPicker() }} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField label="Giờ kết thúc" type="time" name="endTime" value={formData.endTime} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ style: { cursor: 'pointer' }, onClick: (e) => e.target.showPicker && e.target.showPicker() }} />
                            </Grid>
                        </Grid>

                        <Box>
                            <FormLabel sx={{ display: 'block', mb: 1, color: '#333' }}>Ảnh bìa khóa học {isEditMode ? '(Bỏ trống nếu giữ nguyên ảnh cũ)' : '*'}</FormLabel>
                            <input accept="image/*" style={{ display: 'none' }} id="upload-image-button" type="file" onChange={handleFileChange} />
                            <label htmlFor="upload-image-button">
                                <Button variant="outlined" component="span" fullWidth startIcon={<CloudUpload />} sx={{ height: '56px', textTransform: 'none' }}>
                                    {selectedImageFile ? `Đã chọn: ${selectedImageFile.name}` : 'Bấm để tải ảnh lên'}
                                </Button>
                            </label>
                            {imagePreviewUrl && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </Box>
                            )}
                        </Box>

                        <TextField label="Mô tả chi tiết" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Hủy</Button>
                    <Button onClick={handleSaveCourse} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
                        {isEditMode ? 'Cập Nhật' : 'Lưu Khóa Học'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===== POPUP HIỂN THỊ DANH SÁCH HỌC VIÊN ===== */}
            <Dialog open={openStudentDialog} onClose={() => setOpenStudentDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Học viên đăng ký: {selectedCourseTitle}</span>
                    <span style={{ color: '#2563eb' }}>Tổng: {enrolledStudents.length} học viên</span>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {enrolledStudents.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', color: '#888', py: 3 }}>
                            Chưa có học viên nào đăng ký khóa này.
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Họ Tên</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Ngày Đăng Ký</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {enrolledStudents.map((enrollment, index) => (
                                        <TableRow key={enrollment.id || index}>
                                            <TableCell>{enrollment.student?.user?.fullName || 'N/A'}</TableCell>
                                            <TableCell>{enrollment.student?.user?.email || 'N/A'}</TableCell>
                                            <TableCell>
                                                {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <span style={{
                                                    color: enrollment.status === 'ACTIVE' ? 'green' : (enrollment.status === 'PENDING' ? 'orange' : 'red'),
                                                    fontWeight: 'bold'
                                                }}>
                                                    {enrollment.status || 'N/A'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenStudentDialog(false)} color="inherit" variant="outlined">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}