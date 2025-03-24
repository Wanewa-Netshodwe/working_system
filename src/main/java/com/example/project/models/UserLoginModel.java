package com.example.project.models;

public class UserLoginModel {
    User user;

    Long seconds;

    boolean clockin;

    public boolean isClockin() {
        return clockin;
    }

    public void setClockin(boolean clockin) {
        this.clockin = clockin;
    }

    public Long getSeconds() {
        return seconds;
    }

    public void setSeconds(Long seconds) {
        this.seconds = seconds;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
