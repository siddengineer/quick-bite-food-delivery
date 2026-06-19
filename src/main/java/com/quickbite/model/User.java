package com.quickbite.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true) private String email;
    private String phone;
    private String password;
    private String area;
    private Double lat;
    private Double lng;

    public User() {}
    public User(Long id, String name, String email, String phone, String password, String area, Double lat, Double lng) {
        this.id=id; this.name=name; this.email=email; this.phone=phone;
        this.password=password; this.area=area; this.lat=lat; this.lng=lng;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
}
