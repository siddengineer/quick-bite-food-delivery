package com.quickbite.model;

import jakarta.persistence.*;

@Entity
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    private String itemName;
    private Integer quantity;
    private Integer price;

    public OrderItem() {}
    public OrderItem(Order order, String itemName, Integer quantity, Integer price) {
        this.order=order; this.itemName=itemName; this.quantity=quantity; this.price=price;
    }

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
}
