import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, Checkbox, CssBaseline, FormControlLabel, Divider,
    TextField, Typography, Card as MuiCard, Alert, IconButton, InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Visibility, VisibilityOff, Google, Facebook,
    School, WorkspacePremium, AccessTime
} from '@mui/icons-material';

// --- STYLED COMPONENTS ---
const PageContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    width: '100vw', // Ép tràn viền 100%
    display: 'flex',
    backgroundColor: '#e8efff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    boxSizing: 'border-box',
    fontFamily: '"Times New Roman", Times, serif',
    color: '#000000'
}));

const LoginCard = styled(MuiCard)(({ theme }) => ({
    padding: theme.spacing(5),
    borderRadius: '24px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    border: 'none',
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
}));

const FeatureBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fc',
    padding: theme.spacing(2.5),
    borderRadius: '16px',
    marginBottom: theme.spacing(2),
    transition: '0.3s',
    textAlign: 'left', // Ép canh trái chống lại CSS mặc định
    '&:hover': {
        backgroundColor: '#f0f4f8',
        transform: 'translateX(5px)'
    }
}));

export default function SignIn() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    // Đã đổi state thành emailError
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const validateInputs = () => {
        // Đã đổi thành lấy id 'email'
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        let isValid = true;

        if (!email) {
            setEmailError('Vui lòng nhập email.');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password || password.length < 6) {
            setPasswordError('Mật khẩu phải từ 6 ký tự trở lên.');
            isValid = false;
        } else {
            setPasswordError('');
        }
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError('');
        setApiSuccess('');

        if (!validateInputs()) return;

        const data = new FormData(event.currentTarget);
        // Đã đổi key thành email để gửi xuống Spring Boot
        const credentials = {
            email: data.get('email'),
            password: data.get('password')
        };

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
            const resultData = response.data;

            setApiSuccess("Đăng nhập thành công! Đang vào hệ thống...");

            // Lưu email vào biến username để trang chủ vẫn hiện tên tài khoản
            localStorage.setItem("username", credentials.email);
            if (resultData.fullName) localStorage.setItem("fullName", resultData.fullName);
            else if (resultData.name) localStorage.setItem("fullName", resultData.name);

            const responseString = JSON.stringify(resultData).toUpperCase();
            if (responseString.includes("ADMIN")) localStorage.setItem("role", "ADMIN");
            else if (responseString.includes("TEACHER")) localStorage.setItem("role", "TEACHER");
            else localStorage.setItem("role", "STUDENT");

            setTimeout(() => navigate('/home'), 1000);

        } catch (error) {
            if (error.response && error.response.data) {
                setApiError(error.response.data);
            } else {
                setApiError("Có lỗi kết nối đến server Spring Boot!");
            }
        }
    };

    return (
        <PageContainer>
            <CssBaseline />

            <Box sx={{
                position: 'absolute',
                top: 16,
                left: 24,
                right: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10
            }}>
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1100px',
                gap: { xs: 4, md: 8 },
                fontFamily: '"Times New Roman", Times, serif'
            }}>

                {/* ===== CỘT TRÁI: THÔNG TIN MARKETING ===== */}
                <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#102a43', lineHeight: 1.18, mb: 1, fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', fontSize: '3.1rem' }}>
                        Nâng tầm kỹ năng
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#2b6eea', lineHeight: 1.18, mb: 3, fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', fontSize: '3.1rem' }}>
                        Mở lối thành công
                    </Typography>

                    <Typography variant="body1" sx={{ color: '#4f5460', fontSize: '1.1rem', mb: 5, maxWidth: '90%' }}>
                        Tham gia cùng hơn 50.000 học viên đang chinh phục những kiến thức mới mỗi ngày tại HHB Education.
                    </Typography>

                    <FeatureBox>
                        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: '12px', mr: 2 }}>
                            <School sx={{ color: '#1976d2', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>Học từ chuyên gia</Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>Nội dung được biên soạn bởi các giảng viên đầu ngành với kinh nghiệm thực chiến.</Typography>
                        </Box>
                    </FeatureBox>

                    <FeatureBox>
                        <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: '12px', mr: 2 }}>
                            <WorkspacePremium sx={{ color: '#f57c00', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>Chứng chỉ giá trị</Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>Nhận chứng chỉ uy tín sau mỗi khóa học để làm nổi bật hồ sơ năng lực của bạn.</Typography>
                        </Box>
                    </FeatureBox>

                    <FeatureBox>
                        <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: '12px', mr: 2 }}>
                            <AccessTime sx={{ color: '#388e3c', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>Truy cập trọn đời</Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>Học mọi lúc, mọi nơi trên mọi thiết bị. Tài liệu luôn được cập nhật mới nhất.</Typography>
                        </Box>
                    </FeatureBox>
                </Box>

                {/* ===== CỘT PHẢI: FORM ĐĂNG NHẬP ===== */}
                <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <LoginCard>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 1 }}>
                                Đăng nhập học viên
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
                                Tiếp tục hành trình chinh phục tri thức.
                            </Typography>
                        </Box>

                        {apiError && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{apiError}</Alert>}
                        {apiSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{apiSuccess}</Alert>}

                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ textAlign: 'left' }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555', mb: 1, textTransform: 'uppercase' }}>
                                    Email
                                </Typography>
                                {/* ĐÃ ĐỔI id và name TỪ username SANG email */}
                                <TextField
                                    id="email" name="email"
                                    placeholder="a@gmail.com"
                                    variant="outlined"
                                    fullWidth required autoFocus
                                    error={!!emailError}
                                    helperText={emailError}
                                    sx={{
                                        '& .MuiOutlinedInput-root, & .MuiInputBase-root': {
                                            backgroundColor: '#ffffff !important',
                                            borderRadius: '12px',
                                            border: '1px solid #d4d9e6',
                                        },
                                        '& .MuiOutlinedInput-root:hover fieldset': {
                                            borderColor: '#aeb6c2'
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                            borderColor: '#4f8af4'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#d4d9e6 !important'
                                        },
                                        '& .MuiInputBase-input': {
                                            color: '#1f2937',
                                            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                                            fontSize: '1.05rem'
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555', textTransform: 'uppercase' }}>
                                        Mật khẩu
                                    </Typography>
                                    <RouterLink to="#" style={{ fontSize: '0.85rem', color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                                        Quên mật khẩu?
                                    </RouterLink>
                                </Box>
                                <TextField
                                    id="password" name="password"
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    fullWidth required
                                    error={!!passwordError}
                                    helperText={passwordError}
                                    sx={{
                                        '& .MuiOutlinedInput-root, & .MuiInputBase-root': {
                                            backgroundColor: '#ffffff !important',
                                            borderRadius: '12px',
                                            border: '1px solid #d4d9e6',
                                        },
                                        '& .MuiOutlinedInput-root:hover fieldset': {
                                            borderColor: '#aeb6c2'
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                            borderColor: '#4f8af4'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#d4d9e6 !important'
                                        },
                                        '& .MuiInputBase-input': {
                                            color: '#1f2937',
                                            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                                            fontSize: '1.05rem'
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />}
                                label={<Typography sx={{ fontSize: '0.9rem', color: '#444' }}>Ghi nhớ đăng nhập</Typography>}
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit" fullWidth variant="contained"
                                sx={{
                                    py: 1.5, borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold',
                                    backgroundColor: '#1e40af', boxShadow: 'none',
                                    '&:hover': { backgroundColor: '#152d7a', boxShadow: '0 4px 12px rgba(30,64,175,0.3)' }
                                }}
                            >
                                Vào học ngay
                            </Button>

                            <Divider sx={{ my: 4, '&::before, &::after': { borderColor: '#eee' }, color: '#888', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                HOẶC
                            </Divider>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button fullWidth variant="outlined" startIcon={<Google sx={{ color: '#db4437' }} />}
                                    sx={{ py: 1.2, borderRadius: '12px', color: '#333', borderColor: '#ddd', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#f9f9f9', borderColor: '#ccc' } }}>
                                    Google
                                </Button>
                                <Button fullWidth variant="outlined" startIcon={<Facebook sx={{ color: '#1976d2' }} />}
                                    sx={{ py: 1.2, borderRadius: '12px', color: '#333', borderColor: '#ddd', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#f9f9f9', borderColor: '#ccc' } }}>
                                    Facebook
                                </Button>
                            </Box>

                            <Typography sx={{ textAlign: 'center', color: '#555', mt: 4, fontSize: '0.95rem' }}>
                                Bạn là học viên mới?{' '}
                                <RouterLink to="/register" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Đăng ký tài khoản
                                </RouterLink>
                            </Typography>
                        </Box>
                    </LoginCard>
                </Box>

            </Box>
        </PageContainer>
    );
}