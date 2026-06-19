package com.quickbite.service;

import com.quickbite.dto.LoginRequest;
import com.quickbite.dto.SignupRequest;
import com.quickbite.model.User;
import com.quickbite.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepo;
    public UserService(UserRepository userRepo) { this.userRepo = userRepo; }

    public User login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Incorrect email or password."));
        if (!user.getPassword().equals(req.getPassword()))
            throw new RuntimeException("Incorrect email or password.");
        return user;
    }

    public User signup(SignupRequest req) {
        if (userRepo.existsByEmail(req.getEmail().toLowerCase().trim()))
            throw new RuntimeException("Email already registered. Please log in.");
        User u = new User();
        u.setName(req.getName().trim());
        u.setEmail(req.getEmail().toLowerCase().trim());
        u.setPhone(req.getPhone());
        u.setPassword(req.getPassword());
        u.setArea(req.getArea());
        u.setLat(req.getLat());
        u.setLng(req.getLng());
        return userRepo.save(u);
    }

    public Optional<User> findById(Long id) { return userRepo.findById(id); }
}
