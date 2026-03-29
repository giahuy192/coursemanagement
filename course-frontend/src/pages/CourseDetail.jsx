import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Grid, Card, Container,
    CssBaseline, AppBar, Toolbar, CircularProgress, Divider, Alert, Snackbar
} from '@mui/material';
import {
    School, ArrowBack, CalendarToday, AccessTime,
    Person, Category, ShoppingCart, PlayCircleOutline
} from '@mui/icons-material';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

    const role = localStorage.getItem('role');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setAlreadyEnrolled(false);
            try {
                const response = await axios.get(`http://localhost:8080/api/courses/${id}`);
                if (cancelled) return;
                setCourse(response.data);

                const userEmail = localStorage.getItem('username');
                const r = localStorage.getItem('role');
                if (userEmail && r === 'STUDENT') {
                    try {
                        const my = await axios.get(
                            `http://localhost:8080/api/enrollments/my-courses?email=${encodeURIComponent(userEmail)}`
                        );
                        if (!cancelled) {
                            const list = my.data || [];
                            setAlreadyEnrolled(list.some((c) => String(c.id) === String(id)));
                        }
                    } catch {
                        if (!cancelled) setAlreadyEnrolled(false);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết khóa học:", error);
                if (!cancelled) setCourse(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [id]);

    const handleEnroll = () => {
        const userEmail = localStorage.getItem('username');

        if (!userEmail) {
            setAlertInfo({ open: true, message: "Vui lòng đăng nhập để đăng ký!", severity: "warning" });
            return;
        }
        if (alreadyEnrolled) {
            setAlertInfo({ open: true, message: "Bạn đã đăng ký khóa học này rồi.", severity: "info" });
            return;
        }

        // Gói thông tin khóa học mang sang trang Thanh toán
        navigate('/payment', {
            state: {
                courseId: id,
                courseTitle: course.title,
                price: course.price,
                imageUrl: course.imageUrl
            }
        });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={32} /></Box>;
    if (!course) return <Typography variant="body1" align="center" sx={{ mt: 8 }}>Không tìm thấy khóa học!</Typography>;

    const imageUrl = course.imageUrl && !course.imageUrl.startsWith('http')
        ? `http://localhost:8080/uploads/${course.imageUrl}`
        : (course.imageUrl || 'https://via.placeholder.com/800x400');

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#f4f7f6', minHeight: '100vh', pb: 4 }}>
            <CssBaseline />

            {/* NAVBAR */}
            <AppBar position="static" sx={{ backgroundColor: '#1976d2', boxShadow: 'none' }}>
                <Toolbar variant="dense">
                    <Button color="inherit" size="small" onClick={() => navigate('/home')} startIcon={<ArrowBack fontSize="small" />} sx={{ mr: 1, fontWeight: 'bold', textTransform: 'none', fontSize: '0.82rem' }}>
                        Quay lại
                    </Button>
                    <School sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                    <Typography variant="body1" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: '0.95rem' }}>
                        CHI TIẾT KHÓA HỌC
                    </Typography>
                </Toolbar>
            </AppBar>

            <Snackbar open={alertInfo.open} autoHideDuration={3000} onClose={() => setAlertInfo({ ...alertInfo, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={alertInfo.severity} sx={{ width: '100%' }}>{alertInfo.message}</Alert>
            </Snackbar>

            <Container maxWidth={false} sx={{ mt: 3, px: { xs: 2, md: 3, lg: 6 }, width: '100%' }}>
                <Box sx={{ width: '100%', mx: 'auto' }}>
                    <Card sx={{ width: '100%', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

                        <Grid container>
                            {/* CỘT TRÁI: ẢNH BÌA */}
                            <Grid item xs={12} sm={5} sx={{ borderRight: { sm: '1px solid #eee' } }}>
                                <img
                                    src={imageUrl}
                                    alt={course.title}
                                    style={{ width: '100%', height: '100%', minHeight: '240px', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
                                />
                            </Grid>

                            {/* CỘT PHẢI: THÔNG TIN */}
                            <Grid item xs={12} sm={7}>
                                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>

                                    {/* DANH MỤC */}
                                    <Typography sx={{ fontSize: '0.75rem', color: '#1976d2', fontWeight: 'bold', textTransform: 'uppercase', mb: 0.8, display: 'flex', alignItems: 'center' }}>
                                        <Category sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                                        {course.subject ? course.subject.name : "Chưa phân loại"}
                                    </Typography>

                                    {/* TIÊU ĐỀ */}
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 1.5, lineHeight: 1.4, fontSize: '1rem' }}>
                                        {course.title}
                                    </Typography>

                                    {/* THÔNG TIN */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, color: '#555' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Person sx={{ mr: 1, fontSize: '1rem', color: '#666' }} />
                                            <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                                                <strong>Giảng viên:</strong> {course.teacher ? (course.teacher.user?.fullName || course.teacher.name) : 'Đang cập nhật'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarToday sx={{ mr: 1, fontSize: '0.9rem', color: '#666' }} />
                                            <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                                                <strong>Lịch học:</strong> {formatDate(course.startDate)} - {formatDate(course.endDate)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTime sx={{ mr: 1, fontSize: '1rem', color: '#666' }} />
                                            <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                                                <strong>Giờ học:</strong> {course.startTime || '--:--'} đến {course.endTime || '--:--'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    {/* GIÁ & NÚT ĐĂNG KÝ */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            {course.price ? course.price.toLocaleString('vi-VN') + "đ" : "Miễn phí"}
                                        </Typography>

                                        {role === 'STUDENT' ? (
                                            alreadyEnrolled ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Button variant="outlined" size="small" disabled sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                        Đã đăng ký
                                                    </Button>
                                                    <Button variant="contained" size="small" startIcon={<PlayCircleOutline fontSize="small" />}
                                                        sx={{ borderRadius: '6px', fontWeight: 'bold', px: 2, fontSize: '0.8rem' }}
                                                        onClick={() => navigate(`/course/${id}/learn`)}
                                                    >
                                                        Vào học
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Button variant="contained" size="small" startIcon={<ShoppingCart fontSize="small" />}
                                                    sx={{ borderRadius: '6px', backgroundColor: '#ffb74d', color: '#000', fontWeight: 'bold', px: 2, fontSize: '0.8rem', '&:hover': { backgroundColor: '#ffa726' } }}
                                                    onClick={handleEnroll}
                                                >
                                                    ĐĂNG KÝ
                                                </Button>
                                            )
                                        ) : (
                                            <Button variant="outlined" size="small" sx={{ borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }} onClick={() => navigate('/login')}>
                                                Đăng nhập
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* PHẦN MÔ TẢ */}
                        <Box sx={{ backgroundColor: '#fafafa', px: 3, py: 2.5, borderTop: '1px solid #eee' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#333', fontSize: '0.9rem', textAlign: 'left' }}>
                                Mô tả chi tiết
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7, whiteSpace: 'pre-line', fontSize: '0.85rem', textAlign: 'left' }}>
                                {course.description || "Chưa có mô tả cho khóa học này."}
                            </Typography>
                        </Box>

                    </Card>
                </Box>
            </Container>
        </Box>
    );
}