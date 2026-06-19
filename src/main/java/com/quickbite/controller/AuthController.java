package com.quickbite.controller;

import com.quickbite.dto.ApiResponse;
import com.quickbite.dto.LoginRequest;
import com.quickbite.dto.SignupRequest;
import com.quickbite.model.User;
import com.quickbite.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    public AuthController(UserService userService) { this.userService = userService; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        try {
            User user = userService.login(req);
            session.setAttribute("userId", user.getId());
            return ResponseEntity.ok(ApiResponse.ok("Login successful.", toMap(user)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req, HttpSession session) {
        try {
            if (req.getName() == null || req.getName().isBlank())
                return ResponseEntity.badRequest().body(ApiResponse.error("Name is required."));
            if (req.getEmail() == null || !req.getEmail().contains("@"))
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid email required."));
            if (req.getPassword() == null || req.getPassword().length() < 6)
                return ResponseEntity.badRequest().body(ApiResponse.error("Password must be 6+ characters."));
            if (req.getArea() == null || req.getArea().isBlank())
                return ResponseEntity.badRequest().body(ApiResponse.error("Please select your area."));
            User user = userService.signup(req);
            session.setAttribute("userId", user.getId());
            return ResponseEntity.ok(ApiResponse.ok("Account created!", toMap(user)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.ok("Logged out.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Long uid = (Long) session.getAttribute("userId");
        if (uid == null) return ResponseEntity.status(401).body(ApiResponse.error("Not logged in."));
        return userService.findById(uid)
                .map(u -> ResponseEntity.ok(ApiResponse.ok(toMap(u))))
                .orElse(ResponseEntity.status(401).body(ApiResponse.error("Session expired.")));
    }

    private Map<String, Object> toMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId()); m.put("name", u.getName()); m.put("email", u.getEmail());
        m.put("phone", u.getPhone()); m.put("area", u.getArea());
        m.put("lat", u.getLat() != null ? u.getLat() : 18.5308);
        m.put("lng", u.getLng() != null ? u.getLng() : 73.8474);
        return m;
    }
}
