package com.example.course_management.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Formula; // ⚠️ IMPORT MỚI BẮT BUỘC PHẢI CÓ
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;
    private String imageUrl;

    private LocalDate startDate; // Ngày khai giảng
    private LocalDate endDate; // Ngày kết thúc
    private LocalTime startTime; // Giờ bắt đầu học
    private LocalTime endTime; // Giờ kết thúc

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Formula("(SELECT COUNT(e.id) FROM enrollments e WHERE e.course_id = id)")
    private Integer studentCount;
}