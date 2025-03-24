package com.example.project.repos;

import com.example.project.models.Attendance;
import com.example.project.models.TimeWorked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TimeWorkedRepository extends JpaRepository<TimeWorked, Long> {
    @Query("SELECT a FROM TimeWorked a WHERE a.user_id.id = :userId")
    Optional<Attendance> findByUserId(@Param("userId") Long userId);

}

