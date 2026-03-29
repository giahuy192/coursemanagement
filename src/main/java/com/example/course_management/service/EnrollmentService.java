package com.example.course_management.service;

import com.example.course_management.dto.EnrollmentRequest;
import com.example.course_management.entity.Course;
import com.example.course_management.entity.Enrollment;
import com.example.course_management.entity.Student;
import com.example.course_management.repository.CourseRepository;
import com.example.course_management.repository.EnrollmentRepository;
import com.example.course_management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    // 1. Đăng ký khóa học
    public String enrollCourse(EnrollmentRequest request) {
        Student student = studentRepository.findByUser_Email(request.getEmail());
        Course course = courseRepository.findById(request.getCourseId()).orElse(null);

        if (student == null || course == null) {
            return "Học viên hoặc Khóa học không tồn tại!";
        }

        if (enrollmentRepository.existsByStudent_IdAndCourse_Id(student.getId(), course.getId())) {
            return "Bạn đã đăng ký khóa học này rồi!";
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setStatus("ACTIVE");

        enrollmentRepository.save(enrollment);
        return "Đăng ký khóa học thành công!";
    }

    // 2. Lấy danh sách đăng ký theo ID
    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudent_Id(studentId);
    }

    // 3. --- GIẢI PHÁP CHỐNG SẬP API: ĐÓNG GÓI THỦ CÔNG ---
    public List<Map<String, Object>> getMyCoursesByEmail(String email) {
        Student student = studentRepository.findByUser_Email(email);

        if (student == null) {
            return new ArrayList<>(); // Rỗng
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudent_Id(student.getId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (Enrollment e : enrollments) {
            Course c = e.getCourse();
            if (c != null) {
                // Nhặt đúng 3 cái thông tin cần thiết nhét vào hộp gửi đi
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("title", c.getTitle());
                map.put("imageUrl", c.getImageUrl());
                result.add(map);
            }
        }
        return result;
    }

    public List<Enrollment> getEnrollmentsByCourseId(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }
}