package com.example.course_management.service;

import com.example.course_management.dto.LoginRequest;
import com.example.course_management.dto.RegisterRequest;
import com.example.course_management.entity.Student;
import com.example.course_management.entity.User;
import com.example.course_management.repository.StudentRepository;
import com.example.course_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    public String registerStudent(RegisterRequest request) {
        // --- ĐÃ SỬA: Dùng existsByEmail thay cho != null ---
        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email đã tồn tại!";
        }

        // 2. Tạo User mới với role là STUDENT
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword()); // Lưu ý: Tạm thời lưu mật khẩu gốc, bước sau sẽ mã hóa (Hash)
        newUser.setRole("ROLE_STUDENT");

        // (Tạm ẩn đi vì sếp chỉ muốn đăng ký bằng Email và Mật khẩu)
        // newUser.setFullName(request.getFullName());

        User savedUser = userRepository.save(newUser);

        // 3. Tạo thông tin Student liên kết với User vừa tạo
        Student student = new Student();
        student.setUser(savedUser);

        // (Tạm ẩn đi các thông tin rườm rà)
        // student.setPhone(request.getPhone());
        // student.setAddress(request.getAddress());

        studentRepository.save(student);

        return "Đăng ký thành công!";
    }

    public String login(LoginRequest request) {
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            return "Email không được để trống!";
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return "Email không tồn tại trên hệ thống!";
        }
        if (!user.getPassword().equals(request.getPassword())) {
            return "Sai mật khẩu!";
        }

        // Trả về role để Frontend biết chuyển hướng (Admin hay Student)
        return "Đăng nhập thành công! Role: " + user.getRole();
    }
}