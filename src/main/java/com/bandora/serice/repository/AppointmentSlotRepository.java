package com.bandora.serice.repository;

import com.bandora.serice.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {
    List<AppointmentSlot> findByDepartmentId(Long departmentId);
    List<AppointmentSlot> findByDepartmentIdAndDate(Long departmentId, String date);
}
