import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Button, Container, Card, Divider,
    TextField, Grid, IconButton, List, ListItem, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, FormLabel
} from '@mui/material';
import { ArrowBack, Add, Delete, PictureAsPdf, Edit, CloudUpload, OndemandVideo } from '@mui/icons-material';

const API = 'http://localhost:8080';

export default function AdminCurriculum() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [formData, setFormData] = useState({ chapter: '', title: '' });

    // State lưu file
    const [selectedPdfFile, setSelectedPdfFile] = useState(null);
    const [selectedVideoFile, setSelectedVideoFile] = useState(null); // ĐÃ THÊM STATE VIDEO
    const [fileInputKey, setFileInputKey] = useState(0);

    useEffect(() => {
        fetchCourseData();
        fetchLessons();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const res = await axios.get(`${API}/api/courses/${id}`);
            setCourse(res.data);
        } catch (error) {
            console.error("Lỗi lấy khóa học", error);
        }
    };

    const fetchLessons = async () => {
        try {
            const res = await axios.get(`${API}/api/lessons/course/${id}`);
            setLessons(res.data);
        } catch (error) {
            console.error("Lỗi lấy bài học", error);
            setLessons([]);
        }
    };

    const openAddModal = () => {
        setEditingLessonId(null);
        setFormData({ chapter: '', title: '' });
        setSelectedPdfFile(null);
        setSelectedVideoFile(null); // Reset video
        setFileInputKey((k) => k + 1);
        setOpenModal(true);
    };

    const openEditModal = (lesson) => {
        setEditingLessonId(lesson.id);
        setFormData({
            chapter: lesson.chapter || '',
            title: lesson.title || ''
        });
        setSelectedPdfFile(null);
        setSelectedVideoFile(null); // Reset video
        setFileInputKey((k) => k + 1);
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditingLessonId(null);
        setFormData({ chapter: '', title: '' });
        setSelectedPdfFile(null);
        setSelectedVideoFile(null); // Reset video
        setFileInputKey((k) => k + 1);
    };

    const handleSaveLesson = async () => {
        if (!formData.chapter?.trim() || !formData.title?.trim()) {
            alert("Vui lòng nhập tên chương và tên bài học!");
            return;
        }

        const isEdit = editingLessonId != null;
        // Bắt buộc phải có ít nhất 1 file (PDF hoặc Video) khi thêm mới
        if (!isEdit && !selectedPdfFile && !selectedVideoFile) {
            alert("Vui lòng chọn file PDF hoặc Video bài giảng khi thêm bài học mới!");
            return;
        }

        try {
            if (isEdit) {
                const fd = new FormData();
                fd.append('chapter', formData.chapter.trim());
                fd.append('title', formData.title.trim());
                if (selectedPdfFile) fd.append('file', selectedPdfFile);
                if (selectedVideoFile) fd.append('videoFile', selectedVideoFile); // Gửi thêm video

                await axios.put(`${API}/api/lessons/${editingLessonId}`, fd);
                alert("Đã cập nhật bài học!");
            } else {
                const postData = new FormData();
                postData.append('chapter', formData.chapter.trim());
                postData.append('title', formData.title.trim());
                if (selectedPdfFile) postData.append('file', selectedPdfFile);
                if (selectedVideoFile) postData.append('videoFile', selectedVideoFile); // Gửi thêm video

                await axios.post(`${API}/api/lessons/course/${id}`, postData);
                alert("Đã tải bài học lên thành công!");
            }
            closeModal();
            fetchLessons();
        } catch (error) {
            const msg = error.response?.data;
            alert(typeof msg === 'string' ? msg : "Lỗi khi lưu bài học! Kiểm tra backend và console (F12).");
            console.error(error);
        }
    };

    const handleDeleteLesson = async (lesson) => {
        if (!window.confirm(`Xóa bài học "${lesson.title}"? Hành động không hoàn tác.`)) {
            return;
        }
        try {
            await axios.delete(`${API}/api/lessons/${lesson.id}`);
            fetchLessons();
        } catch (error) {
            const msg = error.response?.data;
            alert(typeof msg === 'string' ? msg : "Không xóa được bài học.");
            console.error(error);
        }
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'pdf') {
                setSelectedPdfFile(e.target.files[0]);
            } else if (type === 'video') {
                setSelectedVideoFile(e.target.files[0]);
            }
        }
    };

    const chapters = [...new Set(lessons.map(l => l.chapter || 'Chương trình học'))];

    return (
        <Box sx={{ backgroundColor: '#f4f7f9', minHeight: '100vh', pb: 10 }}>
            <Box sx={{ backgroundColor: '#1e293b', p: 2, color: '#fff', display: 'flex', alignItems: 'center' }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: '#fff' }}>Quay lại</Button>
                <Typography sx={{ ml: 2, fontWeight: 'bold' }}>QUẢN TRỊ NỘI DUNG KHÓA HỌC</Typography>
            </Box>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Card sx={{ p: 4, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                                {course ? course.title : 'Đang tải...'}
                            </Typography>
                            <Typography sx={{ color: '#64748b', mt: 0.5 }}>Cấu trúc chương trình học</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={openAddModal}
                            sx={{ backgroundColor: '#2563eb', fontWeight: 'bold' }}
                        >
                            Thêm bài học
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {lessons.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: '#94a3b8' }}>
                            <Typography>Chưa có bài học nào. Hãy bấm &quot;Thêm bài học&quot; để bắt đầu.</Typography>
                        </Box>
                    ) : (
                        <Box>
                            {chapters.map((chap, index) => (
                                <Box key={index} sx={{ mb: 3, border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Box sx={{ backgroundColor: '#f8fafc', p: 2, borderBottom: '1px solid #e2e8f0' }}>
                                        <Typography sx={{ fontWeight: 'bold', color: '#334155' }}>{chap}</Typography>
                                    </Box>
                                    <List disablePadding>
                                        {lessons.filter(l => (l.chapter || 'Chương trình học') === chap).map((lesson) => (
                                            <ListItem
                                                key={lesson.id}
                                                divider
                                                secondaryAction={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <IconButton color="primary" aria-label="sửa" onClick={() => openEditModal(lesson)}>
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton color="error" aria-label="xóa" onClick={() => handleDeleteLesson(lesson)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </Box>
                                                }
                                                sx={{ px: 3, py: 2, pr: 12 }}
                                            >
                                                <PictureAsPdf sx={{ color: lesson.documentUrl ? '#dc2626' : '#cbd5e1', mr: 2 }} />
                                                <OndemandVideo sx={{ color: lesson.videoUrl ? '#2563eb' : '#cbd5e1', mr: 2 }} />
                                                <ListItemText
                                                    primary={<Typography sx={{ fontWeight: 'bold', color: '#1e2937' }}>{lesson.title}</Typography>}
                                                    secondary={
                                                        <React.Fragment>
                                                            <span style={{ color: lesson.documentUrl ? '#dc2626' : '#94a3b8' }}>{lesson.documentUrl ? 'Có PDF' : 'Không có PDF'}</span>
                                                            <span style={{ margin: '0 8px' }}>|</span>
                                                            <span style={{ color: lesson.videoUrl ? '#2563eb' : '#94a3b8' }}>{lesson.videoUrl ? 'Có Video' : 'Không có Video'}</span>
                                                        </React.Fragment>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Card>
            </Container>

            {/* MODAL THÊM / SỬA BÀI HỌC */}
            <Dialog open={openModal} onClose={closeModal} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                    {editingLessonId != null ? 'Sửa bài học / tài liệu' : 'Thêm tài liệu mới'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Tên Chương"
                                placeholder="VD: Chủ đề 01: Hàm số"
                                value={formData.chapter}
                                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Tên Bài học"
                                placeholder="VD: Lý thuyết sự đồng biến"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Grid>

                        {/* --- KHU VỰC UPLOAD PDF --- */}
                        <Grid item xs={12}>
                            <FormLabel sx={{ display: 'block', mb: 1, color: '#333', fontWeight: 'bold' }}>
                                {editingLessonId != null ? 'Đổi file PDF (tùy chọn)' : 'Tải file tài liệu (*.pdf)'}
                            </FormLabel>
                            {editingLessonId != null && (
                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1 }}>
                                    Bỏ trống nếu giữ nguyên file hiện tại.
                                </Typography>
                            )}
                            <input
                                key={`pdf-${fileInputKey}`}
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                id="upload-pdf-button"
                                type="file"
                                onChange={(e) => handleFileChange(e, 'pdf')}
                            />
                            <label htmlFor="upload-pdf-button">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                    startIcon={<CloudUpload />}
                                    sx={{ height: '56px', textTransform: 'none', borderStyle: 'dashed', borderWidth: '2px', borderColor: selectedPdfFile ? '#dc2626' : '#cbd5e1', color: selectedPdfFile ? '#dc2626' : '#64748b' }}
                                >
                                    {selectedPdfFile ? `Đã chọn PDF: ${selectedPdfFile.name}` : 'Bấm để chọn file PDF'}
                                </Button>
                            </label>
                        </Grid>

                        {/* --- KHU VỰC UPLOAD VIDEO --- */}
                        <Grid item xs={12}>
                            <FormLabel sx={{ display: 'block', mb: 1, color: '#333', fontWeight: 'bold' }}>
                                {editingLessonId != null ? 'Đổi Video bài giảng (tùy chọn)' : 'Tải Video bài giảng (*.mp4)'}
                            </FormLabel>
                            {editingLessonId != null && (
                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1 }}>
                                    Bỏ trống nếu giữ nguyên video hiện tại.
                                </Typography>
                            )}
                            <input
                                key={`video-${fileInputKey}`}
                                accept="video/mp4,video/webm,video/*"
                                style={{ display: 'none' }}
                                id="upload-video-button"
                                type="file"
                                onChange={(e) => handleFileChange(e, 'video')}
                            />
                            <label htmlFor="upload-video-button">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                    startIcon={<OndemandVideo />}
                                    sx={{ height: '56px', textTransform: 'none', borderStyle: 'dashed', borderWidth: '2px', borderColor: selectedVideoFile ? '#2563eb' : '#cbd5e1', color: selectedVideoFile ? '#2563eb' : '#64748b' }}
                                >
                                    {selectedVideoFile ? `Đã chọn Video: ${selectedVideoFile.name}` : 'Bấm để chọn file Video'}
                                </Button>
                            </label>
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={closeModal} color="inherit">Hủy</Button>
                    <Button onClick={handleSaveLesson} variant="contained" sx={{ backgroundColor: '#2563eb' }}>
                        {editingLessonId != null ? 'Cập nhật' : 'Tải lên hệ thống'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}