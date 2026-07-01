package com.pricepilot.backend.product.repository;

import com.pricepilot.backend.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(p.name)     LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.brand)    LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Product> search(@Param("search") String search, Pageable pageable);

    List<Product> findByHealthScoreLessThan(Integer threshold);

    List<Product> findByHealthScoreEquals(Integer score);
}
