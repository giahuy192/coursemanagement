import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, CssBaseline, Divider,
    TextField, Typography, Card as MuiCard, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { School, WorkspacePremium, AccessTime } from '@mui/icons-material';

const PageContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8efff',
    padding: theme.spacing(4),
    boxSizing: 'border-box',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    maxWidth: '1120px',
    gap: theme.spacing(8),
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
    },
}));

const InfoColumn = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'none',
    [theme.breakpoints.up('md')]: {
        display: 'block',
    },
    color: '#1c242f',
}));

const FeatureBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#f2f7ff',
    borderRadius: '16px',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: '0 6px 16px rgba(15, 36, 74, 0.05)',
}));

const AuthCard = styled(MuiCard)(({ theme }) => ({
    flex: 1,
    minWidth: 360,
    maxWidth: 520,
    margin: '0 auto',
    padding: theme.spacing(5),
    borderRadius: '22px',
    boxShadow: '0 18px 45px rgba(30, 65, 150, 0.16)',
    border: '1px solid rgba(33, 100, 215, 0.15)',
}));

export default function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateInputs = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.fullName.trim()) {
            tempErrors.fullName = 'Vui lòng nhập họ và tên';
            isValid = false;
        }

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Email không hợp lệ';
            isValid = false;
        }

        if (!formData.password || formData.password.length < 6) {
            tempErrors.password = 'Mật khẩu phải từ 6 ký tự';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError('');
        setApiSuccess('');

        if (!validateInputs()) return;

        try {
            await axios.post('http://localhost:8080/api/auth/register', {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName
            });

            setApiSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
            setTimeout(() => navigate('/login'), 1400);

        } catch (error) {
            if (error.response && error.response.data) {
                setApiError(error.response.data);
            } else {
                setApiError('Lỗi hệ thống. Vui lòng thử lại sau.');
            }
        }
    };

    return (
        <PageContainer>
            <CssBaseline />
            <ContentWrapper>
                <InfoColumn>
                    <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.1, mb: 1.5 }}>
                        Bắt đầu hành trình học tập
                    </Typography>
                    <Typography sx={{ fontSize: '1.05rem', color: '#5f6d82', mb: 4 }}>
                        Tham gia cùng hàng nghìn học viên để khai phá tiềm năng bản thân thông qua các khóa học thực chiến.
                    </Typography>

                    <FeatureBox>
                        <School sx={{ color: '#0f6fff', fontSize: 28, mt: 0.3, mr: 2 }} />
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>Học từ chuyên gia</Typography>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.92rem' }}>
                                Nội dung được biên soạn bởi những giảng viên hàng đầu.
                            </Typography>
                        </Box>
                    </FeatureBox>

                    <FeatureBox>
                        <WorkspacePremium sx={{ color: '#ff9500', fontSize: 28, mt: 0.3, mr: 2 }} />
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>Chứng chỉ giá trị</Typography>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.92rem' }}>
                                Nhận chứng chỉ để gia tăng cơ hội nghề nghiệp.
                            </Typography>
                        </Box>
                    </FeatureBox>

                    <FeatureBox>
                        <AccessTime sx={{ color: '#18a36d', fontSize: 28, mt: 0.3, mr: 2 }} />
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>Truy cập trọn đời</Typography>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.92rem' }}>
                                Học mọi lúc mọi nơi với nội dung cập nhật thường xuyên.
                            </Typography>
                        </Box>
                    </FeatureBox>
                </InfoColumn>

                <AuthCard>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                        Đăng ký tài khoản
                    </Typography>
                    <Typography sx={{ color: '#64748b', mb: 3 }}>
                        Nhập email và mật khẩu để bắt đầu học ngay hôm nay.
                    </Typography>

                    {apiError && <Alert severity="error">{apiError}</Alert>}
                    {apiSuccess && <Alert severity="success">{apiSuccess}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>

                        <TextField
                            label="Họ và tên"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            error={!!errors.fullName}
                            helperText={errors.fullName}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fff' } }}
                        />

                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fff' } }}
                        />

                        <TextField
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fff' } }}
                        />

                        <TextField
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fff' } }}
                        />

                        <Button type="submit" variant="contained" size="large" sx={{ borderRadius: '12px', py: 1.4, fontWeight: 'bold' }}>
                            Đăng ký ngay
                        </Button>

                    </Box>

                    <Divider sx={{ my: 2 }}>HOẶC</Divider>

                    <Typography sx={{ textAlign: 'center', color: '#64748b' }}>
                        Đã có tài khoản?{' '}
                        <RouterLink to="/login" style={{ color: '#0f6fff', fontWeight: 'bold', textDecoration: 'none' }}>
                            Đăng nhập ngay
                        </RouterLink>
                    </Typography>
                </AuthCard>
            </ContentWrapper>
        </PageContainer>
    );
}