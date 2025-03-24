package com.example.project.models;


import jakarta.persistence.*;

@Entity
public class TimeWorked {
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user_id;
    private Long hours;
    private Long minutes;
    private Long seconds;
    @Id
    @GeneratedValue
    private Long id;

    public TimeWorked() {}

    public Long getHours() {
        return hours;
    }

    public void setHours(Long hours) {
        this.hours = hours;
    }

    public Long getSeconds() {
        return seconds;
    }

    public void setSeconds(Long seconds) {
        this.seconds = seconds;
    }

    public Long getMinutes() {
        return minutes;
    }

    public void setMinutes(Long minutes) {
        this.minutes = minutes;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public User getUser_id() {
        return user_id;
    }

    public void setUser_id(User user_id) {
        this.user_id = user_id;
    }
}
