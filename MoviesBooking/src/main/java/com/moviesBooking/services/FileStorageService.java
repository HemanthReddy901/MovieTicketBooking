package com.moviesBooking.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService 
{
	@Value("${upload.path}")
    private String uploadPath;
	public String storeFile(MultipartFile file) throws IOException
	{
		Path uploadUrl = Paths.get(uploadPath);
		if(!Files.exists(uploadUrl))
		{
			Files.createDirectories(uploadUrl);
		}
		String originalFileName=file.getOriginalFilename();
		String extension=originalFileName.substring(originalFileName.lastIndexOf("."));
		String fileName=UUID.randomUUID().toString()+extension;
		Path filePath=uploadUrl.resolve(fileName);
		Files.copy(file.getInputStream(), filePath,StandardCopyOption.REPLACE_EXISTING);
		return fileName;
	}
	
	public void deleteFile(String fileName) throws IOException
	{
		Path filePath = Paths.get(uploadPath).resolve(fileName);
		Files.deleteIfExists(filePath);
	}
}
