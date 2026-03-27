package com.bandora.serice.controller;

import com.bandora.serice.entity.AppointmentSlot;
import com.bandora.serice.entity.Department;
import com.bandora.serice.repository.AppointmentSlotRepository;
import com.bandora.serice.repository.DepartmentRepository;
import com.bandora.serice.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clinics")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ClinicController {

    private final StoreRepository storeRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentSlotRepository slotRepository;

    @GetMapping("/{storeId}/departments")
    public ResponseEntity<?> getDepartments(@PathVariable Long storeId) {
        if (!storeRepository.existsById(storeId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(departmentRepository.findByStoreId(storeId).stream().map(d -> Map.of(
                "id", d.getId(),
                "name", d.getName(),
                "description", d.getDescription(),
                "doctorName", d.getDoctorName() != null ? d.getDoctorName() : "",
                "consultationFee", d.getConsultationFee(),
                "icon", d.getIcon() != null ? d.getIcon() : ""
        )).toList());
    }

    @GetMapping("/departments/{departmentId}/slots")
    public ResponseEntity<?> getSlots(
            @PathVariable Long departmentId,
            @RequestParam(required = false) String date) {

        if (!departmentRepository.existsById(departmentId)) return ResponseEntity.notFound().build();

        List<AppointmentSlot> slots = (date != null && !date.isBlank())
                ? slotRepository.findByDepartmentIdAndDate(departmentId, date)
                : slotRepository.findByDepartmentId(departmentId);

        return ResponseEntity.ok(slots.stream().map(s -> Map.of(
                "id", s.getId(),
                "date", s.getDate(),
                "time", s.getTime(),
                "period", s.getPeriod(),
                "available", s.isAvailable()
        )).toList());
    }
}
