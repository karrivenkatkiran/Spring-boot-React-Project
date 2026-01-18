package com.spring.studentsystem.dto;

import lombok.Data;

@Data
public class UpdateRequest {
    private String username;
    private String firstName;
    private String lastName;
    private Long mobileNo;
    private String oldPassword;
    private String newPassword;
}