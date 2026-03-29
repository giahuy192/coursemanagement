package com.example.course_management.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.format.annotation.DateTimeFormat;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private String imageUrl;

    // Chỉ cần nhận ID của Môn học và Giảng viên từ Frontend
    private Long subjectId;
    private Long teacherId;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @DateTimeFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @DateTimeFormat(pattern = "HH:mm")
    private LocalTime endTime;
}