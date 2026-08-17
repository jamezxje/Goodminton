package com.goodminton.service;

import com.goodminton.dto.request.CreateMemberRequest;
import com.goodminton.dto.response.MemberResponse;
import com.goodminton.entity.Member;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public List<MemberResponse> getMembers(Boolean activeOnly) {
        List<Member> members = (activeOnly != null && activeOnly)
            ? memberRepository.findAllByIsActiveOrderByFullNameAsc(true)
            : memberRepository.findAll();
        return members.stream().map(this::toResponse).toList();
    }

    public MemberResponse getMember(Long id) {
        return toResponse(findById(id));
    }

    public MemberResponse createMember(CreateMemberRequest request) {
        if (memberRepository.existsByPhone(request.phone())) {
            throw new BusinessException("Số phone đã tồn tại: " + request.phone());
        }
        var member = Member.builder()
            .fullName(request.fullName())
            .phone(request.phone())
            .email(request.email())
            .joinedDate(request.joinedDate())
            .isActive(true)
            .build();
        return toResponse(memberRepository.save(member));
    }

    public MemberResponse updateMember(Long id, CreateMemberRequest request) {
        var member = findById(id);
        if (!member.getPhone().equals(request.phone()) && memberRepository.existsByPhone(request.phone())) {
            throw new BusinessException("Số phone đã tồn tại: " + request.phone());
        }
        member.setFullName(request.fullName());
        member.setPhone(request.phone());
        member.setEmail(request.email());
        member.setJoinedDate(request.joinedDate());
        return toResponse(memberRepository.save(member));
    }

    public void setMemberStatus(Long id, boolean active) {
        var member = findById(id);
        member.setActive(active);
        memberRepository.save(member);
    }

    private Member findById(Long id) {
        return memberRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Member không tồn tại: " + id));
    }

    private MemberResponse toResponse(Member m) {
        return new MemberResponse(m.getId(), m.getFullName(), m.getPhone(),
            m.getEmail(), m.getAvatarUrl(), m.isActive(), m.getJoinedDate());
    }
}
