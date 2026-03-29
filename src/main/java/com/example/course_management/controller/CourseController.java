package com.example.course_management.controller;

import com.example.course_management.dto.CourseRequest;
import com.example.course_management.entity.Course;
import com.example.course_management.service.CourseService;
import com.example.course_management.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin("*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private FileStorageService fileStorageService;

    // 1. Lấy tất cả khóa học (Dùng cho Admin/Trang chủ)
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // 2. Lấy chi tiết 1 khóa học
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        return course != null ? ResponseEntity.ok(course) : ResponseEntity.notFound().build();
    }

    // 3. --- MỚI --- Lấy khóa học theo Môn học (Dùng cho Học viên lọc Toán, Lý,
    // Hóa...)
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Course>> getCoursesBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(courseService.getCoursesBySubject(subjectId));
    }

    // 4. --- MỚI --- Lấy khóa học theo ID của USER (Dùng cho Giảng viên xem lớp
    // mình dạy)
    @GetMapping("/teacher-user/{userId}")
    public ResponseEntity<List<Course>> getCoursesByTeacherUser(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.getCoursesByTeacherUserId(userId));
    }

    // 5. Thêm khóa học mới (Admin)
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createCourse(
            @ModelAttribute CourseRequest request,
            @RequestParam(value = "imageFile", required = false) MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                String filename = fileStorageService.save(file);
                request.setImageUrl(filename);
            }
            Course newCourse = courseService.createCourse(request);
            return ResponseEntity.ok(newCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo khóa học: " + e.getMessage());
        }
    }

    // 6. --- MỚI --- Cập nhật khóa học (Admin sửa tên, giá, đổi giáo viên...)
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @ModelAttribute CourseRequest request,
            @RequestParam(value = "imageFile", required = false) MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                String filename = fileStorageService.save(file);
                request.setImageUrl(filename);
            }
            return ResponseEntity.ok(courseService.updateCourse(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi cập nhật: " + e.getMessage());
        }
    }

    // 7. Xóa khóa học (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        if (courseService.deleteCourse(id)) {
            return ResponseEntity.ok("Đã xóa khóa học thành công!");
        }
        return ResponseEntity.badRequest().body("Khóa học không tồn tại hoặc đang có học sinh đăng ký!");
    }
}