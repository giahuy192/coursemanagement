package com.example.course_management.repository;

import com.example.course_management.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm user bằng email
    java.util.Optional<User> findByEmail(String email);

    // Kiểm tra xem email đã tồn tại chưa (dùng lúc đăng ký)
    Boolean existsByEmail(String email);
}