package com.spring.studentsystem.controller;

import com.spring.studentsystem.entity.Admin;
import com.spring.studentsystem.entity.User;
import com.spring.studentsystem.repository.UserRepository;
import com.spring.studentsystem.repository.AdminRepository;
import com.spring.studentsystem.dto.UpdateRequest;
import com.spring.studentsystem.service.EmailService;
import com.spring.studentsystem.dto.ResetPasswordRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private ConcurrentHashMap<String, String> otpStorage = new ConcurrentHashMap<>();
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByMobileNo(user.getMobileNo())) {
            return ResponseEntity.badRequest().body("Mobile number already exists");
        }
        userRepository.save(user);
        return ResponseEntity.ok("Registration Successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        String username = data.get("username");
        String password = data.get("password");

        Optional<Admin> admin = adminRepository.findByUsernameAndPassword(username, password);

        if (admin.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("role", "admin");
            response.put("status", "success");
            response.put("username", admin.get().getUsername());
            return ResponseEntity.ok(response);
        }

        Optional<User> student = userRepository.findByUsernameAndPassword(username, password);

        if (student.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("role", "student");
            response.put("user", student.get());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body("Invalid Credentials");
    }

    @GetMapping("/admin/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UpdateRequest request) {
        User existingUser = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setFirstName(request.getFirstName());
        existingUser.setLastName(request.getLastName());
        existingUser.setMobileNo(request.getMobileNo());

        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
                return ResponseEntity.badRequest().body("Old password is required to set a new password.");
            }

            if (!existingUser.getPassword().equals(request.getOldPassword())) {
                return ResponseEntity.badRequest().body("Incorrect old password!");
            }

            existingUser.setPassword(request.getNewPassword());
        }

        userRepository.save(existingUser);
        return ResponseEntity.ok(existingUser);
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/check-mobile")
    public ResponseEntity<Boolean> checkMobile(@RequestParam Long mobile) {
        if (mobile == null) return ResponseEntity.ok(false);
        boolean exists = userRepository.existsByMobileNo(mobile);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        if (userRepository.existsByUsername(email)) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }

        String otp = emailService.generateOtp();
        otpStorage.put(email, otp);

        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok("OTP sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send email.");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        String storedOtp = otpStorage.get(email);

        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email);
            return ResponseEntity.ok("OTP Verified!");
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP!");
        }
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendForgotOtp(@RequestParam String email) {
        if (!userRepository.existsByUsername(email)) {
            return ResponseEntity.badRequest().body("Email is not registered!");
        }

        String otp = emailService.generateOtp();
        otpStorage.put(email, otp);

        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok("OTP sent to your email.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send OTP.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();
        String newPassword = request.getNewPassword();

        String storedOtp = otpStorage.get(email);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            return ResponseEntity.badRequest().body("Invalid or Expired OTP!");
        }

        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(newPassword);
        userRepository.save(user);

        otpStorage.remove(email);

        return ResponseEntity.ok("Password reset successfully!");
    }
}