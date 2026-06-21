package com.blog.service;

import com.blog.dto.FileUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
public class FileUploadService {

    @Value("${blog.file.upload-path}")
    private String uploadPath;

    public FileUploadResponse parseTxtFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".txt")) {
            throw new IllegalArgumentException("只支持 .txt 格式文件");
        }

        try {
            StringBuilder content = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    content.append(line).append("\n");
                }
            }

            String title = filename.replaceAll("\\.txt$", "");
            String fileContent = content.toString().trim();

            if (fileContent.startsWith("# ")) {
                int firstNewline = fileContent.indexOf("\n");
                if (firstNewline > 0) {
                    title = fileContent.substring(2, firstNewline).trim();
                    fileContent = fileContent.substring(firstNewline + 1).trim();
                }
            }

            return new FileUploadResponse(title, fileContent);

        } catch (IOException e) {
            throw new RuntimeException("文件解析失败: " + e.getMessage());
        }
    }
}
