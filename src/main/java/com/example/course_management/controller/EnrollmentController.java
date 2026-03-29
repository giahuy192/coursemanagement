package com.example.course_management.controller;

import com.example.course_management.dto.EnrollmentRequest;
import com.example.course_management.entity.Enrollment;
import com.example.course_management.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin("*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<String> enrollCourse(@RequestBody EnrollmentRequest request) {
        String result = enrollmentService.enrollCourse(request);
        if (result.equals("Đăng ký khóa học thành công!")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    // --- API TÌM KHÓA HỌC CHO FRONTEND ---
    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCoursesByEmail(@RequestParam String email) {
        try {
            return ResponseEntity.ok(enrollmentService.getMyCoursesByEmail(email));
        } catch (Exception e) {
            // IN LỖI RA ĐỂ BẮT MẠCH NẾU LẠI XỊT
            System.out.println("LỖI API MY-COURSES: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách khóa học!");
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourseId(courseId));
    }
}