package com.example.project.models;

public class LoginModel {
    private String studentNum;
    private String password;

    public LoginModel(String studentNum, String password) {
        this.studentNum = studentNum;
        this.password = password;
    }

    public String getStudentNum() {
        return studentNum;
    }

    public void setStudentNum(String studentNum) {
        this.studentNum = studentNum;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
