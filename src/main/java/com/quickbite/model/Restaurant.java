package com.quickbite.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Restaurant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String area;
    @Column(length = 200) private String cuisine;
    @Column(length = 250) private String address;
    private String emoji;
    private Double rating;
    private Integer votes;
    private Integer costForTwo;
    private String priceLabel;
    private Double lat;
    private Double lng;
    @Column(length = 300) private String topDishes;
    private Integer eta;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MenuItem> menuItems;

    public Restaurant() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getVotes() { return votes; }
    public void setVotes(Integer votes) { this.votes = votes; }
    public Integer getCostForTwo() { return costForTwo; }
    public void setCostForTwo(Integer costForTwo) { this.costForTwo = costForTwo; }
    public String getPriceLabel() { return priceLabel; }
    public void setPriceLabel(String priceLabel) { this.priceLabel = priceLabel; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public String getTopDishes() { return topDishes; }
    public void setTopDishes(String topDishes) { this.topDishes = topDishes; }
    public Integer getEta() { return eta; }
    public void setEta(Integer eta) { this.eta = eta; }
    public List<MenuItem> getMenuItems() { return menuItems; }
    public void setMenuItems(List<MenuItem> menuItems) { this.menuItems = menuItems; }
}
