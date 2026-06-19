package com.quickbite.repository;
import com.quickbite.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    @Query("SELECT r FROM Restaurant r WHERE " +
           "(:q IS NULL OR :q = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%',:q,'%')) " +
           " OR LOWER(r.area) LIKE LOWER(CONCAT('%',:q,'%')) " +
           " OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%',:q,'%'))) " +
           "AND (:cuisine IS NULL OR :cuisine = '' OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%',:cuisine,'%')))")
    List<Restaurant> search(@Param("q") String q, @Param("cuisine") String cuisine);
}
