package com.goodminton.repository;

import com.goodminton.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findAllByIsActiveOrderByFullNameAsc(boolean isActive);
    boolean existsByPhone(String phone);
}
