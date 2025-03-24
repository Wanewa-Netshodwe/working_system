package com.example.project.repos;

import com.example.project.models.Attendance;
import com.example.project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    @Query("SELECT a FROM Attendance a WHERE a.user_id.id = :userId")
    Optional<Attendance> findByUserId(@Param("userId") Long userId);
    @Query("SELECT a FROM Attendance a WHERE a.user_id.id = :userId AND CAST(a.todayDate AS DATE) = CURRENT_DATE")
    Optional<Attendance> findByUserIdAndToday(@Param("userId") Long userId);
    @Query("SELECT a FROM Attendance a WHERE a.user_id.id = :userId")
    List<Attendance> findAllByUser_id(@Param("userId") Long userId);






}

