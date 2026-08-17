package com.goodminton.repository;

import com.goodminton.entity.Session;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    Page<Session> findAllByOrderBySessionDateDesc(Pageable pageable);

    @Query("SELECT s FROM Session s WHERE YEAR(s.sessionDate) = :year AND MONTH(s.sessionDate) = :month ORDER BY s.sessionDate DESC")
    List<Session> findByYearAndMonth(int year, int month);
}
