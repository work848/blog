package com.blog.service;

import com.blog.dto.FileUploadResponse;
import com.blog.dto.ImageUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${blog.file.upload-path}")
    private String uploadPath;

    @Value("${blog.image.max-size:5242880}")
    private long maxImageSize;

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = new HashSet<>(
            Arrays.asList("jpg", "jpeg", "png", "gif", "webp", "bmp")
    );

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

    public ImageUploadResponse uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("图片不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("文件名不能为空");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("不支持的图片格式，仅支持: " + String.join(", ", ALLOWED_IMAGE_EXTENSIONS));
        }

        if (file.getSize() > maxImageSize) {
            throw new IllegalArgumentException("图片大小不能超过 " + (maxImageSize / 1024 / 1024) + "MB");
        }

        try {
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path imageDir = Paths.get(uploadPath, "images", datePath);
            Files.createDirectories(imageDir);

            String newFilename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
            Path targetPath = imageDir.resolve(newFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/images/" + datePath + "/" + newFilename;
            return new ImageUploadResponse(url, newFilename, file.getSize());

        } catch (IOException e) {
            throw new RuntimeException("图片上传失败: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}
