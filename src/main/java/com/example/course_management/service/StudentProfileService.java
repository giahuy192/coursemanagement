package com.example.course_management.service;

import com.example.course_management.dto.StudentProfileResponse;
import com.example.course_management.dto.StudentProfileUpdateRequest;
import com.example.course_management.entity.Student;
import com.example.course_management.entity.User;
import com.example.course_management.repository.StudentRepository;
import com.example.course_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProfileService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    public StudentProfileResponse getProfileByEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        Student student = studentRepository.findByUser_Email(email.trim());
        if (student == null || student.getUser() == null) {
            return null;
        }
        User u = student.getUser();
        String role = u.getRole() != null ? u.getRole() : "";
        if (!role.toUpperCase().contains("STUDENT")) {
            return null;
        }
        StudentProfileResponse r = new StudentProfileResponse();
        r.setStudentId(student.getId());
        r.setEmail(u.getEmail());
        r.setFullName(u.getFullName());
        r.setPhone(student.getPhone());
        r.setAddress(student.getAddress());
        r.setRole(u.getRole());
        return r;
    }

    @Transactional
    public String updateProfile(StudentProfileUpdateRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return "Thiếu email!";
        }
        Student student = studentRepository.findByUser_Email(req.getEmail().trim());
        if (student == null || student.getUser() == null) {
            return "Không tìm thấy hồ sơ học viên!";
        }
        User u = student.getUser();
        String role = u.getRole() != null ? u.getRole() : "";
        if (!role.toUpperCase().contains("STUDENT")) {
            return "Tài khoản không phải học viên!";
        }

        if (req.getFullName() != null) {
            u.setFullName(req.getFullName().trim());
        }
        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getNewPassword().length() < 6) {
                return "Mật khẩu mới phải từ 6 ký tự trở lên!";
            }
            u.setPassword(req.getNewPassword());
        }
        userRepository.save(u);

        if (req.getPhone() != null) {
            student.setPhone(req.getPhone().trim());
        }
        if (req.getAddress() != null) {
            student.setAddress(req.getAddress().trim());
        }
        studentRepository.save(student);

        return "Cập nhật hồ sơ thành công!";
    }
}
