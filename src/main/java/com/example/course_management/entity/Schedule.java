package com.example.course_management.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "schedules")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course; // Lịch này của khóa học nào

    private String dayOfWeek; // Thứ 2, Thứ 3...
    private String startTime; // 08:00
    private String endTime; // 10:00
    private String classroom; // Phòng học (hoặc link Zoom)
}