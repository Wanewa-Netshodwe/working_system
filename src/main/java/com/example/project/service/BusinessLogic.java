package com.example.project.service;

import com.example.project.models.*;
import com.example.project.repos.AttendanceRepository;
import com.example.project.repos.TimeWorkedRepository;
import com.example.project.repos.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;

@Service
public class BusinessLogic {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private TimeWorkedRepository timeWorkRepository;

    public int updateUser(User user,String studNumber){
        return userRepository.updateUserByStudentNumber(user.getFullName(),user.getSurname(),user.getEmailAddress(),user.getContactNo(),user.getProfile_pic() ,studNumber);
    }
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User correctPassword(LoginModel login ){
        Optional<User> u = userRepository.findByStudentNumberAndPassword(login.getStudentNum(), login.getPassword());
        if (u.isPresent()) {
            User existingUser = u.get();
            return  existingUser;
        }else{
            return  null;
        }
    }

    public List<AttendanceDataModel> getAttendanceData(User user){
        User u = correctPassword(new LoginModel(user.getStudentNumber(), user.getPassword()));
        List<Attendance> attendanceList = attendanceRepository.findAllByUser_id(u.getId());
        List<AttendanceDataModel> attendanceDataModels = new ArrayList<>();
        if(!attendanceList.isEmpty()){
            System.out.println("found attendance");
            System.out.println(attendanceList);
            for(Attendance attendance : attendanceList){
                System.out.println("Create At : "+ attendance.getTodayDate());
                AttendanceDataModel dataModel = new AttendanceDataModel();
                dataModel.setValid(true);
                dataModel.setClock_in(attendance.getClock_in());
                if(attendance.getClock_out() == null){
                    dataModel.setClock_out(null);
                }else{
                    dataModel.setClock_out(attendance.getClock_out());
                }
                dataModel.setTodayDate(attendance.getTodayDate());
                TimeWorkedModel timeWorkedModel = new TimeWorkedModel();
                timeWorkedModel.setHours(attendance.getWorkHours().getHours());
                timeWorkedModel.setMinutes(attendance.getWorkHours().getMinutes());
                timeWorkedModel.setSeconds(attendance.getWorkHours().getSeconds());
                dataModel.setWorkHours(timeWorkedModel);
                attendanceDataModels.add(dataModel);
            }
        }
        return attendanceDataModels;
    }
    public Attendance getActiveAttendance(User usr){
        var attendance =  attendanceRepository.findByUserIdAndToday(usr.getId());
        if(attendance.isPresent()){
            return attendance.get();
        }
        return null;
    }
    public HashMap<String, List<Attendance>> getReports() {
        List<User> users = userRepository.findAll();
        List<Attendance> attendance = attendanceRepository.findAll();
        HashMap<String, List<Attendance>> userMap = new HashMap<>();

        for (User u : users) {
            System.out.println(u);
            List<Attendance> alist = new ArrayList<>();
            for (Attendance a : attendance) {
                if (a.getUser_id().getId().equals(u.getId())) {
                    alist.add(a);
                }
            }
            userMap.put(u.getFullName() + " " + u.getSurname(), alist);
        }

        return userMap;
    }


    public List<User> allUsers(){
        return  userRepository.findAll();
    }
    public void createSaveAttendance( User existingUser){
        Date now = new Date();

        TimeWorked timeWorked = new TimeWorked();
        timeWorked.setHours(0L);
        timeWorked.setMinutes(0L);
        timeWorked.setSeconds(0L);
        timeWorked.setUser_id(existingUser);
        System.out.println(timeWorked.getHours());
        System.out.println(timeWorked.getUser_id().getFullName());
        System.out.println(timeWorked.getMinutes());
        System.out.println(timeWorked.getMinutes());
        timeWorkRepository.save(timeWorked);

        Attendance attendance1 = new Attendance();

        attendance1.setTodayDate(now);
        attendance1.setClock_in(now);
        attendance1.setUser_id(existingUser);
        attendance1.setWorkHours(timeWorked);

        attendanceRepository.save(attendance1);
    }
    public List<Attendance> getAllAttendance(){
        return attendanceRepository.findAll();
    }

    public ResponseEntity<Boolean> clockIn(User user) {

        Optional<User> usr = userRepository.findByStudentNumberAndPassword(user.getStudentNumber(), user.getPassword());

        if(usr.isPresent()){
            User existingUser = usr.get();

            Optional<Attendance> attendance = attendanceRepository.findByUserIdAndToday(existingUser.getId());
            if (attendance.isPresent()) {
                if(Duration.between(attendance.get().getTodayDate().toInstant(),new Date().toInstant()).toHours() <=12){
                    System.out.println("A Day is not passed");
                    return ResponseEntity.status(403).build();
                }else{
                    System.out.println("A Day is has creating a  new one ");
                    createSaveAttendance(existingUser);
                    return ResponseEntity.ok(false);
                }
            }else{
                System.out.println("no attendance found creating one  ");
                createSaveAttendance(existingUser);
                return ResponseEntity.ok(false);
            }



        }
        else {
            System.out.println("cound find student  ");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(true);

        }

    }
    public ResponseEntity<String> clockout(User user) {
        Optional<User> u = userRepository.findByStudentNumberAndPassword(user.getStudentNumber(),user.getPassword());
        if (u.isPresent()) {
            User existingUser = u.get();
            if(existingUser.isNew_account()){
                existingUser.setNew_account(false);
                userRepository.save(existingUser);
            }
            Date now = new Date();
            Optional<Attendance> attendance = attendanceRepository.findByUserIdAndToday(existingUser.getId());

            if(attendance.isPresent()){
                Attendance attendance1 = attendance.get();
                if(attendance1.getClock_out() != null){
                    return ResponseEntity.ok("Clock-out successful for user: " + existingUser.getFullName());
                }else{
                    Duration duration = Duration.between(attendance1.getClock_in().toInstant(), now.toInstant());

                    Long hours_worked =  duration.toHours();
                    Long minutes_worked =  duration.toMinutes();
                    Long seconds_worked =  duration.toSeconds();


                    TimeWorked timeWorked =  attendance1.getWorkHours();
                    timeWorked.setHours(hours_worked);
                    timeWorked.setMinutes(minutes_worked);
                    timeWorked.setSeconds(seconds_worked);

                    timeWorkRepository.save(timeWorked);

                    attendance1.setWorkHours(timeWorked);
                    attendance1.setClock_out(now);
                    attendanceRepository.save(attendance1);
                }

            }
            return ResponseEntity.ok("Clock-out successful for user: " + existingUser.getFullName());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
    }
}
