package com.spring.studentsystem.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "register")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "First_Name")
    private String firstName;

    @Column(name = "Last_Name")
    private String lastName;

    @Column(name = "Mobile_No", unique = true)
    private Long mobileNo;

    @Column(name = "Username", unique = true)
    private String username;

    @Column(name = "Password_")
    private String password;
}