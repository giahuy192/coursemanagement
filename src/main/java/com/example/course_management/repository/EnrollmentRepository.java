package com.example.course_management.repository;

import com.example.course_management.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 1. Tìm theo Email học viên
    List<Enrollment> findByStudent_User_Email(String email);

    // 2. Tìm theo ID học viên
    List<Enrollment> findByStudent_Id(Long studentId);

    // 3. Kiểm tra đã đăng ký chưa (theo khóa ngoại student_id, course_id)
    boolean existsByStudent_IdAndCourse_Id(Long studentId, Long courseId);

    // 4. CHÍNH LÀ NÓ ĐÂY: Hàm xóa để fix lỗi đỏ bên CourseService
    @Modifying
    @Transactional
    void deleteByCourse_Id(Long courseId);

    List<Enrollment> findByCourseId(Long courseId);
}
