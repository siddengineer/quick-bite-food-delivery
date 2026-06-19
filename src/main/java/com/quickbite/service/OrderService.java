package com.quickbite.service;

import com.quickbite.dto.OrderRequest;
import com.quickbite.model.*;
import com.quickbite.repository.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final RestaurantRepository restaurantRepo;
    private final DeliveryPartnerRepository partnerRepo;

    public OrderService(OrderRepository orderRepo, RestaurantRepository restaurantRepo,
                        DeliveryPartnerRepository partnerRepo) {
        this.orderRepo = orderRepo;
        this.restaurantRepo = restaurantRepo;
        this.partnerRepo = partnerRepo;
    }

    public Order placeOrder(OrderRequest req, User user) {
        Restaurant restaurant = restaurantRepo.findById(req.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found."));

        List<DeliveryPartner> partners = partnerRepo.findAll();
        if (partners.isEmpty()) throw new RuntimeException("No delivery partners available.");
        DeliveryPartner partner = partners.get(new Random().nextInt(partners.size()));

        int subtotal = 0;
        for (OrderRequest.OrderItemDto i : req.getItems()) subtotal += i.getPrice() * i.getQty();
        int tax = (int) Math.round(subtotal * 0.05);
        int deliveryFee = subtotal > 500 ? 0 : 40;
        int total = subtotal + tax + deliveryFee;

        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setPartner(partner);
        order.setPaymentMethod(req.getPaymentMethod());
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setDeliveryFee(deliveryFee);
        order.setTotal(total);
        order.setDeliveryArea(req.getDeliveryArea());
        order.setDeliveryLat(req.getDeliveryLat());
        order.setDeliveryLng(req.getDeliveryLng());

        List<OrderItem> items = new ArrayList<>();
        for (OrderRequest.OrderItemDto dto : req.getItems()) {
            OrderItem item = new OrderItem(order, dto.getName(), dto.getQty(), dto.getPrice());
            items.add(item);
        }
        order.setItems(items);
        return orderRepo.save(order);
    }

    public Order getByOrderId(String orderId) {
        return orderRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepo.findByUserIdOrderByPlacedAtDesc(userId);
    }
}
