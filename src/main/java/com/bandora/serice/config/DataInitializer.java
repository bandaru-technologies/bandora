package com.bandora.serice.config;

import com.bandora.serice.entity.AppointmentSlot;
import com.bandora.serice.entity.Department;
import com.bandora.serice.entity.Product;
import com.bandora.serice.entity.Store;
import com.bandora.serice.repository.AppointmentSlotRepository;
import com.bandora.serice.repository.DepartmentRepository;
import com.bandora.serice.repository.ProductRepository;
import com.bandora.serice.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentSlotRepository slotRepository;

    @Override
    public void run(String... args) {
        seedDepartmentsAndSlots();
        if (storeRepository.count() > 0) return;

        // ── Stores ──────────────────────────────────────────────────────────
        Store dmart = storeRepository.save(Store.builder().name("D-Mart").category("Groceries")
                .address("12, MG Road, Bengaluru").latitude(12.9758).longitude(77.6011)
                .rating(4.5).reviewCount(1240).open(true)
                .timing("8:00 AM - 10:00 PM").phone("+91 98765 00001").build());

        Store bigBazaar = storeRepository.save(Store.builder().name("Big Bazaar").category("Groceries")
                .address("City Mall, Ring Road, Bengaluru").latitude(12.9700).longitude(77.5900)
                .rating(4.2).reviewCount(876).open(true)
                .timing("9:00 AM - 9:30 PM").phone("+91 98765 00002").build());

        storeRepository.saveAll(List.of(
                Store.builder().name("Reliance Fresh").category("Groceries")
                        .address("Koramangala, Bengaluru").latitude(12.9352).longitude(77.6245)
                        .rating(4.3).reviewCount(534).open(false)
                        .timing("7:00 AM - 9:00 PM").phone("+91 98765 00003").build(),
                Store.builder().name("More Supermarket").category("Groceries")
                        .address("Indiranagar, Bengaluru").latitude(12.9784).longitude(77.6408)
                        .rating(4.0).reviewCount(310).open(true)
                        .timing("8:30 AM - 9:00 PM").phone("+91 98765 00004").build(),
                Store.builder().name("Spencer's Retail").category("Groceries")
                        .address("Jayanagar, Bengaluru").latitude(12.9308).longitude(77.5838)
                        .rating(4.1).reviewCount(420).open(true)
                        .timing("9:00 AM - 10:00 PM").phone("+91 98765 00005").build(),
                Store.builder().name("Star Bazaar").category("Groceries")
                        .address("Whitefield, Bengaluru").latitude(12.9698).longitude(77.7499)
                        .rating(3.9).reviewCount(198).open(false)
                        .timing("8:00 AM - 8:30 PM").phone("+91 98765 00006").build(),
                Store.builder().name("Apollo Pharmacy").category("Pharmacy")
                        .address("MG Road, Bengaluru").latitude(12.9762).longitude(77.6033)
                        .rating(4.6).reviewCount(890).open(true)
                        .timing("24 Hours").phone("+91 98765 00010").build(),
                Store.builder().name("MedPlus").category("Pharmacy")
                        .address("Malleshwaram, Bengaluru").latitude(13.0035).longitude(77.5703)
                        .rating(4.3).reviewCount(560).open(true)
                        .timing("7:00 AM - 11:00 PM").phone("+91 98765 00011").build(),
                Store.builder().name("Croma").category("Electronics")
                        .address("Residency Road, Bengaluru").latitude(12.9722).longitude(77.5960)
                        .rating(4.4).reviewCount(720).open(true)
                        .timing("10:00 AM - 9:00 PM").phone("+91 98765 00020").build(),
                Store.builder().name("Reliance Digital").category("Electronics")
                        .address("Marathahalli, Bengaluru").latitude(12.9591).longitude(77.6974)
                        .rating(4.2).reviewCount(480).open(true)
                        .timing("10:00 AM - 9:30 PM").phone("+91 98765 00021").build()
        ));

        // ── D-Mart Products ─────────────────────────────────────────────────
        productRepository.saveAll(List.of(
                // Fruits & Vegetables
                Product.builder().store(dmart).name("Bananas").description("Fresh ripe bananas").subCategory("Fruits & Vegetables").price(40.0).originalPrice(50.0).unit("1 dozen").inStock(true).stockCount(200).build(),
                Product.builder().store(dmart).name("Tomatoes").description("Farm fresh tomatoes").subCategory("Fruits & Vegetables").price(30.0).originalPrice(35.0).unit("500 g").inStock(true).stockCount(150).build(),
                Product.builder().store(dmart).name("Onions").description("Red onions").subCategory("Fruits & Vegetables").price(25.0).originalPrice(25.0).unit("1 kg").inStock(true).stockCount(300).build(),
                Product.builder().store(dmart).name("Apples").description("Shimla apples").subCategory("Fruits & Vegetables").price(120.0).originalPrice(150.0).unit("1 kg").inStock(true).stockCount(80).build(),
                Product.builder().store(dmart).name("Spinach").description("Fresh green spinach").subCategory("Fruits & Vegetables").price(20.0).originalPrice(20.0).unit("250 g").inStock(true).stockCount(60).build(),
                Product.builder().store(dmart).name("Potatoes").description("Fresh potatoes").subCategory("Fruits & Vegetables").price(28.0).originalPrice(30.0).unit("1 kg").inStock(true).stockCount(250).build(),

                // Dairy
                Product.builder().store(dmart).name("Amul Full Cream Milk").description("Fresh full cream milk").subCategory("Dairy").price(28.0).originalPrice(28.0).unit("500 ml").inStock(true).stockCount(100).build(),
                Product.builder().store(dmart).name("Amul Butter").description("Pasteurised butter").subCategory("Dairy").price(55.0).originalPrice(58.0).unit("100 g").inStock(true).stockCount(90).build(),
                Product.builder().store(dmart).name("Amul Cheese Slices").description("Processed cheese slices").subCategory("Dairy").price(110.0).originalPrice(120.0).unit("10 slices").inStock(true).stockCount(50).build(),
                Product.builder().store(dmart).name("Mother Dairy Curd").description("Fresh set curd").subCategory("Dairy").price(42.0).originalPrice(45.0).unit("400 g").inStock(true).stockCount(70).build(),
                Product.builder().store(dmart).name("Nestle Yogurt").description("Creamy fruit yogurt").subCategory("Dairy").price(35.0).originalPrice(40.0).unit("100 g").inStock(false).stockCount(0).build(),

                // Bakery
                Product.builder().store(dmart).name("Britannia Bread").description("Whole wheat sandwich bread").subCategory("Bakery").price(42.0).originalPrice(45.0).unit("400 g").inStock(true).stockCount(80).build(),
                Product.builder().store(dmart).name("Britannia Good Day").description("Cashew butter cookies").subCategory("Bakery").price(30.0).originalPrice(30.0).unit("120 g").inStock(true).stockCount(120).build(),
                Product.builder().store(dmart).name("Parle-G").description("Glucose biscuits").subCategory("Bakery").price(10.0).originalPrice(10.0).unit("100 g").inStock(true).stockCount(200).build(),
                Product.builder().store(dmart).name("Croissant").description("Butter croissant").subCategory("Bakery").price(25.0).originalPrice(30.0).unit("1 piece").inStock(true).stockCount(40).build(),

                // Beverages
                Product.builder().store(dmart).name("Tropicana Orange Juice").description("100% orange juice").subCategory("Beverages").price(99.0).originalPrice(120.0).unit("1 L").inStock(true).stockCount(60).build(),
                Product.builder().store(dmart).name("Coca-Cola").description("Classic soft drink").subCategory("Beverages").price(40.0).originalPrice(40.0).unit("600 ml").inStock(true).stockCount(150).build(),
                Product.builder().store(dmart).name("Bisleri Water").description("Packaged drinking water").subCategory("Beverages").price(20.0).originalPrice(20.0).unit("1 L").inStock(true).stockCount(300).build(),
                Product.builder().store(dmart).name("Nescafe Classic").description("Instant coffee").subCategory("Beverages").price(190.0).originalPrice(210.0).unit("100 g").inStock(true).stockCount(45).build(),

                // Snacks
                Product.builder().store(dmart).name("Lay's Classic Salted").description("Potato chips").subCategory("Snacks").price(20.0).originalPrice(20.0).unit("26 g").inStock(true).stockCount(200).build(),
                Product.builder().store(dmart).name("Kurkure Masala Munch").description("Spicy corn puffs").subCategory("Snacks").price(20.0).originalPrice(20.0).unit("90 g").inStock(true).stockCount(180).build(),
                Product.builder().store(dmart).name("Haldiram's Bhujia").description("Classic sev bhujia").subCategory("Snacks").price(50.0).originalPrice(55.0).unit("200 g").inStock(true).stockCount(90).build(),

                // Staples
                Product.builder().store(dmart).name("Aashirvaad Atta").description("Whole wheat flour").subCategory("Staples").price(280.0).originalPrice(300.0).unit("5 kg").inStock(true).stockCount(100).build(),
                Product.builder().store(dmart).name("India Gate Basmati Rice").description("Premium basmati rice").subCategory("Staples").price(190.0).originalPrice(210.0).unit("1 kg").inStock(true).stockCount(80).build(),
                Product.builder().store(dmart).name("Tata Salt").description("Iodised table salt").subCategory("Staples").price(22.0).originalPrice(22.0).unit("1 kg").inStock(true).stockCount(250).build(),
                Product.builder().store(dmart).name("Fortune Sunflower Oil").description("Refined sunflower oil").subCategory("Staples").price(145.0).originalPrice(160.0).unit("1 L").inStock(true).stockCount(70).build()
        ));

        // ── Big Bazaar Products (sample) ─────────────────────────────────────
        productRepository.saveAll(List.of(
                Product.builder().store(bigBazaar).name("Amul Gold Milk").description("Full cream milk").subCategory("Dairy").price(32.0).originalPrice(32.0).unit("500 ml").inStock(true).stockCount(80).build(),
                Product.builder().store(bigBazaar).name("Lay's Magic Masala").description("Masala flavour chips").subCategory("Snacks").price(20.0).originalPrice(20.0).unit("26 g").inStock(true).stockCount(150).build(),
                Product.builder().store(bigBazaar).name("Tata Tea Premium").description("Blended black tea").subCategory("Beverages").price(190.0).originalPrice(200.0).unit("500 g").inStock(true).stockCount(60).build(),
                Product.builder().store(bigBazaar).name("Carrots").description("Fresh carrots").subCategory("Fruits & Vegetables").price(35.0).originalPrice(40.0).unit("500 g").inStock(true).stockCount(100).build()
        ));

    }

    private void seedDepartmentsAndSlots() {
        if (departmentRepository.count() > 0) return;

        // Find Vikram Hospital (already in DB from previous seed)
        Store vikram = storeRepository.findAll().stream()
                .filter(s -> "Vikram Hospital".equals(s.getName()))
                .findFirst().orElse(null);
        if (vikram == null) return;

        Department general = departmentRepository.save(Department.builder().store(vikram)
                .name("General Medicine").description("Common illnesses & check-ups")
                .doctorName("Dr. Ramesh Kumar").consultationFee(500.0).icon("medical").build());

        Department diabetes = departmentRepository.save(Department.builder().store(vikram)
                .name("Diabetes Test").description("Blood sugar, HbA1c, insulin tests")
                .doctorName("Dr. Priya Nair").consultationFee(800.0).icon("fitness").build());

        departmentRepository.save(Department.builder().store(vikram)
                .name("Cardiology").description("Heart & cardiovascular care")
                .doctorName("Dr. Arjun Mehta").consultationFee(1200.0).icon("heart").build());

        departmentRepository.save(Department.builder().store(vikram)
                .name("Orthopedics").description("Bone, joint & muscle conditions")
                .doctorName("Dr. Suresh Patel").consultationFee(900.0).icon("body").build());

        departmentRepository.save(Department.builder().store(vikram)
                .name("Dermatology").description("Skin, hair & nail conditions")
                .doctorName("Dr. Ananya Singh").consultationFee(700.0).icon("color-palette").build());

        departmentRepository.save(Department.builder().store(vikram)
                .name("Neurology").description("Brain & nervous system disorders")
                .doctorName("Dr. Vikram Iyer").consultationFee(1500.0).icon("pulse").build());

        // Dynamic dates: today & tomorrow
        java.time.LocalDate today = java.time.LocalDate.now();
        String[] dates = {today.toString(), today.plusDays(1).toString()};

        String[][] slots = {
                {"09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"},
                {"02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"},
                {"06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"}
        };
        String[] periods = {"Morning", "Afternoon", "Evening"};
        boolean[][] availability = {
                {true, true, false, true, true, false},
                {false, true, true, true, false, true},
                {true, false, true, true}
        };

        List<AppointmentSlot> allSlots = new ArrayList<>();
        for (String date : dates) {
            for (int p = 0; p < slots.length; p++) {
                for (int t = 0; t < slots[p].length; t++) {
                    allSlots.add(AppointmentSlot.builder()
                            .department(diabetes).date(date)
                            .time(slots[p][t]).period(periods[p])
                            .available(availability[p][t % availability[p].length])
                            .build());
                }
            }
        }
        slotRepository.saveAll(allSlots);

        // Slots for General Medicine — today only
        String[] gmSlots = {"09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","03:00 PM","03:30 PM","04:00 PM"};
        boolean[] gmAvail = {true, false, true, true, false, true, true, false};
        String[] gmPeriods = {"Morning","Morning","Morning","Morning","Morning","Afternoon","Afternoon","Afternoon"};
        List<AppointmentSlot> gmSlotList = new ArrayList<>();
        for (int i = 0; i < gmSlots.length; i++) {
            gmSlotList.add(AppointmentSlot.builder()
                    .department(general).date(today.toString())
                    .time(gmSlots[i]).period(gmPeriods[i]).available(gmAvail[i]).build());
        }
        slotRepository.saveAll(gmSlotList);
    }
}
