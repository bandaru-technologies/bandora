package com.localvibe.serice.repository;

import com.localvibe.serice.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {
    List<AppointmentSlot> findByDepartmentId(Long departmentId);
    List<AppointmentSlot> findByDepartmentIdAndDate(Long departmentId, String date);
    void deleteByDepartmentId(Long departmentId);
    List<AppointmentSlot> findByBookedByEmailAndAvailableFalse(String email);
}
