import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Button, Grid, CssBaseline, CircularProgress,
    List, ListItem, ListItemButton, ListItemText, Divider,
    Chip
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ArrowBack, Download, MenuBook, PictureAsPdf, ErrorOutline, PlayCircleOutline } from '@mui/icons-material';

const theme = createTheme({
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        button: { textTransform: 'none' }
    },
    palette: {
        background: { default: '#f4f7f9' }
    }
});

export default function LearnCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);

    /** Chuẩn hóa URL tài liệu/video */
    const resolveFileUrl = (url) => {
        if (!url || typeof url !== 'string') return '';
        const t = url.trim();
        if (t.startsWith('http://') || t.startsWith('https://')) return t;
        if (t.startsWith('/')) return t;
        return `http://localhost:8080/uploads/${t}`; // Đề phòng lỗi thiếu domain
    };

    /** Lấy đúng biến từ Backend trả về */
    const mapLessonsForUi = (rows) =>
        (rows || []).map((l) => {
            const chap = (l.chapter && String(l.chapter).trim()) ? String(l.chapter).trim() : 'Chương trình học';
            return {
                id: l.id,
                chapter: chap,
                title: l.title || 'Bài học',
                // ⚠️ MAP ĐÚNG HAI BIẾN ĐÃ THÊM Ở BACKEND
                documentUrl: resolveFileUrl(l.documentUrl),
                videoUrl: resolveFileUrl(l.videoUrl)
            };
        });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const courseRes = await axios.get(`http://localhost:8080/api/courses/${id}`);
                setCourse(courseRes.data);
            } catch (error) {
                console.error("Lỗi khi tải khóa học:", error);
                setCourse(null);
                setLoading(false);
                return;
            }
            try {
                const lessonsRes = await axios.get(`http://localhost:8080/api/lessons/course/${id}`);
                const mapped = mapLessonsForUi(lessonsRes.data);
                setLessons(mapped);
                setActiveLesson(mapped.length > 0 ? mapped[0] : null);
            } catch (error) {
                console.error("Lỗi khi tải danh sách bài học:", error);
                setLessons([]);
                setActiveLesson(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const chapters = [...new Set(lessons.map(lesson => lesson.chapter))];

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!course) return <Typography align="center" sx={{ mt: 10 }}>Không tìm thấy khóa học!</Typography>;

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <CssBaseline />

                {/* TOP BAR */}
                <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', px: 3, height: '60px', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/my-courses')} sx={{ color: '#1e3a8a', fontWeight: 600, mr: 3 }}>
                        KHÓA HỌC CỦA TÔI
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ my: 1.5, mr: 3 }} />
                    <Typography sx={{ fontWeight: 600, color: '#475569', flexGrow: 1, fontSize: '0.95rem' }}>
                        {course.title.toUpperCase()}
                    </Typography>
                </Box>

                {/* MAIN LAYOUT */}
                <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                    <Grid container sx={{ height: '100%', flexWrap: 'nowrap' }}>

                        {/* ===== CỘT TRÁI: DANH SÁCH CHƯƠNG & BÀI HỌC ===== */}
                        <Grid item sx={{ width: '320px', minWidth: '320px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 2, boxShadow: '2px 0 10px rgba(0,0,0,0.02)' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <Typography sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem' }}>Nội dung khóa học</Typography>
                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.5 }}>{lessons.length} bài học</Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {lessons.length > 0 ? (
                                    chapters.map((chapterName, idx) => (
                                        <Box key={idx} sx={{ mb: 1 }}>
                                            <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', textAlign: 'left' }}>{chapterName}</Typography>
                                            </Box>
                                            <List disablePadding>
                                                {lessons.filter(l => l.chapter === chapterName).map(lesson => (
                                                    <ListItem disablePadding key={lesson.id}>
                                                        <ListItemButton
                                                            selected={activeLesson?.id === lesson.id}
                                                            onClick={() => setActiveLesson(lesson)}
                                                            sx={{
                                                                py: 1.5, pl: 2, pr: 2,
                                                                '&.Mui-selected': { backgroundColor: '#eff6ff', borderLeft: '3px solid #2563eb' },
                                                                '&:hover': { backgroundColor: '#f1f5f9' }
                                                            }}
                                                        >
                                                            {lesson.videoUrl ? (
                                                                <PlayCircleOutline sx={{ mr: 1.5, fontSize: '1.2rem', color: activeLesson?.id === lesson.id ? '#2563eb' : '#94a3b8' }} />
                                                            ) : (
                                                                <PictureAsPdf sx={{ mr: 1.5, fontSize: '1.2rem', color: activeLesson?.id === lesson.id ? '#dc2626' : '#94a3b8' }} />
                                                            )}

                                                            <ListItemText
                                                                primary={
                                                                    <Typography sx={{
                                                                        fontWeight: activeLesson?.id === lesson.id ? 600 : 400,
                                                                        color: activeLesson?.id === lesson.id ? '#1e40af' : '#475569',
                                                                        fontSize: '0.85rem',
                                                                        textAlign: 'left'
                                                                    }}>
                                                                        {lesson.title}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu bài học.</Box>
                                )}
                            </Box>
                        </Grid>

                        {/* ===== CỘT PHẢI: KHUNG ĐỌC PDF & XEM VIDEO ===== */}
                        <Grid item sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f9', position: 'relative' }}>
                            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', width: '100%', margin: '0 auto' }}> {/* Tăng max-width để xem phim cho sướng */}

                                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 1, fontSize: { xs: '1.4rem', md: '1.75rem' }, letterSpacing: '-0.5px' }}>
                                            {activeLesson ? activeLesson.title : "Đang cập nhật..."}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            {activeLesson?.videoUrl && <Chip icon={<PlayCircleOutline sx={{ fontSize: '1rem' }} />} label="BÀI GIẢNG VIDEO" size="small" sx={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: 600, fontSize: '0.75rem', px: 1 }} />}
                                            {activeLesson?.documentUrl && <Chip icon={<MenuBook sx={{ fontSize: '1rem' }} />} label="TÀI LIỆU PDF" size="small" sx={{ backgroundColor: '#fce7f3', color: '#be185d', fontWeight: 600, fontSize: '0.75rem', px: 1 }} />}
                                        </Box>
                                    </Box>

                                    {activeLesson?.documentUrl && (
                                        <Button variant="contained" startIcon={<Download />} href={activeLesson.documentUrl.split('#')[0]} target="_blank" download sx={{ backgroundColor: '#2563eb', fontWeight: 600, px: 3, py: 1.2, boxShadow: 'none' }}>
                                            Tải tài liệu PDF
                                        </Button>
                                    )}
                                </Box>

                                {/* ===== TRÌNH PHÁT VIDEO ===== */}
                                {activeLesson?.videoUrl && (
                                    <Box sx={{ width: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', mb: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                        <video
                                            controls
                                            width="100%"
                                            style={{ display: 'block', maxHeight: '70vh', outline: 'none' }}
                                            src={activeLesson.videoUrl}
                                            controlsList="nodownload"
                                        >
                                            Trình duyệt của bạn không hỗ trợ thẻ video.
                                        </video>
                                    </Box>
                                )}

                                {/* ===== KHUNG ĐỌC PDF ===== */}
                                {activeLesson?.documentUrl && (
                                    <Box sx={{
                                        width: '100%',
                                        height: activeLesson.videoUrl ? '600px' : '85vh', // Nếu có cả Video ở trên thì PDF ngắn lại, nếu ko có video thì PDF dài ra
                                        backgroundColor: '#e2e8f0',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid #cbd5e1',
                                        mb: 4,
                                        boxShadow: activeLesson.videoUrl ? 'none' : '0 10px 30px rgba(0,0,0,0.05)'
                                    }}>
                                        <iframe
                                            src={activeLesson.documentUrl}
                                            width="100%"
                                            height="100%"
                                            title={activeLesson.title}
                                            style={{ border: 'none' }}
                                        ></iframe>
                                    </Box>
                                )}

                                {/* ===== TRẠNG THÁI TRỐNG ===== */}
                                {activeLesson && !activeLesson.videoUrl && !activeLesson.documentUrl && (
                                    <Box sx={{ textAlign: 'center', color: '#64748b', py: 10, backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                        <ErrorOutline sx={{ fontSize: '4rem', color: '#94a3b8', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Nội dung bài học đang được cập nhật.</Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>Giảng viên chưa tải lên Video hay PDF cho bài học này.</Typography>
                                    </Box>
                                )}

                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </ThemeProvider>
    );
}