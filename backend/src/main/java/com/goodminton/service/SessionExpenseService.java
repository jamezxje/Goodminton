package com.goodminton.service;

import com.goodminton.dto.request.CreateExpenseRequest;
import com.goodminton.dto.response.SessionExpenseResponse;
import com.goodminton.entity.SessionExpense;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionExpenseService {

    private final SessionExpenseRepository expenseRepository;
    private final SessionService sessionService;
    private final ExpenseCategoryService categoryService;
    private final MemberRepository memberRepository;

    public List<SessionExpenseResponse> getExpenses(Long sessionId) {
        return expenseRepository.findAllBySessionId(sessionId)
            .stream().map(this::toResponse).toList();
    }

    public SessionExpenseResponse addExpense(Long sessionId, CreateExpenseRequest request) {
        var session = sessionService.findById(sessionId);
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã chốt, không thể thêm chi tiêu");
        }
        var category = categoryService.findById(request.categoryId());
        var member = memberRepository.findById(request.paidByMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member không tồn tại: " + request.paidByMemberId()));

        var expense = SessionExpense.builder()
            .session(session).category(category).amount(request.amount())
            .paidByMember(member).description(request.description()).build();
        return toResponse(expenseRepository.save(expense));
    }

    public SessionExpenseResponse updateExpense(Long sessionId, Long expenseId, CreateExpenseRequest request) {
        var expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense không tồn tại: " + expenseId));
        if (!expense.getSession().getId().equals(sessionId)) {
            throw new BusinessException("Expense không thuộc session này");
        }
        var category = categoryService.findById(request.categoryId());
        var member = memberRepository.findById(request.paidByMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member không tồn tại: " + request.paidByMemberId()));
        expense.setCategory(category);
        expense.setAmount(request.amount());
        expense.setPaidByMember(member);
        expense.setDescription(request.description());
        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long expenseId) {
        expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense không tồn tại: " + expenseId));
        expenseRepository.deleteById(expenseId);
    }

    private SessionExpenseResponse toResponse(SessionExpense e) {
        return new SessionExpenseResponse(e.getId(), e.getCategory().getId(),
            e.getCategory().getName(), e.getCategory().getIcon(), e.getAmount(),
            e.getPaidByMember().getId(), e.getPaidByMember().getFullName(), e.getDescription());
    }
}
