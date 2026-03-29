import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Container, CssBaseline, TextField, Card, CardContent,
    AppBar, Toolbar, Alert, Snackbar, InputAdornment, IconButton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ArrowBack, Person, Visibility, VisibilityOff, Save, Lock } from '@mui/icons-material';

const API = 'http://localhost:8080';

const theme = createTheme({
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        button: { textTransform: 'none' }
    },
});

export default function StudentProfile() {
    const navigate = useNavigate();
    const email = localStorage.getItem('username');
    const role = (localStorage.getItem('role') || '').toUpperCase();

    const [loading, setLoading] = useState(true);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });
    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);

    const [profile, setProfile] = useState({
        fullName: '',
        phone: '',
        address: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }
        if (!role.includes('STUDENT')) {
            setLoading(false);
            return;
        }
        const load = async () => {
            try {
                const res = await axios.get(`${API}/api/students/profile`, {
                    params: { email }
                });
                const p = res.data;
                setProfile({
                    fullName: p.fullName || '',
                    phone: p.phone || '',
                    address: p.address || ''
                });
            } catch (e) {
                setAlertInfo({
                    open: true,
                    message: typeof e.response?.data === 'string' ? e.response.data : 'Không tải được hồ sơ.',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [email, navigate, role]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API}/api/students/profile`, {
                email,
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address
            });
            localStorage.setItem('fullName', profile.fullName.trim() || email);
            setAlertInfo({ open: true, message: 'Đã lưu thông tin cá nhân.', severity: 'success' });
        } catch (err) {
            const msg = err.response?.data;
            setAlertInfo({
                open: true,
                message: typeof msg === 'string' ? msg : 'Lưu thất bại.',
                severity: 'error'
            });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
            setAlertInfo({ open: true, message: 'Vui lòng nhập đủ mật khẩu mới và xác nhận.', severity: 'warning' });
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setAlertInfo({ open: true, message: 'Mật khẩu xác nhận không khớp.', severity: 'warning' });
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setAlertInfo({ open: true, message: 'Mật khẩu mới cần ít nhất 6 ký tự.', severity: 'warning' });
            return;
        }
        try {
            await axios.put(`${API}/api/students/profile`, {
                email,
                newPassword: passwordForm.newPassword
            });
            setPasswordForm({ newPassword: '', confirmPassword: '' });
            setAlertInfo({ open: true, message: 'Đã đổi mật khẩu thành công.', severity: 'success' });
        } catch (err) {
            const msg = err.response?.data;
            setAlertInfo({
                open: true,
                message: typeof msg === 'string' ? msg : 'Đổi mật khẩu thất bại.',
                severity: 'error'
            });
        }
    };

    if (!email) {
        return null;
    }

    if (!loading && !role.includes('STUDENT')) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography sx={{ mb: 2 }}>Trang hồ sơ chỉ dành cho học viên.</Typography>
                    <Button variant="contained" onClick={() => navigate('/home')}>Về trang chủ</Button>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, backgroundColor: '#f7f9fc', minHeight: '100vh', pb: 6 }}>
                <CssBaseline />

                <AppBar position="sticky" sx={{ backgroundColor: '#fff', color: '#333', boxShadow: 'none', borderBottom: '1px solid #edf0f5' }}>
                    <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
                        <Button startIcon={<ArrowBack />} onClick={() => navigate('/home')} sx={{ color: '#1a4e9b', mr: 2 }}>
                            Trang chủ
                        </Button>
                        <Person sx={{ color: '#1a4e9b', mr: 1 }} />
                        <Typography sx={{ fontWeight: 'bold', flexGrow: 1 }}>Hồ sơ học viên</Typography>
                    </Toolbar>
                </AppBar>

                <Snackbar open={alertInfo.open} autoHideDuration={4000}
                    onClose={() => setAlertInfo({ ...alertInfo, open: false })}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert severity={alertInfo.severity} sx={{ width: '100%' }}>{alertInfo.message}</Alert>
                </Snackbar>

                <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* --- Thông tin cá nhân --- */}
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a4e9b', mb: 0.5 }}>
                                Thông tin cá nhân
                            </Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 3 }}>
                                Họ tên, số điện thoại và địa chỉ liên hệ.
                            </Typography>

                            {loading ? (
                                <Typography>Đang tải...</Typography>
                            ) : (
                                <Box component="form" onSubmit={handleSaveProfile}>
                                    <TextField
                                        fullWidth label="Email" value={email} margin="normal" disabled
                                        helperText="Email dùng để đăng nhập, không đổi tại đây."
                                    />
                                    <TextField
                                        fullWidth label="Họ và tên"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        margin="normal" required
                                    />
                                    <TextField
                                        fullWidth label="Số điện thoại"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth label="Địa chỉ"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        margin="normal" multiline minRows={2}
                                    />
                                    <Button type="submit" variant="contained" fullWidth startIcon={<Save />}
                                        sx={{ mt: 3, py: 1.2, fontWeight: 'bold', backgroundColor: '#1a4e9b', borderRadius: 2 }}>
                                        Lưu thông tin
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* --- Đổi mật khẩu (riêng) --- */}
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e8eef5' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Lock sx={{ color: '#475569' }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>
                                    Đổi mật khẩu
                                </Typography>
                            </Box>
                            {!loading && (
                                <Box component="form" onSubmit={handleChangePassword}>
                                    <TextField
                                        fullWidth label="Mật khẩu mới"
                                        type={showPw ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        margin="normal"
                                        autoComplete="new-password"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPw(!showPw)} edge="end">
                                                        {showPw ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <TextField
                                        fullWidth label="Xác nhận mật khẩu mới"
                                        type={showPw2 ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        margin="normal"
                                        autoComplete="new-password"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPw2(!showPw2)} edge="end">
                                                        {showPw2 ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <Button type="submit" variant="outlined" fullWidth startIcon={<Lock />}
                                        sx={{ mt: 3, py: 1.2, fontWeight: 'bold', borderColor: '#334155', color: '#334155', borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2, backgroundColor: 'rgba(51,65,85,0.06)' } }}>
                                        Đổi mật khẩu
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
