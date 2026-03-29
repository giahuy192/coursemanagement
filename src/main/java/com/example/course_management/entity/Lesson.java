package com.example.course_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    /** Tên chương / chủ đề (hiển thị nhóm trong curriculum) */
    private String chapter;

    @Column(columnDefinition = "TEXT")
    private String content;

    // 👇 CẶP BÀI TRÙNG LƯU LINK ĐÂY SẾP NHÉ 👇
    @Column(name = "document_url")
    private String documentUrl; // Lưu link file PDF

    @Column(name = "video_url")
    private String videoUrl; // Lưu link file Video MP4

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

}