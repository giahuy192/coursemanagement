package com.example.course_management.controller;

import com.example.course_management.dto.LessonRequest;
import com.example.course_management.entity.Lesson;
import com.example.course_management.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin("*")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    // API: Thêm bài giảng mới VÀ UPLOAD FILE PDF + VIDEO
    @PostMapping("/course/{courseId}")
    public ResponseEntity<?> createLesson(
            @PathVariable Long courseId,
            @RequestParam("chapter") String chapter,
            @RequestParam("title") String title,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile) { // NHẬN THÊM VIDEO

        String documentUrl = null;
        String videoUrl = null;

        try {
            // 1. Lưu file PDF
            if (file != null && !file.isEmpty()) {
                documentUrl = lessonService.saveLessonPdf(file);
            }

            // 2. Lưu file Video
            if (videoFile != null && !videoFile.isEmpty()) {
                String videoName = System.currentTimeMillis() + "_vid_" + videoFile.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Files.copy(videoFile.getInputStream(), uploadPath.resolve(videoName),
                        StandardCopyOption.REPLACE_EXISTING);
                videoUrl = "http://localhost:8080/uploads/" + videoName;
            }

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi lưu file: " + e.getMessage());
        }

        // Đóng gói dữ liệu vào DTO
        LessonRequest request = new LessonRequest();
        request.setCourseId(courseId);
        request.setChapter(chapter);
        request.setTitle(title);
        request.setDocumentUrl(documentUrl);
        request.setVideoUrl(videoUrl);

        return ResponseEntity.ok(lessonService.createLesson(request));
    }

    // API: Cập nhật bài giảng (Nhận thêm videoFile)
    @PutMapping(value = "/{lessonId}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateLesson(
            @PathVariable Long lessonId,
            @RequestParam("chapter") String chapter,
            @RequestParam("title") String title,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile) {

        String videoUrl = null;
        try {
            // Xử lý lưu video mới (nếu sếp có chọn upload video đổi lại)
            if (videoFile != null && !videoFile.isEmpty()) {
                String videoName = System.currentTimeMillis() + "_vid_" + videoFile.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Files.copy(videoFile.getInputStream(), uploadPath.resolve(videoName),
                        StandardCopyOption.REPLACE_EXISTING);
                videoUrl = "http://localhost:8080/uploads/" + videoName;
            }

            // Gọi Service để update thông tin (Em truyền thêm videoUrl vào hàm này)
            Lesson updated = lessonService.updateLesson(lessonId, chapter, title, file, videoUrl);

            if (updated == null) {
                return ResponseEntity.badRequest().body("Bài giảng không tồn tại!");
            }
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi lưu file: " + e.getMessage());
        }
    }

    // API: Lấy danh sách bài giảng
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Lesson>> getLessonsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId));
    }

    // API: Xóa bài giảng
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLesson(@PathVariable Long id) {
        if (lessonService.deleteLesson(id)) {
            return ResponseEntity.ok("Đã xóa bài giảng thành công!");
        }
        return ResponseEntity.badRequest().body("Bài giảng không tồn tại!");
    }
}