package com.localvibe.serice.controller;

import com.localvibe.serice.entity.AppointmentSlot;
import com.localvibe.serice.entity.Department;
import com.localvibe.serice.repository.AppointmentSlotRepository;
import com.localvibe.serice.repository.DepartmentRepository;
import com.localvibe.serice.repository.StoreRepository;
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

    @PostMapping("/slots/{slotId}/book")
    public ResponseEntity<?> bookSlot(@PathVariable Long slotId) {
        return slotRepository.findById(slotId).map(slot -> {
            if (!slot.isAvailable()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Slot is already booked"));
            }
            slot.setAvailable(false);
            slotRepository.save(slot);
            return ResponseEntity.ok(Map.of(
                    "slotId", slot.getId(),
                    "date", slot.getDate(),
                    "time", slot.getTime(),
                    "message", "Booking confirmed"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/slots/{slotId}/cancel")
    public ResponseEntity<?> cancelSlot(@PathVariable Long slotId) {
        return slotRepository.findById(slotId).map(slot -> {
            slot.setAvailable(true);
            slotRepository.save(slot);
            return ResponseEntity.ok(Map.of("message", "Appointment cancelled"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{storeId}/departments")
    public ResponseEntity<?> addDepartment(
            @PathVariable Long storeId,
            @RequestBody Map<String, Object> body) {
        return storeRepository.findById(storeId).map(store -> {
            Department dept = new Department();
            dept.setStore(store);
            dept.setName((String) body.get("name"));
            dept.setDescription((String) body.get("description"));
            dept.setDoctorName((String) body.get("doctorName"));
            Object fee = body.get("consultationFee");
            if (fee != null) {
                dept.setConsultationFee(fee instanceof Number ? ((Number) fee).doubleValue() : Double.parseDouble(fee.toString()));
            }
            dept.setIcon((String) body.get("icon"));
            Department saved = departmentRepository.save(dept);
            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "name", saved.getName(),
                    "message", "Service added"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/departments/{departmentId}/slots/bulk")
    public ResponseEntity<?> addSlotsBulk(
            @PathVariable Long departmentId,
            @RequestBody List<Map<String, Object>> slots) {
        return departmentRepository.findById(departmentId).map(dept -> {
            List<AppointmentSlot> toSave = slots.stream().map(s -> {
                AppointmentSlot slot = new AppointmentSlot();
                slot.setDepartment(dept);
                slot.setDate((String) s.get("date"));
                slot.setTime((String) s.get("time"));
                slot.setPeriod((String) s.get("period"));
                Object avail = s.get("available");
                slot.setAvailable(avail == null || Boolean.TRUE.equals(avail));
                return slot;
            }).toList();
            slotRepository.saveAll(toSave);
            return ResponseEntity.ok(Map.of(
                    "count", toSave.size(),
                    "message", toSave.size() + " slots added"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/departments/{departmentId}/slots/bulk")
    @jakarta.transaction.Transactional
    public ResponseEntity<?> replaceSlotsBulk(
            @PathVariable Long departmentId,
            @RequestBody List<Map<String, Object>> slots) {
        return departmentRepository.findById(departmentId).map(dept -> {
            // Delete all existing slots for this department, then re-add
            slotRepository.deleteByDepartmentId(departmentId);
            List<AppointmentSlot> toSave = slots.stream().map(s -> {
                AppointmentSlot slot = new AppointmentSlot();
                slot.setDepartment(dept);
                slot.setDate((String) s.get("date"));
                slot.setTime((String) s.get("time"));
                slot.setPeriod((String) s.get("period"));
                Object avail = s.get("available");
                slot.setAvailable(avail == null || Boolean.TRUE.equals(avail));
                return slot;
            }).toList();
            slotRepository.saveAll(toSave);
            return ResponseEntity.ok(Map.of(
                    "count", toSave.size(),
                    "message", toSave.size() + " slots updated"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}
