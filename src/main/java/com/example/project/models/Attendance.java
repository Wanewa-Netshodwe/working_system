package com.example.project.models;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Attendance {

    @Id
    @GeneratedValue
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user_id;
    private Date clock_in;
    private Date clock_out;
    private Date todayDate;

    @OneToOne
    @JoinColumn(name = "work_hours_id")
    private TimeWorked workHours;

    public TimeWorked getWorkHours() {
        return workHours;
    }

    public void setWorkHours(TimeWorked workHours) {
        this.workHours = workHours;
    }

    public Date getTodayDate() {
        return todayDate;
    }

    public void setTodayDate(Date todayDate) {
        this.todayDate = todayDate;
    }

    public User getUser_id() {
        return user_id;
    }

    public void setUser_id(User user_id) {
        this.user_id = user_id;
    }

    public Date getClock_in() {
        return clock_in;
    }

    public void setClock_in(Date clock_in) {
        this.clock_in = clock_in;
    }

    public Date getClock_out() {
        return clock_out;
    }

    public void setClock_out(Date clock_out) {
        this.clock_out = clock_out;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
