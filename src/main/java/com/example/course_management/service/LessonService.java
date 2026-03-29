package com.example.course_management.service;

import com.example.course_management.dto.LessonRequest;
import com.example.course_management.entity.Course;
import com.example.course_management.entity.Lesson;
import com.example.course_management.repository.CourseRepository;
import com.example.course_management.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    /** Lưu PDF vào uploads/, trả về URL đầy đủ; null nếu không có file */
    public String saveLessonPdf(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String original = file.getOriginalFilename();
        String fileName = System.currentTimeMillis() + "_" + (original != null ? original : "lesson.pdf");
        Path uploadPath = Paths.get("uploads/");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "http://localhost:8080/uploads/" + fileName;
    }

    // 1. Thêm bài giảng mới vào khóa học
    public Lesson createLesson(LessonRequest request) {
        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setChapter(request.getChapter());
        lesson.setContent(request.getContent());

        // ⚠️ LƯU TÁCH BIỆT 2 LINK PDF VÀ VIDEO
        lesson.setDocumentUrl(request.getDocumentUrl());
        lesson.setVideoUrl(request.getVideoUrl());

        // Tìm Course từ ID gửi lên và gắn vào Lesson
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId()).orElse(null);
            lesson.setCourse(course);
        }

        return lessonRepository.save(lesson);
    }

    // 2. Lấy danh sách bài giảng theo ID của Khóa học
    public List<Lesson> getLessonsByCourse(Long courseId) {
        return lessonRepository.findByCourse_Id(courseId);
    }

    // 3. Cập nhật bài giảng (Nhận thêm videoUrl từ Controller)
    public Lesson updateLesson(Long lessonId, String chapter, String title, MultipartFile file, String videoUrl)
            throws IOException {
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            return null;
        }
        if (chapter != null) {
            lesson.setChapter(chapter);
        }
        if (title != null) {
            lesson.setTitle(title);
        }

        // Cập nhật PDF nếu có file tải lên mới
        String newPdfUrl = saveLessonPdf(file);
        if (newPdfUrl != null) {
            lesson.setDocumentUrl(newPdfUrl);
        }

        // Cập nhật Video nếu có link mới
        if (videoUrl != null) {
            lesson.setVideoUrl(videoUrl);
        }

        return lessonRepository.save(lesson);
    }

    // 4. Xóa bài giảng
    public boolean deleteLesson(Long id) {
        if (lessonRepository.existsById(id)) {
            lessonRepository.deleteById(id);
            return true;
        }
        return false;
    }
}