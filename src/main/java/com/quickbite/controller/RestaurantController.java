package com.quickbite.controller;

import com.quickbite.dto.ApiResponse;
import com.quickbite.model.MenuItem;
import com.quickbite.model.Restaurant;
import com.quickbite.service.RestaurantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public ResponseEntity<?> search(@RequestParam(required=false) String q,
                                    @RequestParam(required=false) String cuisine) {
        List<Restaurant> list = restaurantService.search(q, cuisine);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Restaurant r : list) result.add(toMap(r));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/cuisines")
    public ResponseEntity<?> cuisines() {
        return ResponseEntity.ok(ApiResponse.ok(restaurantService.getAllCuisines()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        try {
            Restaurant r = restaurantService.getById(id);
            Map<String, Object> data = toMap(r);
            List<Map<String, Object>> menu = new ArrayList<>();
            for (MenuItem m : restaurantService.getMenu(id)) {
                Map<String, Object> mmap = new LinkedHashMap<>();
                mmap.put("id", m.getId());
                mmap.put("name", m.getName());
                mmap.put("description", m.getDescription() != null ? m.getDescription() : "");
                mmap.put("price", m.getPrice());
                menu.add(mmap);
            }
            data.put("menu", menu);
            return ResponseEntity.ok(ApiResponse.ok(data));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Map<String, Object> toMap(Restaurant r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("name", r.getName());
        m.put("area", r.getArea());
        m.put("cuisine", r.getCuisine());
        m.put("address", r.getAddress());
        m.put("emoji", r.getEmoji());
        m.put("rating", r.getRating());
        m.put("votes", r.getVotes());
        m.put("costForTwo", r.getCostForTwo());
        m.put("priceLabel", r.getPriceLabel());
        m.put("lat", r.getLat());
        m.put("lng", r.getLng());
        m.put("topDishes", r.getTopDishes());
        m.put("eta", r.getEta() != null ? r.getEta() : 30);
        return m;
    }
}
