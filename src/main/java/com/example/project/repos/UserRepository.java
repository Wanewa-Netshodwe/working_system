package com.example.project.repos;

import com.example.project.models.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByStudentNumberAndPassword(String studentNum, String password);
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.fullName = :name, u.surname =:surname, u.emailAddress = :email, u.contactNo = :department ,u.profile_pic = :profile_pic" +
            " WHERE u.studentNumber = :studentNumber")
    int updateUserByStudentNumber(
            @Param("name") String name,
            @Param("surname") String surname,
            @Param("email") String email,
            @Param("department") String contactNo,
            @Param("profile_pic") String profile_pic,
            @Param("studentNumber") String studentNumber);
}

