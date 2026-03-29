package com.example.course_management.dto;

import lombok.Data;

@Data
public class StudentProfileResponse {
    private Long studentId;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String role;
}
