import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Button, Card,
    Divider, CircularProgress, Alert, Snackbar, Paper, Grid, TextField, Radio, RadioGroup, FormControlLabel,
    Dialog, DialogContent // <-- Đã thêm Dialog để làm Popup
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QrCode2, CheckCircle, ArrowBack, Person, PhoneIphone, AccountBalance, CreditCard, AccountBalanceWallet, Lock } from '@mui/icons-material';

const theme = createTheme({
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        button: { textTransform: 'none' }
    },
});

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();

    const { courseId, courseTitle, price, imageUrl } = location.state || {};

    const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });
    const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bank');

    // --- STATE CHO CỔNG THANH TOÁN ẢO ---
    // 0: Không hiện, 1: Đang kết nối, 2: Đang xử lý, 3: Thành công
    const [paymentStep, setPaymentStep] = useState(0);

    const userEmail = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName') || 'Học viên HHB';

    useEffect(() => {
        if (!courseId || !userEmail) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8080/api/enrollments/my-courses?email=${encodeURIComponent(userEmail)}`
                );
                if (!cancelled) {
                    const list = res.data || [];
                    setAlreadyEnrolled(list.some((c) => String(c.id) === String(courseId)));
                }
            } catch {
                if (!cancelled) setAlreadyEnrolled(false);
            }
        })();
        return () => { cancelled = true; };
    }, [courseId, userEmail]);

    if (!courseId) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ mt: 10, textAlign: 'center' }}>
                    <Typography variant="h5">Không có thông tin đơn hàng!</Typography>
                    <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/home')}>Về trang chủ</Button>
                </Box>
            </ThemeProvider>
        );
    }

    const handleConfirmPayment = () => {
        if (alreadyEnrolled) {
            setAlertInfo({ open: true, message: "Bạn đã đăng ký khóa học này rồi.", severity: "info" });
            return;
        }
        setPaymentStep(1); // Bước 1: Hiện popup kết nối

        setTimeout(() => {
            setPaymentStep(2); // Bước 2: Báo đang xử lý giao dịch

            setTimeout(async () => {
                // Bước 3: Đã xử lý xong ảo, tiến hành gọi API thật để lưu DB
                try {
                    const response = await axios.post('http://localhost:8080/api/enrollments', {
                        email: userEmail,
                        courseId: courseId
                    });
                    if (response.status === 200) {
                        setPaymentStep(3); // Bước 4: Hiện dấu tích xanh thành công

                        setTimeout(() => {
                            setPaymentStep(0); // Đóng popup
                            navigate('/my-courses'); // Chuyển trang
                        }, 2000); // Chờ 2 giây cho user nhìn sướng mắt
                    }
                } catch (error) {
                    setPaymentStep(0); // Lỗi thì đóng popup
                    if (error.response && error.response.data) {
                        setAlertInfo({ open: true, message: error.response.data, severity: "warning" });
                    } else {
                        setAlertInfo({ open: true, message: "Lỗi kết nối server!", severity: "error" });
                    }
                }
            }, 2000); // Giả lập ngân hàng xử lý mất 2s
        }, 1500); // Giả lập kết nối mạng mất 1.5s
    };

    const displayImage = imageUrl && !imageUrl.startsWith('http')
        ? `http://localhost:8080/uploads/${imageUrl}`
        : (imageUrl || 'https://via.placeholder.com/600x300');

    const finalPrice = price || 0;
    const subTotal = finalPrice > 0 ? finalPrice + 150000 : 0;
    const discount = subTotal - finalPrice;

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, backgroundColor: '#f8fafc', minHeight: '100vh', pb: 6 }}>

                <Snackbar open={alertInfo.open} autoHideDuration={3000}
                    onClose={() => setAlertInfo({ ...alertInfo, open: false })}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert severity={alertInfo.severity} sx={{ width: '100%' }}>{alertInfo.message}</Alert>
                </Snackbar>

                {/* --- POPUP CỔNG THANH TOÁN ẢO --- */}
                <Dialog open={paymentStep > 0} disableEscapeKeyDown PaperProps={{ sx: { borderRadius: '16px', minWidth: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }}>
                    <DialogContent sx={{ textAlign: 'center', py: 5, px: 3 }}>
                        {paymentStep === 1 && (
                            <Box sx={{ animation: 'fadeIn 0.5s' }}>
                                <CircularProgress size={56} thickness={4.5} sx={{ color: '#2563eb', mb: 3 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>Đang kết nối cổng thanh toán...</Typography>
                                <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', mt: 1 }}>Vui lòng giữ nguyên màn hình</Typography>
                            </Box>
                        )}
                        {paymentStep === 2 && (
                            <Box sx={{ animation: 'fadeIn 0.5s' }}>
                                <CircularProgress size={56} thickness={4.5} sx={{ color: paymentMethod === 'ewallet' ? '#d946ef' : paymentMethod === 'card' ? '#10b981' : '#2563eb', mb: 3 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>Đang xử lý giao dịch...</Typography>
                                <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', mt: 1 }}>Hệ thống đang xác nhận khoản tiền của bạn</Typography>
                            </Box>
                        )}
                        {paymentStep === 3 && (
                            <Box sx={{ animation: 'fadeIn 0.5s' }}>
                                <CheckCircle sx={{ fontSize: 72, color: '#10b981', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: '900', color: '#065f46' }}>Thanh toán thành công!</Typography>
                                <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', mt: 1 }}>Khóa học đã được thêm vào tài khoản của bạn.</Typography>
                                <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', mt: 3, fontStyle: 'italic' }}>Đang tự động chuyển hướng...</Typography>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

                {/* HEADER */}
                <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', py: 1.5, mb: 3, display: 'flex', alignItems: 'center', px: { xs: 2, md: 4 } }}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}
                        sx={{ fontWeight: 'bold', color: '#4b5563', fontSize: '0.85rem' }}>
                        Quay lại
                    </Button>
                </Box>

                {/* FULL WIDTH WRAPPER */}
                <Box sx={{ px: { xs: 2, md: 4 } }}>
                    <Typography variant="h5" sx={{ fontWeight: '900', color: '#1e3a8a', mb: 0.5 }}>
                        Hoàn tất thanh toán
                    </Typography>
                    <Typography sx={{ color: '#6b7280', mb: 3, fontSize: '0.9rem' }}>
                        Vui lòng kiểm tra kỹ thông tin đơn hàng của bạn.
                    </Typography>

                    {alreadyEnrolled && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Bạn đã đăng ký khóa học này. Không cần thanh toán lại — vào &quot;Khóa học của tôi&quot; hoặc trang học để tiếp tục.
                        </Alert>
                    )}

                    {/* 2 CỘT NGANG: trái 60% | phải 40% */}
                    <Grid container spacing={3} alignItems="flex-start">

                        {/* ===== CỘT TRÁI ===== */}
                        <Grid item xs={12} md={7}>

                            {/* 1. Thông tin người mua */}
                            <Card sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 2, display: 'flex', alignItems: 'center', color: '#1a1a1a' }}>
                                    <Person sx={{ color: '#2563eb', mr: 1, fontSize: '1.2rem' }} /> Thông tin người mua
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Họ và tên" fullWidth defaultValue={fullName}
                                            InputProps={{ readOnly: true }} variant="filled" size="small" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Số điện thoại" fullWidth defaultValue="0901234567"
                                            variant="filled" size="small" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField label="Email" fullWidth defaultValue={userEmail}
                                            InputProps={{ readOnly: true }} variant="filled" size="small" />
                                    </Grid>
                                </Grid>
                            </Card>

                            {/* 2. Phương thức thanh toán */}
                            <Card sx={{ p: 3, borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #edf2f7' }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 2, display: 'flex', alignItems: 'center', color: '#1a1a1a' }}>
                                    <AccountBalanceWallet sx={{ color: '#2563eb', mr: 1, fontSize: '1.2rem' }} /> Phương thức thanh toán
                                </Typography>

                                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    {/* Chuyển khoản */}
                                    <Paper elevation={0} onClick={() => setPaymentMethod('bank')} sx={{
                                        border: paymentMethod === 'bank' ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                        backgroundColor: paymentMethod === 'bank' ? '#eff6ff' : '#fff',
                                        borderRadius: '8px', p: 2, mb: 1.5,
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer', transition: '0.2s'
                                    }}>
                                        <FormControlLabel value="bank" control={<Radio color="primary" size="small" />} label={
                                            <Box>
                                                <Typography sx={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.9rem' }}>Chuyển khoản ngân hàng</Typography>
                                                <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>Thanh toán nhanh qua mã QR hoặc Internet Banking</Typography>
                                            </Box>
                                        } />
                                        <AccountBalance sx={{ color: '#9ca3af', fontSize: '1.3rem', flexShrink: 0 }} />
                                    </Paper>

                                    {/* Thẻ */}
                                    <Paper elevation={0} onClick={() => setPaymentMethod('card')} sx={{
                                        border: paymentMethod === 'card' ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                        backgroundColor: paymentMethod === 'card' ? '#eff6ff' : '#fff',
                                        borderRadius: '8px', p: 2, mb: 1.5,
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer', transition: '0.2s'
                                    }}>
                                        <FormControlLabel value="card" control={<Radio color="primary" size="small" />} label={
                                            <Box>
                                                <Typography sx={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.9rem' }}>Thẻ ATM / Visa / Mastercard</Typography>
                                                <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>Hỗ trợ tất cả ngân hàng nội địa và quốc tế</Typography>
                                            </Box>
                                        } />
                                        <CreditCard sx={{ color: '#9ca3af', fontSize: '1.3rem', flexShrink: 0 }} />
                                    </Paper>

                                    {/* Ví điện tử */}
                                    <Paper elevation={0} onClick={() => setPaymentMethod('ewallet')} sx={{
                                        border: paymentMethod === 'ewallet' ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                        backgroundColor: paymentMethod === 'ewallet' ? '#eff6ff' : '#fff',
                                        borderRadius: '8px', p: 2,
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer', transition: '0.2s'
                                    }}>
                                        <FormControlLabel value="ewallet" control={<Radio color="primary" size="small" />} label={
                                            <Box>
                                                <Typography sx={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.9rem' }}>Ví điện tử (MoMo, ZaloPay)</Typography>
                                                <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>Xử lý tức thì qua ứng dụng di động</Typography>
                                            </Box>
                                        } />
                                        <PhoneIphone sx={{ color: '#9ca3af', fontSize: '1.3rem', flexShrink: 0 }} />
                                    </Paper>
                                </RadioGroup>
                            </Card>
                        </Grid>

                        {/* ===== CỘT PHẢI ===== */}
                        <Grid item xs={12} md={5}>
                            <Box sx={{ position: 'sticky', top: 16 }}>

                                {/* Card tổng kết đơn hàng */}
                                <Card sx={{ borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', overflow: 'hidden', mb: 2, border: '1px solid #edf2f7' }}>

                                    {/* ẢNH KHOÁ HỌC */}
                                    <Box sx={{ width: '100%', height: '170px', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={displayImage}
                                            alt={courseTitle}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                        <Box sx={{
                                            position: 'absolute', bottom: 10, left: 10,
                                            backgroundColor: 'rgba(37, 99, 235, 0.88)',
                                            color: '#fff', px: 1.5, py: 0.4,
                                            borderRadius: '5px', fontSize: '0.7rem', fontWeight: 'bold'
                                        }}>
                                            KHÓA HỌC CHUYÊN SÂU
                                        </Box>
                                    </Box>

                                    <Box sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 'bold', color: '#1f2937', mb: 2.5, lineHeight: 1.4, fontSize: '0.95rem' }}>
                                            {courseTitle}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Typography sx={{ color: '#4b5563', fontSize: '0.88rem' }}>Tạm tính</Typography>
                                            <Typography sx={{ color: '#4b5563', fontSize: '0.88rem' }}>
                                                {subTotal > 0 ? subTotal.toLocaleString('vi-VN') + 'đ' : '0đ'}
                                            </Typography>
                                        </Box>

                                        {discount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                <Typography sx={{ color: '#d97706', fontSize: '0.88rem' }}>🔖 Giảm giá (Ưu đãi mới)</Typography>
                                                <Typography sx={{ color: '#d97706', fontSize: '0.88rem' }}>-{discount.toLocaleString('vi-VN')}đ</Typography>
                                            </Box>
                                        )}

                                        <Divider sx={{ borderStyle: 'dashed', my: 2, borderColor: '#cbd5e1' }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography sx={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>Tổng thanh toán</Typography>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h5" sx={{ color: '#2563eb', fontWeight: '900', lineHeight: 1.2 }}>
                                                    {finalPrice > 0 ? finalPrice.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>Đã bao gồm thuế VAT</Typography>
                                            </Box>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            fullWidth
                                            disabled={paymentStep > 0 || alreadyEnrolled}
                                            onClick={handleConfirmPayment}
                                            sx={{
                                                py: 1.5, backgroundColor: '#2563eb',
                                                fontSize: '1rem', fontWeight: 'bold',
                                                borderRadius: '8px',
                                                '&:hover': { backgroundColor: '#1d4ed8' },
                                                mb: 1.5
                                            }}
                                        >
                                            {paymentStep > 0 ? <CircularProgress size={22} color="inherit" /> : alreadyEnrolled ? 'Đã đăng ký' : 'Thanh toán ngay →'}
                                        </Button>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', opacity: 0.55 }}>
                                            <Typography sx={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center' }}>
                                                <Lock sx={{ fontSize: '0.95rem', mr: 0.5 }} /> SSL Secure
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>

                                {/* Mã giảm giá */}
                                <Card sx={{ p: 2.5, borderRadius: '10px', border: '1px dashed #cbd5e1', boxShadow: 'none' }}>
                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#4b5563', mb: 1.2 }}>
                                        MÃ GIẢM GIÁ (COUPON)
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField placeholder="Nhập mã tại đây..." size="small" fullWidth
                                            sx={{ backgroundColor: '#f8fafc' }} />
                                        <Button variant="contained"
                                            sx={{ backgroundColor: '#1f2937', color: '#fff', '&:hover': { backgroundColor: '#111827' }, fontWeight: 'bold', px: 2.5, whiteSpace: 'nowrap' }}>
                                            Áp dụng
                                        </Button>
                                    </Box>
                                </Card>

                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </ThemeProvider>
    );
}