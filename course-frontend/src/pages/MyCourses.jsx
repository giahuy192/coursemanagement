import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Box, Grid, Card,
    CardMedia, CardContent, Container, CssBaseline, Alert, Snackbar
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdminPanelSettings, Logout, Person, MenuBook } from '@mui/icons-material';

const theme = createTheme({
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        button: { textTransform: 'none' }
    },
});

export default function MyCourses() {
    const navigate = useNavigate();
    const [myCourses, setMyCourses] = useState([]);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

    const role = localStorage.getItem('role') || '';
    const fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Tài khoản';
    const email = localStorage.getItem('username'); // Lấy email người dùng hiện tại

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }
        fetchMyCourses();
    }, [email, navigate]);

    const fetchMyCourses = async () => {
        try {
            // Gọi API truyền email lên để lấy đúng khóa học của người này
            const response = await axios.get(
                `http://localhost:8080/api/enrollments/my-courses?email=${encodeURIComponent(email)}`
            );
            setMyCourses(response.data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách khóa học của tôi:", err);
            setAlertInfo({ open: true, message: "Không thể tải danh sách khóa học của bạn!", severity: "error" });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, backgroundColor: '#f7f9fc', minHeight: '100vh', pb: 8 }}>
                <CssBaseline />

                {/* NAVBAR */}
                <AppBar position="sticky" sx={{ backgroundColor: '#fff', color: '#333', boxShadow: 'none', borderBottom: '1px solid #edf0f5', top: 0, zIndex: 1100 }}>
                    <Toolbar sx={{ px: { xs: 2, md: 4, lg: 6 }, height: '70px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', flexGrow: 1, gap: 1, cursor: 'pointer' }} onClick={() => navigate('/home')}>
                            <Typography variant="h6" sx={{ fontWeight: '900', color: '#1a4e9b', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                                HHB EDUCATION
                            </Typography>
                            <Typography sx={{ fontWeight: '500', color: '#4a72ad', fontSize: '1.1rem', display: { xs: 'none', sm: 'block' } }}>
                                Learning
                            </Typography>
                        </Box>

                        {/* Nút điều hướng về trang chủ */}
                        <Button onClick={() => navigate('/home')} sx={{ display: { xs: 'none', md: 'block' }, color: '#666', mr: 2 }}>
                            Khám phá khóa học
                        </Button>
                        <Button sx={{ display: { xs: 'none', md: 'block' }, color: '#1a4e9b', fontWeight: 'bold', mr: 2 }}>
                            Khóa học của tôi
                        </Button>
                        {role.toUpperCase().includes('STUDENT') && (
                            <Button onClick={() => navigate('/profile')} sx={{ display: { xs: 'none', md: 'block' }, color: '#666', fontWeight: 'bold', mr: 4 }}>
                                Hồ sơ
                            </Button>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, backgroundColor: '#f0f4fa', padding: '6px 16px', borderRadius: '30px' }}>
                            <Person sx={{ color: '#1a4e9b', mr: 1, fontSize: '1.1rem' }} />
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a4e9b' }}>{fullName}</Typography>
                        </Box>

                        {role.includes('ADMIN') && (
                            <Button color="primary" size="small" startIcon={<AdminPanelSettings fontSize="small" />} sx={{ mr: 1, fontWeight: 'bold' }} onClick={() => navigate('/admin')}>
                                Quản trị
                            </Button>
                        )}
                        <Button variant="contained" size="small" onClick={handleLogout} sx={{ borderRadius: '20px', fontWeight: 'bold', backgroundColor: '#1a4e9b', boxShadow: 'none' }}>
                            Đăng xuất
                        </Button>
                    </Toolbar>
                </AppBar>

                <Snackbar open={alertInfo.open} autoHideDuration={3000} onClose={() => setAlertInfo({ ...alertInfo, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert severity={alertInfo.severity} sx={{ width: '100%' }}>{alertInfo.message}</Alert>
                </Snackbar>

                {/* NỘI DUNG CHÍNH */}
                <Container maxWidth="lg" sx={{ mt: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                        <Box sx={{ backgroundColor: '#eef2f9', p: 1.5, borderRadius: '12px' }}>
                            <MenuBook sx={{ color: '#1a4e9b', fontSize: '2rem' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: '900', color: '#1a1a1a', fontSize: '1.8rem' }}>
                                Khóa học của tôi
                            </Typography>
                            <Typography sx={{ fontSize: '1rem', color: '#666' }}>
                                Bạn đang học {myCourses.length} khóa học. Cố gắng lên nhé!
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={4}>
                        {myCourses.length === 0 ? (
                            <Grid item xs={12}>
                                <Box sx={{ textAlign: 'center', py: 10, backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #ccc' }}>
                                    <Typography sx={{ color: '#666', fontSize: '1.1rem', mb: 2 }}>Bạn chưa đăng ký khóa học nào.</Typography>
                                    <Button variant="contained" onClick={() => navigate('/home')} sx={{ backgroundColor: '#2b6eea', borderRadius: '8px', fontWeight: 'bold' }}>
                                        Khám phá ngay
                                    </Button>
                                </Box>
                            </Grid>
                        ) : (
                            myCourses.map((course) => (
                                <Grid item key={course.id} xs={12} sm={6} md={4}>
                                    <Card sx={{
                                        maxWidth: 320, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column',
                                        borderRadius: '16px', border: '1px solid #edf0f5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                        transition: 'all 0.2s ease', cursor: 'pointer',
                                        '&:hover': { boxShadow: '0 8px 24px rgba(26,78,155,0.1)', transform: 'translateY(-4px)' },
                                    }}
                                        onClick={() => navigate(`/course/${course.id}/learn`)} // Điều hướng thẳng vào trang HỌC
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia component="img" height="160" sx={{ objectFit: 'cover' }}
                                                image={course.imageUrl && !course.imageUrl.startsWith('http') ? `http://localhost:8080/uploads/${course.imageUrl}` : (course.imageUrl || 'https://via.placeholder.com/400x200')}
                                                alt={course.title}
                                            />
                                            <Box sx={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(43, 110, 234, 0.9)', px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>
                                                ĐÃ ĐĂNG KÝ
                                            </Box>
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                                            <Typography component="h2" sx={{ fontWeight: 'bold', fontSize: '1.05rem', lineHeight: 1.4, color: '#1a1a1a', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {course.title}
                                            </Typography>
                                            <Box sx={{ mt: 'auto' }}>
                                                <Button variant="contained" fullWidth sx={{ backgroundColor: '#2b6eea', color: '#fff', borderRadius: '8px', fontWeight: 'bold', py: 1.2, boxShadow: 'none', '&:hover': { backgroundColor: '#1a4e9b' } }}>
                                                    Vào học tiếp →
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Container>
            </Box>
        </ThemeProvider>
    );
}