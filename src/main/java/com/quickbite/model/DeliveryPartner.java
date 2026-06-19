package com.quickbite.model;

import jakarta.persistence.*;

@Entity
public class DeliveryPartner {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    private String phone;
    private String vehicleType;
    private String vehicleNumber;
    private String area;
    private String zone;
    private Double rating;
    private Double experienceYears;
    private String avatar;

    public DeliveryPartner() {}
    public DeliveryPartner(String fullName, String phone, String vehicleType, String vehicleNumber,
                           String area, String zone, Double rating, Double experienceYears, String avatar) {
        this.fullName=fullName; this.phone=phone; this.vehicleType=vehicleType;
        this.vehicleNumber=vehicleNumber; this.area=area; this.zone=zone;
        this.rating=rating; this.experienceYears=experienceYears; this.avatar=avatar;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Double getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Double experienceYears) { this.experienceYears = experienceYears; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
