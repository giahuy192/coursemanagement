package com.example.course_management.service;

import com.example.course_management.dto.CourseRequest;
import com.example.course_management.entity.Course;
import com.example.course_management.entity.Subject;
import com.example.course_management.entity.Teacher;
import com.example.course_management.repository.CourseRepository;
import com.example.course_management.repository.EnrollmentRepository;
import com.example.course_management.repository.SubjectRepository;
import com.example.course_management.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    // 1. Lấy danh sách tất cả khóa học
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // 2. Tìm khóa học theo ID
    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    // 3. --- MỚI --- Lấy khóa học theo Môn học (Toán, Lý, Hóa...)
    public List<Course> getCoursesBySubject(Long subjectId) {
        return courseRepository.findBySubjectId(subjectId);
    }

    // 4. --- MỚI --- Lấy khóa học theo User ID của giáo viên
    public List<Course> getCoursesByTeacherUserId(Long userId) {
        return courseRepository.findByTeacherUserId(userId);
    }

    // 5. Thêm khóa học mới
    public Course createCourse(CourseRequest request) {
        Course course = new Course();
        return saveOrUpdate(course, request);
    }

    // 6. --- MỚI --- Cập nhật khóa học (Admin sửa trên web)
    public Course updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course != null) {
            return saveOrUpdate(course, request);
        }
        return null;
    }

    // Hàm bổ trợ để dùng chung logic cho Thêm và Sửa
    private Course saveOrUpdate(Course course, CourseRequest request) {
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());

        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course.setStartTime(request.getStartTime());
        course.setEndTime(request.getEndTime());

        // Chỉ cập nhật ảnh nếu sếp có chọn file mới (imageUrl không null)
        if (request.getImageUrl() != null) {
            course.setImageUrl(request.getImageUrl());
        }

        // Tìm Môn học
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId()).orElse(null);
            course.setSubject(subject);
        }

        // Tìm Giảng viên
        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId()).orElse(null);
            course.setTeacher(teacher);
        }

        return courseRepository.save(course);
    }

    // 7. Xóa khóa học
    public boolean deleteCourse(Long id) {
        if (courseRepository.existsById(id)) {
            // 1. Dọn dẹp: Đuổi hết học viên ra khỏi lớp trước (Xóa ở bảng enrollments)
            enrollmentRepository.deleteByCourse_Id(id);

            // 2. An toàn rồi mới Xóa khóa học
            courseRepository.deleteById(id);
            return true;
        }
        return false;
    }
}