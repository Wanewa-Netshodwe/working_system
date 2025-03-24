package com.example.project.controller;

import com.example.project.models.*;
import com.example.project.service.BusinessLogic;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
@CrossOrigin("*")
@RequestMapping("api")
@RestController
public class MainController {
    @Autowired
    BusinessLogic service;

    private static final String UPLOAD_DIR = "uploads/";

    @CrossOrigin("*")
    @PostMapping("/upload")
    public ResponseEntity<User> uploadFile(
            @RequestParam("user") String userJson,
            @RequestParam("file") MultipartFile file) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            User user = objectMapper.readValue(userJson, User.class);

            // Handle file upload if file exists
            if (!file.isEmpty()) {
                // Ensure the uploads directory exists
                Files.createDirectories(Paths.get(UPLOAD_DIR));

                // Generate a unique file name
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);

                // Save the file
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Generate the file URL
                String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/uploads/")
                        .path(fileName)
                        .toUriString();

                // Add file URL to user if needed
             user.setProfile_pic(fileUrl);
            }


            int updated = service.updateUser(user,user.getStudentNumber());
            if(updated >0){
                System.out.println("Upaded "+updated +"rows");
            }else{
                System.out.print("no rows Upadted");
            }


            return ResponseEntity.ok().body(user);
        } catch (IOException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user,
     @RequestHeader("role") String role
    ){

        User u = user;
        u.setCreatedAt(new Date());
        u.setRole(role);
        u.setNew_account(true);
        u.setProfile_pic("");
        service.saveUser(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(u);
    }

  @PostMapping ("/clockin")
    public ResponseEntity<Boolean> clockIn(@RequestBody User user){
System.out.println("Recieved a clockin request ");
        return  service.clockIn(user);
    }
    @PostMapping("/clockout")
    public void clockOut(@RequestBody User user){
        service.clockout(user);
    }
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAll() {
     return ResponseEntity.ok(service.allUsers());
    }

@PostMapping("/login")
    public ResponseEntity<UserLoginModel> login(@RequestBody LoginModel loginModel ) {
        System.out.println("recieved login request");
        User u = service.correctPassword(loginModel);
        UserLoginModel userLoginModel = new UserLoginModel();
        if (u == null){
        return  ResponseEntity.status(403).build();
        }
        Attendance attendance = service.getActiveAttendance(u);
        if(attendance == null){
        userLoginModel.setUser(u);
        userLoginModel.setSeconds(Long.valueOf(0L));
        userLoginModel.setClockin(false);
        return ResponseEntity.ok(userLoginModel);
        }
        else{
            userLoginModel.setUser(u);
            if(attendance.getClock_in() == null){
                userLoginModel.setSeconds(Long.valueOf(0L));
                userLoginModel.setClockin(false);
                return ResponseEntity.ok(userLoginModel);
            }

            if(attendance.getClock_out() == null){
                Long seconds = (Long) Duration.between(attendance.getClock_in().toInstant(),new Date().toInstant()).getSeconds();
                userLoginModel.setSeconds(seconds);
                userLoginModel.setClockin(true);
            }else {
                Long sec = (Long) Duration.between(attendance.getClock_in().toInstant(),attendance.getClock_out().toInstant()).getSeconds();
                userLoginModel.setSeconds(sec);
                userLoginModel.setClockin(false);
            }


            return ResponseEntity.ok(userLoginModel);
        }
    }

    @PostMapping("/attendance")
    public ResponseEntity<List<AttendanceDataModel>> attendanceData(@RequestBody User user ) {
        System.out.println("recieved attendance request");
       return  ResponseEntity.ok(service.getAttendanceData(user));
    }

    @GetMapping("/report")
    public ResponseEntity<HashMap<String, List<Attendance>>> makeReport( @RequestHeader("role") String role) {
        if (!role.equals("HR")) {
            return ResponseEntity.status(403).body(null);
        }
        HashMap<String, List<Attendance>> map = service.getReports();
        return ResponseEntity.ok(map);
    }
    @GetMapping("/getallAttendance")
    public ResponseEntity<List<Attendance>> allAttendance(@RequestHeader("role") String role) {
        if (!role.equals("HR")) {
            return ResponseEntity.status(403).body(null);
        }
        return ResponseEntity.ok(service.getAllAttendance());
    }




}
