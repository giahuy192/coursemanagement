package com.example.course_management.dto;

import lombok.Data;

@Data
public class LessonRequest {
    private String title;
    /** Tên chương / chủ đề (dùng khi admin thêm bài học) */
    private String chapter;
    private String content;
    /** URL video hoặc file PDF (upload hoặc đường dẫn tĩnh) */
    private String videoUrl;
    /** Alias cho PDF sau khi upload — map sang videoUrl khi lưu DB */
    private String documentUrl;

    // Khóa ngoại: Bài giảng này thuộc về Khóa học nào?
    private Long courseId;
}