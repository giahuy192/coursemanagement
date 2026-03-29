package com.example.course_management.service;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface FileStorageService {
    void init();

    String save(MultipartFile file);

    Path load(String filename);

    void deleteAll();

    Stream<Path> loadAll();
}