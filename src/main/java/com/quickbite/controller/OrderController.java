package com.quickbite.controller;

import com.quickbite.dto.ApiResponse;
import com.quickbite.dto.OrderRequest;
import com.quickbite.model.*;
import com.quickbite.service.OrderService;
import com.quickbite.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest req, HttpSession session) {
        Long uid = (Long) session.getAttribute("userId");
        if (uid == null) return ResponseEntity.status(401).body(ApiResponse.error("Please log in first."));
        try {
            User user = userService.findById(uid).orElseThrow(() -> new RuntimeException("User not found."));
            Order order = orderService.placeOrder(req, user);
            return ResponseEntity.ok(ApiResponse.ok("Order placed!", toMap(order)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable String orderId, HttpSession session) {
        Long uid = (Long) session.getAttribute("userId");
        if (uid == null) return ResponseEntity.status(401).body(ApiResponse.error("Not logged in."));
        try {
            return ResponseEntity.ok(ApiResponse.ok(toMap(orderService.getByOrderId(orderId))));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<?> myOrders(HttpSession session) {
        Long uid = (Long) session.getAttribute("userId");
        if (uid == null) return ResponseEntity.status(401).body(ApiResponse.error("Not logged in."));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order o : orderService.getOrdersForUser(uid)) result.add(toMap(o));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private Map<String, Object> toMap(Order o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("orderId",       o.getOrderId());
        m.put("status",        o.getStatus());
        m.put("paymentMethod", o.getPaymentMethod());
        m.put("subtotal",      o.getSubtotal());
        m.put("tax",           o.getTax());
        m.put("deliveryFee",   o.getDeliveryFee());
        m.put("total",         o.getTotal());
        m.put("deliveryArea",  o.getDeliveryArea());
        m.put("deliveryLat",   o.getDeliveryLat());
        m.put("deliveryLng",   o.getDeliveryLng());
        m.put("placedAt",      o.getPlacedAt());

        if (o.getRestaurant() != null) {
            Restaurant r = o.getRestaurant();
            m.put("restaurantId",      r.getId());
            m.put("restaurantName",    r.getName());
            m.put("restaurantEmoji",   r.getEmoji());
            m.put("restaurantLat",     r.getLat());
            m.put("restaurantLng",     r.getLng());
            m.put("restaurantAddress", r.getAddress());
            m.put("eta",               r.getEta() != null ? r.getEta() : 30);
        }

        if (o.getPartner() != null) {
            DeliveryPartner p = o.getPartner();
            Map<String, Object> pm = new LinkedHashMap<>();
            pm.put("name",    p.getFullName());
            pm.put("phone",   p.getPhone());
            pm.put("vehicle", p.getVehicleType());
            pm.put("vNo",     p.getVehicleNumber());
            pm.put("rating",  p.getRating());
            pm.put("exp",     p.getExperienceYears());
            pm.put("area",    p.getArea());
            pm.put("avatar",  p.getAvatar());
            m.put("partner", pm);
        }

        if (o.getItems() != null) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem i : o.getItems()) {
                Map<String, Object> im = new LinkedHashMap<>();
                im.put("name", i.getItemName());
                im.put("qty",  i.getQuantity());
                im.put("price",i.getPrice());
                items.add(im);
            }
            m.put("items", items);
        }
        return m;
    }
}
