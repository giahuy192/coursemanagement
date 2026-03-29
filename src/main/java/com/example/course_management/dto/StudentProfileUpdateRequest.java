package com.example.course_management.dto;

import lombok.Data;

@Data
public class StudentProfileUpdateRequest {
    private String email;
    private String fullName;
    private String phone;
    private String address;
    /** Để trống nếu không đổi mật khẩu */
    private String newPassword;
}
