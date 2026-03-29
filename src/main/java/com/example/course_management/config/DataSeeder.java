package com.example.course_management.config;

import com.example.course_management.entity.User;
import com.example.course_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem database đã có admin (dựa vào email) chưa
        if (userRepository.findByEmail("admin@course.com") == null) {
            User admin = new User();

            // Xóa dòng setUsername đi, chỉ dùng Email làm tài khoản đăng nhập
            admin.setEmail("admin@course.com");
            admin.setPassword("admin123"); // Mật khẩu mặc định
            admin.setFullName("System Administrator");
            admin.setRole("ROLE_ADMIN");

            userRepository.save(admin);
            System.out.println("Đã tự động tạo tài khoản Admin mặc định! (Email: admin@course.com | Pass: admin123)");
        }
    }
}