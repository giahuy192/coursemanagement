import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Box, Grid, Card,
    CardMedia, CardContent, Container, CssBaseline, Alert, Snackbar,
    List, ListItemButton, ListItemText, Divider, Select, MenuItem, FormControl
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    AdminPanelSettings, Logout, Person,
} from '@mui/icons-material';

// --- TẠO THEME ÉP FONT CHỮ HIỆN ĐẠI ---
const theme = createTheme({
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        button: {
            textTransform: 'none',
        }
    },
});

const CATEGORIES = [
    { id: 'all', name: 'Tất cả' },
    { id: 'toan', name: 'Toán' },
    { id: 'ly', name: 'Lý' },
    { id: 'hoa', name: 'Hoá' },
    { id: 'van', name: 'Ngữ văn' },
    { id: 'anh', name: 'Tiếng Anh' },
];

const CATEGORY_KEYWORDS = {
    toan: ['toán', 'toan', 'math'],
    ly: ['lý', 'ly', 'vật lý', 'vat ly', 'physics'],
    hoa: ['hoá', 'hoa', 'hóa', 'chemistry'],
    van: ['ngữ văn', 'van', 'văn', 'literature'],
    anh: ['tiếng anh', 'anh', 'english'],
};

export default function HomePage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    const role = localStorage.getItem('role') || '';
    const fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Tài khoản';

    const getRoleName = (roleCode) => {
        if (!roleCode) return 'Khách';
        const r = roleCode.toUpperCase();
        if (r.includes('ADMIN')) return 'Admin Profile';
        if (r.includes('TEACHER')) return 'Giảng viên';
        if (r.includes('STUDENT')) return 'Học viên';
        return 'Tài khoản';
    };

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/courses');
            setCourses(response.data);
        } catch {
            setAlertInfo({ open: true, message: "Không thể tải dữ liệu từ Server!", severity: "error" });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const filteredCourses = useMemo(() => {
        let result = [...courses];

        if (selectedCategory !== 'all') {
            const keywords = CATEGORY_KEYWORDS[selectedCategory] || [];
            result = result.filter(course => {
                const subject = (course.subject?.name || course.category || '').toLowerCase();
                return keywords.some(k => subject.includes(k));
            });
        }

        if (sortOrder === 'newest') {
            result.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
        } else if (sortOrder === 'price_asc') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOrder === 'price_desc') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        return result;
    }, [courses, selectedCategory, sortOrder]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, backgroundColor: '#f7f9fc', minHeight: '100vh', pb: 8 }}>
                <CssBaseline />

                {/* NAVBAR */}
                <AppBar position="sticky" sx={{ backgroundColor: '#fff', color: '#333', boxShadow: 'none', borderBottom: '1px solid #edf0f5', top: 0, zIndex: 1100 }}>
                    <Toolbar sx={{ px: { xs: 2, md: 4, lg: 6 }, height: '70px' }}>
                        {/* Logo */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', flexGrow: 1, gap: 1, cursor: 'pointer' }} onClick={() => navigate('/home')}>
                            <Typography variant="h6" sx={{ fontWeight: '900', color: '#1a4e9b', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                                HHB EDUCATION
                            </Typography>
                        </Box>

                        {/* --- MENU ĐIỀU HƯỚNG ĐÃ THÊM NÚT MY COURSES --- */}
                        <Button onClick={() => navigate('/home')} sx={{ display: { xs: 'none', md: 'block' }, color: '#1a4e9b', fontWeight: 'bold', mr: 2 }}>
                            Khám phá khóa học
                        </Button>
                        <Button onClick={() => navigate('/my-courses')} sx={{ display: { xs: 'none', md: 'block' }, color: '#666', fontWeight: 'bold', mr: 2 }}>
                            Khóa học của tôi
                        </Button>
                        {role.toUpperCase().includes('STUDENT') && (
                            <Button onClick={() => navigate('/profile')} sx={{ display: { xs: 'none', md: 'block' }, color: '#666', fontWeight: 'bold', mr: 2 }}>
                                Hồ sơ
                            </Button>
                        )}
                        <Button sx={{ display: { xs: 'none', md: 'block' }, color: '#666', mr: 4 }}>
                            Trợ giúp
                        </Button>

                        {/* Profile */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, backgroundColor: '#f0f4fa', padding: '6px 16px', borderRadius: '30px' }}>
                            <Person sx={{ color: '#1a4e9b', mr: 1, fontSize: '1.1rem' }} />
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a4e9b' }}>
                                {fullName} <span style={{ color: '#666', fontWeight: 'normal' }}>({getRoleName(role)})</span>
                            </Typography>
                        </Box>

                        {role.includes('ADMIN') && (
                            <Button color="primary" size="small" startIcon={<AdminPanelSettings fontSize="small" />}
                                sx={{ mr: 1, fontWeight: 'bold' }}
                                onClick={() => navigate('/admin')}>
                                Quản trị
                            </Button>
                        )}
                        <Button variant="contained" size="small" onClick={handleLogout}
                            sx={{ borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#1a4e9b', boxShadow: 'none', px: 3, py: 0.8 }}>
                            Đăng xuất
                        </Button>
                    </Toolbar>
                </AppBar>

                <Snackbar open={alertInfo.open} autoHideDuration={3000}
                    onClose={() => setAlertInfo({ ...alertInfo, open: false })}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert severity={alertInfo.severity} sx={{ width: '100%' }}>{alertInfo.message}</Alert>
                </Snackbar>

                <Container maxWidth={false} sx={{ mt: 5, px: { xs: 2, md: 3, lg: 6 }, width: '100%', maxWidth: '1400px' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5, alignItems: 'flex-start' }}>

                        {/* ===== SIDEBAR DANH MỤC ===== */}
                        <Box sx={{ width: { xs: '100%', md: '220px' }, flexShrink: 0, position: 'sticky', top: 90 }}>
                            <Typography sx={{ fontWeight: '900', fontSize: '1.1rem', color: '#1a1a1a', mb: 0.5, px: 2 }}>
                                Danh mục
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#888', mb: 2, px: 2 }}>
                                Khám phá kiến thức
                            </Typography>

                            <List dense disablePadding>
                                {CATEGORIES.map((cat) => (
                                    <ListItemButton
                                        key={cat.id}
                                        selected={selectedCategory === cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        sx={{
                                            py: 1.2, px: 2, mb: 0.5,
                                            borderRadius: '8px',
                                            '&.Mui-selected': { backgroundColor: '#eef2f9' },
                                            '&.Mui-selected:hover': { backgroundColor: '#e5ecf5' },
                                            '&:hover': { backgroundColor: '#f0f4fa' },
                                        }}
                                    >
                                        <ListItemText
                                            primary={cat.name}
                                            primaryTypographyProps={{
                                                fontSize: '0.9rem',
                                                fontWeight: selectedCategory === cat.id ? 'bold' : '500',
                                                color: selectedCategory === cat.id ? '#1a4e9b' : '#333',
                                            }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>

                        {/* ===== NỘI DUNG CHÍNH ===== */}
                        <Box sx={{ flexGrow: 1, width: '100%' }}>
                            {/* Header Danh sách */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                                <Box>
                                    <Typography sx={{ fontWeight: '900', color: '#1a1a1a', fontSize: '1.5rem', mb: 0.5 }}>
                                        Hiển thị {filteredCourses.length} khóa học
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                                        Tìm thấy các kết quả phù hợp với tiêu chí của bạn
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Sắp xếp theo:</Typography>
                                    <FormControl size="small">
                                        <Select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            sx={{
                                                fontSize: '0.85rem', height: '36px', minWidth: '120px', borderRadius: '8px',
                                                fontWeight: 'bold', color: '#1a4e9b',
                                                backgroundColor: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
                                            }}
                                        >
                                            <MenuItem value="newest" sx={{ fontSize: '0.85rem', fontWeight: '500' }}>Mới nhất</MenuItem>
                                            <MenuItem value="price_asc" sx={{ fontSize: '0.85rem', fontWeight: '500' }}>Giá tăng dần</MenuItem>
                                            <MenuItem value="price_desc" sx={{ fontSize: '0.85rem', fontWeight: '500' }}>Giá giảm dần</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* LƯỚI KHOÁ HỌC */}
                            <Grid container spacing={3}>
                                {filteredCourses.length === 0 ? (
                                    <Grid item xs={12}>
                                        <Typography sx={{ mt: 3, color: '#888', fontSize: '0.95rem', textAlign: 'center', p: 6, backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #edf0f5' }}>
                                            Không tìm thấy khóa học nào.
                                        </Typography>
                                    </Grid>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <Grid item key={course.id} xs={12} sm={6} md={6} lg={4}>
                                            <Card sx={{
                                                maxWidth: 320,
                                                margin: '0 auto',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: '16px',
                                                border: '1px solid #edf0f5',
                                                backgroundColor: '#fff',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    boxShadow: '0 8px 24px rgba(26,78,155,0.1)',
                                                    transform: 'translateY(-4px)',
                                                },
                                            }}
                                                onClick={() => navigate(`/course/${course.id}`)}
                                            >
                                                {/* Ảnh bìa */}
                                                <Box sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="160"
                                                        sx={{ objectFit: 'cover' }}
                                                        image={
                                                            course.imageUrl && !course.imageUrl.startsWith('http')
                                                                ? `http://localhost:8080/uploads/${course.imageUrl}`
                                                                : (course.imageUrl || 'https://via.placeholder.com/400x200')
                                                        }
                                                        alt={course.title}
                                                    />
                                                    {/* Badge Môn học nổi trên ảnh */}
                                                    <Box sx={{
                                                        position: 'absolute', top: 12, left: 12,
                                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                                        px: 1.5, py: 0.5, borderRadius: '6px',
                                                        fontSize: '0.7rem', fontWeight: 'bold', color: '#1a4e9b', textTransform: 'uppercase'
                                                    }}>
                                                        {course.subject?.name || 'MÔN HỌC'}
                                                    </Box>
                                                </Box>

                                                <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                                                    {/* Tiêu đề */}
                                                    <Typography component="h2" sx={{
                                                        fontWeight: 'bold', fontSize: '1rem', lineHeight: 1.4, color: '#1a1a1a', mb: 2,
                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                    }}>
                                                        {course.title}
                                                    </Typography>

                                                    <Box sx={{ mt: 'auto' }}>
                                                        {/* Nút Xem chi tiết */}
                                                        <Button
                                                            variant="contained" fullWidth
                                                            sx={{
                                                                backgroundColor: '#2b6eea', color: '#fff', borderRadius: '8px',
                                                                fontWeight: 'bold', py: 1.2, fontSize: '0.9rem', boxShadow: 'none',
                                                                '&:hover': { backgroundColor: '#1a4e9b', boxShadow: 'none' },
                                                            }}
                                                        >
                                                            Xem chi tiết →
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        </Box>

                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
}