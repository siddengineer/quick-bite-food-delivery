package com.quickbite.service;

import com.quickbite.model.MenuItem;
import com.quickbite.model.Restaurant;
import com.quickbite.repository.MenuItemRepository;
import com.quickbite.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepo;
    private final MenuItemRepository menuItemRepo;

    public RestaurantService(RestaurantRepository restaurantRepo, MenuItemRepository menuItemRepo) {
        this.restaurantRepo = restaurantRepo;
        this.menuItemRepo = menuItemRepo;
    }

    public List<Restaurant> search(String q, String cuisine) {
        String qp = (q == null || q.isBlank()) ? null : q.trim();
        String cp = (cuisine == null || cuisine.isBlank()) ? null : cuisine.trim();
        return restaurantRepo.search(qp, cp);
    }

    public Restaurant getById(Long id) {
        return restaurantRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found."));
    }

    public List<MenuItem> getMenu(Long restaurantId) {
        return menuItemRepo.findByRestaurantId(restaurantId);
    }

    public List<String> getAllCuisines() {
        List<String> all = new ArrayList<>();
        for (Restaurant r : restaurantRepo.findAll()) {
            if (r.getCuisine() == null) continue;
            for (String c : r.getCuisine().split(",")) {
                String t = c.trim();
                if (!t.isBlank() && !all.contains(t)) all.add(t);
            }
        }
        all.sort(String::compareTo);
        return all.subList(0, Math.min(all.size(), 20));
    }
}
