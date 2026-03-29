package com.example.course_management;

import com.example.course_management.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CourseManagementApplication implements CommandLineRunner {

    // Khai báo biến này thì ở dưới mới gọi fileStorageService.init() được
    @Autowired
    private FileStorageService fileStorageService;

    public static void main(String[] args) {
        SpringApplication.run(CourseManagementApplication.class, args);
    }

    // Ghi đè hàm run từ CommandLineRunner
    @Override
    public void run(String... args) throws Exception {
        // Tự động tạo thư mục uploads khi khởi động
        fileStorageService.init();
    }
}