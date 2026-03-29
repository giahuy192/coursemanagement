package com.example.course_management.dto;

import lombok.Data;

@Data
public class EnrollmentRequest {
    private String email;
    private Long courseId;
}