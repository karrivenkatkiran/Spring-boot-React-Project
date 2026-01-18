package com.spring.studentsystem.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "AdminLogin")
@Data
public class Admin {

    @Id
    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;
}