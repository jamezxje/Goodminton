package com.goodminton.service;

import com.goodminton.dto.request.CreateMemberRequest;
import com.goodminton.entity.Member;
import com.goodminton.exception.BusinessException;
import com.goodminton.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @InjectMocks private MemberService memberService;
    @Mock private MemberRepository memberRepository;

    @Test
    void createMember_withNewPhone_succeeds() {
        var request = new CreateMemberRequest("Nguyen A", "0901234567", null, LocalDate.now());
        when(memberRepository.existsByPhone("0901234567")).thenReturn(false);
        when(memberRepository.save(any())).thenAnswer(inv -> {
            Member m = inv.getArgument(0);
            return Member.builder()
                .id(1L)
                .fullName(m.getFullName())
                .phone(m.getPhone())
                .isActive(true)
                .joinedDate(m.getJoinedDate())
                .build();
        });

        var result = memberService.createMember(request);

        assertThat(result.fullName()).isEqualTo("Nguyen A");
        assertThat(result.phone()).isEqualTo("0901234567");
    }

    @Test
    void createMember_withDuplicatePhone_throwsBusinessException() {
        var request = new CreateMemberRequest("Nguyen B", "0901234567", null, LocalDate.now());
        when(memberRepository.existsByPhone("0901234567")).thenReturn(true);

        assertThatThrownBy(() -> memberService.createMember(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("phone");
    }

    @Test
    void setMemberInactive_updatesIsActive() {
        var member = Member.builder().id(1L).fullName("A").phone("0901234567")
                          .isActive(true).joinedDate(LocalDate.now()).build();
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        memberService.setMemberStatus(1L, false);

        verify(memberRepository).save(argThat(m -> !m.isActive()));
    }
}
