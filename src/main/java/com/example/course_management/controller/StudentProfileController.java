package com.example.course_management.controller;

import com.example.course_management.dto.StudentProfileResponse;
import com.example.course_management.dto.StudentProfileUpdateRequest;
import com.example.course_management.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin("*")
public class StudentProfileController {

    @Autowired
    private StudentProfileService studentProfileService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        StudentProfileResponse profile = studentProfileService.getProfileByEmail(email);
        if (profile == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy hồ sơ học viên hoặc tài khoản không phải học viên.");
        }
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody StudentProfileUpdateRequest request) {
        String result = studentProfileService.updateProfile(request);
        if (result.startsWith("Cập nhật")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }
}
