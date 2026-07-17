-- Imported from the client raw-material and GoFrugal item-master workbooks on 2026-07-17.
alter table public.ingredients
  add column if not exists current_stock numeric(14,3) default 0,
  add column if not exists max_stock numeric(14,3) default 0,
  add column if not exists batch_no text,
  add column if not exists storage text default 'ambient',
  add column if not exists purchase_unit text,
  add column if not exists conversion_qty numeric(14,4) default 0,
  add column if not exists consumption_unit text,
  add column if not exists purchase_price numeric(14,2) default 0,
  add column if not exists transfer_price numeric(14,2) default 0,
  add column if not exists tax_type text,
  add column if not exists tax_rate numeric(7,3) default 0,
  add column if not exists hsn text,
  add column if not exists at_par_stock numeric(14,3) default 0,
  add column if not exists sub_category text,
  add column if not exists normal_loss_pct numeric(7,3) default 0,
  add column if not exists expiry_tracked boolean default false,
  add column if not exists best_before_days integer default 0,
  add column if not exists reconciliation_price numeric(14,2) default 0,
  add column if not exists barcode text,
  add column if not exists allow_decimal boolean default false,
  add column if not exists stock_keeping_method text,
  add column if not exists batch_wise boolean default false,
  add column if not exists source_sheet text,
  add column if not exists updated_at timestamptz default now();

create index if not exists ingredients_category_idx on public.ingredients(category);
create index if not exists ingredients_active_idx on public.ingredients(active);
create index if not exists ingredients_barcode_idx on public.ingredients(barcode) where barcode is not null and barcode <> '';

insert into public.ingredients (
  code, name, category, unit, current_stock, min_stock, max_stock, reorder_qty, unit_cost,
  batch_no, storage, purchase_unit, conversion_qty, consumption_unit, purchase_price, transfer_price,
  tax_type, tax_rate, hsn, at_par_stock, sub_category, normal_loss_pct, expiry_tracked, best_before_days,
  reconciliation_price, barcode, allow_decimal, stock_keeping_method, batch_wise, active, source_sheet
) values
(
  'rm-premium-kaju-box-regular-001', 'Premium Kaju Box Regular', 'Gift Box (dry Fruits & Special Sweets)', 'box', 1, 0, 0, 0, 790.47,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 790.47,
  'GST', 5, '', 1, '', 0, true, 0,
  0, 'premium kaju box reg', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-premium-kaju-box-small-002', 'Premium Kaju Box Small', 'Gift Box (dry Fruits & Special Sweets)', 'box', 1, 0, 0, 0, 704.76,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 704.76,
  'GST', 5, '', 1, '', 0, true, 0,
  0, 'premium kaju box sma', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-premium-kaju-box-medium-003', 'Premium Kaju Box Medium', 'Gift Box (dry Fruits & Special Sweets)', 'box', 1, 0, 0, 0, 1266.66,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 1266.66,
  'GST', 5, '', 1, '', 0, true, 0,
  0, 'premium kaju box med', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-premium-kaju-box-large-004', 'Premium Kaju Box Large', 'Gift Box (dry Fruits & Special Sweets)', 'box', 1, 0, 0, 0, 1409.52,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 1409.52,
  'GST', 5, '', 1, '', 0, true, 0,
  0, 'premium kaju box lar', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-onion-paratha-005', 'Onion Paratha', 'Aloo Paratha', 'plate', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'plate', 0, 'plate', 0, 0,
  'GST', 5, '', 0, '', 0, true, 1,
  0, 'onion paratha', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-aloo-cheese-paratha-006', 'Aloo Cheese Paratha', 'Aloo Paratha', 'plate', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'plate', 0, 'plate', 0, 0,
  'GST', 0, '', 0, '', 0, false, 0,
  0, 'Aloo Cheese Paratha', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-paneer-paratha-007', 'Paneer Paratha', 'Aloo Paratha', 'plate', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'chilled', 'plate', 0, 'plate', 0, 0,
  'GST', 0, '', 0, '', 0, false, 0,
  0, 'Paneer Paratha', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gobi-paratha-008', 'Gobi Paratha', 'Aloo Paratha', 'plate', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'plate', 0, 'plate', 0, 0,
  'GST', 0, '', 0, '', 0, false, 0,
  0, 'Gobi Paratha', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-aloo-paratha-009', 'Aloo Paratha', 'Aloo Paratha', 'plate', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'plate', 0, 'plate', 0, 0,
  'GST', 0, '', 0, '', 0, false, 0,
  0, 'Aloo Paratha', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-imli-sweet-chutney-010', 'Imli Sweet Chutney', 'Rm Semi Chat Items', 'kg', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 0,
  'GST', 0, '', 0, '', 0, false, 0,
  0, 'IM', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-anjeer-mava-sandwich-011', 'Anjeer Mava Sandwich', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 0,
  'GST', 0, '', 0, '', 0, false, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-sweet-curd-012', 'Sweet Curd', 'Rm Semi Chat Items', 'kg', 0.5, 0, 0, 0, 60,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 60,
  'GST', 5, '', 0.5, '', 0, true, 2,
  0, '', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-green-chutney-013', 'Green Chutney', 'Rm Semi Chat Items', 'kg', 0.25, 0, 0, 0, 50,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 50,
  'GST', 5, '', 0.25, '', 0, true, 1,
  0, '', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pani-mint-water-014', 'Pani Mint Water', 'Rm Semi Chat Items', 'kg', 0.8, 0, 0, 0, 50,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 50,
  'GST', 5, '', 0.8, '', 0, true, 1,
  0, '', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pav-bhaji-gravy-015', 'Pav Bhaji Gravy', 'Rm Semi Chat Items', 'kg', 0.5, 0, 0, 0, 50,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 50,
  'GST', 5, '', 0.5, '', 0, true, 1,
  0, '', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-masala-gravy-016', 'Masala Gravy', 'Rm Semi Chat Items', 'kg', 1, 0, 0, 0, 100,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 100,
  'GST', 5, '', 1, '', 0, true, 1,
  0, '', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-frooti-017', 'Frooti', 'Water & Soft Drinks', 'pcs', 0, 0, 0, 0, 9.5,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 9.5,
  'GST', 5, '', 0, '', 0, false, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-swarnam-royal-018', 'Swarnam-royal', 'Gift Box (dry Fruits & Special Sweets)', 'box', 1, 0, 0, 0, 1276.2,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 1276.2,
  'GST', 5, '', 1, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-swarnam-clasic-019', 'Swarnam-clasic', 'Gift Box (dry Fruits & Special Sweets)', 'box', 1, 0, 0, 0, 638.1,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 638.1,
  'GST', 5, '', 1, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-spl-gift-plates-a1-020', 'Spl Gift Plates A1', 'Gift Box (dry Fruits & Special Sweets)', 'pcs', 0, 0, 0, 0, 666.7,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 666.7,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-spl-gift-plates-b1-021', 'Spl Gift Plates B1', 'Gift Box (dry Fruits & Special Sweets)', 'pcs', 0, 0, 0, 0, 428.6,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 428.6,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ghee-sweets-gift-pack-022', 'Ghee Sweets Gift Pack', 'Gift Box (dry Fruits & Special Sweets)', 'kg', 2, 0, 0, 0, 685.7,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 685.7,
  'GST', 5, '', 2, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-special-sweets-gift-pack-023', 'Special Sweets Gift Pack', 'Gift Box (dry Fruits & Special Sweets)', 'kg', 2, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 2, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-biscuits-gift-pack-024', 'Kaju Biscuits Gift Pack', 'Gift Box (dry Fruits & Special Sweets)', 'kg', 2, 0, 0, 0, 1142.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1142.9,
  'GST', 5, '', 2, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-sweets-gift-pack-025', 'Kaju Sweets Gift Pack', 'Gift Box (dry Fruits & Special Sweets)', 'kg', 2, 0, 0, 0, 1200,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1200,
  'GST', 5, '', 2, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-450gms-75gx6-026', '450gms - 75gx6', 'Gift Box (dry Fruits & Special Sweets)', 'box', 2, 2, 0, 0, 618.1,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 618.1,
  'GST', 5, '0', 2, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-water-botttle-2ltrs-027', 'Water Botttle 2ltrs', 'Water & Soft Drinks', 'pcs', 0, 0, 0, 0, 28.6,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 28.6,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pista-punch-028', 'Pista Punch', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 685.7,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 685.7,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pakeeza-029', 'Pakeeza', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 685.7,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 685.7,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kesar-petha-roll-030', 'Kesar Petha Roll', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 552.4,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 552.4,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-petha-angoor-031', 'Petha Angoor', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 457.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 457.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-freshfruit-halwa-032', 'Freshfruit Halwa', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 725.6,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 725.6,
  'GST', 5, '', 0, '', 0, true, 5,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-cashew-chocolates-033', 'Cashew Chocolates', 'Cookies', 'piece', 3, 0, 0, 0, 314.3,
  'IMPORTED-20260717', 'ambient', 'Piece', 0, 'Piece', 0, 314.3,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-almond-chocolates-034', 'Almond Chocolates', 'Cookies', 'piece', 3, 0, 0, 0, 314.3,
  'IMPORTED-20260717', 'ambient', 'Piece', 0, 'Piece', 0, 314.3,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-gajak-burfi-250gms-035', 'Gud Gajak Burfi 250gms', 'Til Items', 'pcs', 3, 0, 0, 0, 257.1,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 257.1,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-gajak-roll-200gms-036', 'Gud Gajak Roll 200gms', 'Til Items', 'pcs', 3, 0, 0, 0, 104.8,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 104.8,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-khasta-gajak-200gms-037', 'Gud Khasta Gajak 200gms', 'Til Items', 'pcs', 3, 0, 0, 0, 104.8,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 104.8,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-rewdi-200gms-038', 'Gud Rewdi 200gms', 'Til Items', 'pcs', 3, 0, 0, 0, 128.6,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 128.6,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-moong-dal-burfi-039', 'Moong Dal Burfi', 'Milk & Ghee Sweets', 'kg', 0.5, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-sandwich-040', 'Kaju Sandwich', 'Kaju & Anjeer Sweets', 'kg', 0.5, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-milk-halwa-041', 'Milk Halwa', 'Milk & Ghee Sweets', 'kg', 0.5, 0, 0, 0, 819,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '', 0.5, '', 0, true, 0,
  860, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-maza-042', 'Maza', 'Water & Soft Drinks', 'pcs', 0, 0, 0, 0, 9.5,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 9.5,
  'GST', 5, '', 0, '', 0, false, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-til-burfi-043', 'Til Burfi', 'Til Items', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 0, '', 0, false, 0,
  0, '10179', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kesar-modak-044', 'Kesar Modak', 'Modak Sweets', 'kg', 0, 0, 0, 0, 819,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '', 0, '', 0, false, 0,
  0, '10144', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-honey-dew-045', 'Honey Dew', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 0, '', 0, false, 0,
  0, '10018', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-blueberry-delight-046', 'Blueberry Delight', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '', 0, '', 0, false, 0,
  0, '10045', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-besan-badam-cookies-047', 'Besan Badam Cookies', 'Cookies', 'box', 3, 0, 0, 0, 304.8,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 304.8,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '20227', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-sugarfree-kaju-katli-048', 'Sugarfree Kaju Katli', 'Kaju & Anjeer Sweets', 'kg', 0.5, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10057', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chocolate-crunch-150-gms-049', 'Chocolate Crunch 150 Gms', 'Cookies', 'box', 3, 0, 0, 0, 209.52,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 209.52,
  'GST', 5, '', 3, '', 0, true, 0,
  0, 'chocolate crunch 150', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-kalakand-050', 'Gud Kalakand', 'Bengali Sweets', 'kg', 0.5, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '', 0.5, '', 0, true, 0,
  960, '10224', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malai-puri-051', 'Malai Puri', 'Bengali Sweets', 'kg', 0.5, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10222', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kesar-pista-sticks-300gms-052', 'Kesar Pista Sticks 300gms', 'Cookies', 'box', 3, 0, 0, 0, 314.3,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 314.3,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '20229', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-butter-coconut-cookies-250gms-053', 'Butter Coconut Cookies 250gms', 'Cookies', 'box', 3, 0, 0, 0, 219,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 219,
  'GST', 5, '', 3, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chakli-054', 'Chakli', 'Savouries', 'kg', 1, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '', 1, '', 0, true, 0,
  0, '10223', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-blueberry-katli-055', 'Blueberry Katli', 'Kaju & Anjeer Sweets', 'kg', 0.4, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '', 0.4, '', 0, true, 0,
  0, '10050', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-choco-roll-056', 'Kaju Choco Roll', 'Kaju & Anjeer Sweets', 'kg', 0.4, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '', 0.4, '', 0, true, 0,
  0, '10231', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-600gms-100gx6-057', '600gms - 100gx6', 'Gift Box (dry Fruits & Special Sweets)', 'box', 0, 0, 0, 0, 713.3,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 713.3,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20216', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-400gms-100gx4-058', '400gms - 100gx4', 'Gift Box (dry Fruits & Special Sweets)', 'box', 0, 0, 0, 0, 541.9,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 541.9,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20214', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mango-malai-golla-059', 'Mango Malai Golla', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20225', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-tiranga-burfi-060', 'Tiranga Burfi', 'Milk & Ghee Sweets', 'kg', 1, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 1, '', 0, true, 0,
  0, '10226', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-semi-malai-for-ghewar-061', 'Semi Malai For Ghewar', 'Ghewar', 'kg', 0.5, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '', true, 'FIFO', true, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-dhai-vada-062', 'Dhai Vada', 'Rm Chats Items', 'pcs', 0, 0, 0, 0, 85.7,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 85.7,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20199', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-raj-kachori-063', 'Raj Kachori', 'Rm Chats Items', 'pcs', 0, 0, 0, 0, 85.7,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 85.7,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20206', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rm-kaara-boondhi-chat-064', 'Rm Kaara Boondhi Chat', 'Rm Semi Chat Items', 'kg', 0.5, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 0,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-jalebi-065', 'Jalebi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 495.2,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 495.2,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10091', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-sweet-boondhi-ghee-066', 'Sweet Boondhi Ghee', 'Milk & Ghee Sweets', 'kg', 0.5, 0, 0, 0, 647.6,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 647.6,
  'GST', 5, '0', 0.5, '', 0, true, 0,
  0, '10120', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-boondhi-laddu-067', 'Boondhi Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 495.2,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 495.2,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10099', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kajaya-068', 'Kajaya', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 495.2,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 495.2,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10093', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-jangiri-069', 'Jangiri', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 495.2,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 495.2,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10092', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-plain-kova-070', 'Plain Kova', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 514.3,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 514.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10113', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pheni-2pcs-071', 'Pheni 2pcs', 'Milk & Ghee Sweets', 'pack', 0, 0, 0, 0, 57.1,
  'IMPORTED-20260717', 'chilled', 'pack', 0, 'pack', 0, 57.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20110', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ghee-jalebi-072', 'Ghee Jalebi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 647.6,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 647.6,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10082', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-badusha-073', 'Badusha', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10067', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chandrakala-074', 'Chandrakala', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10074', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mysore-pak-hard-075', 'Mysore Pak Hard', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10106', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ghee-jangiri-076', 'Ghee Jangiri', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10083', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-carrot-halwa-077', 'Carrot Halwa', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10072', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-bombay-halwa-078', 'Bombay Halwa', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10070', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ghee-laddu-079', 'Ghee Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10084', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-wheat-halwa-080', 'Wheat Halwa', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10123', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-tender-coconut-halwa-081', 'Tender Coconut Halwa', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10121', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-sugarcane-milk-halwa-082', 'Sugarcane Milk Halwa', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10119', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gujiya-083', 'Gujiya', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10087', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-paneer-jalebi-084', 'Paneer Jalebi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10109', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-besan-laddu-085', 'Besan Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10069', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-banaras-soanpapdi-086', 'Banaras Soanpapdi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10068', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-dharwad-peda-087', 'Dharwad Peda', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10078', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-doodh-peda-088', 'Doodh Peda', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10080', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mothi-pak-089', 'Mothi Pak', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10104', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chocolate-burfi-090', 'Chocolate Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10075', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-coconut-burfi-091', 'Coconut Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 819,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10076', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-thirupati-laddu-092', 'Thirupati Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10122', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kalakand-burfi-093', 'Kalakand Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10094', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gondh-laddu-094', 'Gondh Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10085', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gulkand-roll-095', 'Gulkand Roll', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10088', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pista-burfi-096', 'Pista Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10111', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-horlicks-burfi-097', 'Horlicks Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10089', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-doda-burfi-098', 'Doda Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10079', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-milk-cake-099', 'Milk Cake', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10102', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-khajur-dry-fruit-laddu-100', 'Khajur Dry Fruit Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10098', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-khajur-dry-fruit-burfi-101', 'Khajur Dry Fruit Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10097', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-special-kalakand-102', 'Special Kalakand', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10117', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ajmeri-kalakand-103', 'Ajmeri Kalakand', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10064', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pista-katli-104', 'Pista Katli', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10112', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mothichur-laddu-105', 'Mothichur Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10105', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kesar-peda-106', 'Kesar Peda', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10096', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kashmiri-kalakand-107', 'Kashmiri Kalakand', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10095', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-roasted-chenna-dhal-burfi-108', 'Roasted Chenna Dhal Burfi', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 819,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10115', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malai-peda-109', 'Malai Peda', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10100', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ajmeri-milk-cake-110', 'Ajmeri Milk Cake', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10065', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-dry-fruit-halwa-111', 'Dry Fruit Halwa', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10081', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-special-mysore-pak-112', 'Special Mysore Pak', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10118', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-milk-mysore-pak-113', 'Milk Mysore Pak', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10103', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-palm-jaggary-mothi-laddu-114', 'Palm Jaggary Mothi Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10107', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-palm-jaggary-mysore-pak-115', 'Palm Jaggary Mysore Pak', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10108', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mango-mysore-pak-116', 'Mango Mysore Pak', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10101', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-jackfruit-mysore-pak-117', 'Jackfruit Mysore Pak', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10090', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-zeero-sugar-laddu-118', 'Zeero Sugar Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10124', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-butterscotch-badam-laddu-119', 'Butterscotch Badam Laddu', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10071', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-anjeer-kalakand-120', 'Anjeer Kalakand', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10066', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-carrot-mysore-pak-121', 'Carrot Mysore Pak', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10073', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-soan-cake-122', 'Soan Cake', 'Milk & Ghee Sweets', 'kg', 0, 0, 0, 0, 819,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10116', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-putharekulu-dry-fruits-123', 'Putharekulu Dry Fruits', 'Milk & Ghee Sweets', 'box', 0, 0, 0, 0, 190.5,
  'IMPORTED-20260717', 'chilled', 'BOX', 0, 'BOX', 0, 190.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20114', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-mysore-pak-124', 'Kaju Mysore Pak', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10051', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-soan-papdi-125', 'Kaju Soan Papdi', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10056', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-pine-126', 'Kaju Pine', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 914.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 914.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10053', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-caramel-roll-127', 'Kaju Caramel Roll', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10042', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-katli-128', 'Kaju Katli', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10048', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-kaju-katli-129', 'Gud Kaju Katli', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1314.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1314.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10041', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-pista-roll-130', 'Kaju Pista Roll', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10054', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-flower-131', 'Kaju Flower', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10046', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-anjeer-roll-132', 'Anjeer Roll', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10036', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-chocolate-burfi-133', 'Kaju Chocolate Burfi', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10044', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kesar-pista-katli-134', 'Kesar Pista Katli', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10058', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-kalam-135', 'Kaju Kalam', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10047', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-choco-laddu-136', 'Kaju Choco Laddu', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10043', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-katori-137', 'Kaju Katori', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10049', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-paan-138', 'Kaju Paan', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10052', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-roasted-kaju-roll-139', 'Roasted Kaju Roll', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10059', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-anjeer-dry-fruit-burfi-140', 'Anjeer Dry Fruit Burfi', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10035', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-rose-petals-laddu-141', 'Kaju Rose Petals Laddu', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10055', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-badam-katli-142', 'Badam Katli', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10038', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-sugar-free-dry-fruit-burfi-143', 'Sugar Free Dry Fruit Burfi', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10060', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-choco-mango-delicacies-144', 'Choco Mango Delicacies', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10039', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-badam-halwa-145', 'Badam Halwa', 'Kaju & Anjeer Sweets', 'kg', 0, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10037', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pista-bites-146', 'Pista Bites', 'Bites Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10028', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chocolate-bites-147', 'Chocolate Bites', 'Bites Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10027', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-badam-bites-148', 'Badam Bites', 'Bites Sweets', 'kg', 0, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10026', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-coconut-holige-149', 'Coconut Holige', 'Holige', 'pcs', 0, 0, 0, 0, 28.6,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 28.6,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20147', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-dhal-holige-150', 'Dhal Holige', 'Holige', 'pcs', 0, 0, 0, 0, 28.6,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 28.6,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20148', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-agra-petha-151', 'Agra Petha', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 457.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 457.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10001', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-petha-roll-152', 'Petha Roll', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10021', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-fresh-paneer-153', 'Fresh Paneer', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 609.5,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 609.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10007', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chenna-poda-154', 'Chenna Poda', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10005', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malai-sandwich-155', 'Malai Sandwich', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10016', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-cream-sandwich-156', 'Cream Sandwich', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10006', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-cham-cham-157', 'Cham Cham', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10003', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-champakali-158', 'Champakali', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10004', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaala-jamun-159', 'Kaala Jamun', 'Bengali Sweets', 'kg', 0.25, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0.25, '', 0, true, 0,
  0, '10011', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kheer-kadam-160', 'Kheer Kadam', 'Bengali Sweets', 'kg', 0.25, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0.25, '', 0, true, 0,
  0, '10013', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rasapberry-161', 'Rasapberry', 'Bengali Sweets', 'kg', 0.25, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0.25, '', 0, true, 0,
  0, '10023', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-angoor-jamun-162', 'Angoor Jamun', 'Bengali Sweets', 'kg', 0.25, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0.25, '', 0, true, 0,
  0, '10002', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-paneer-jamun-163', 'Paneer Jamun', 'Bengali Sweets', 'kg', 0.25, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0.25, '', 0, true, 0,
  0, '10019', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-raskadam-164', 'Raskadam', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10024', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-parwal-sandwich-165', 'Parwal Sandwich', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10020', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-petha-sandwich-166', 'Petha Sandwich', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10022', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-langcha-167', 'Langcha', 'Bengali Sweets', 'pcs', 0, 0, 0, 0, 38.1,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 38.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20014', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-sandesh-168', 'Sandesh', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10025', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-sandesh-169', 'Gud Sandesh', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10009', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-kacha-golla-170', 'Gud Kacha Golla', 'Bengali Sweets', 'kg', 0.5, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0.5, '', 0, true, 0,
  0, '10008', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rasagulla-171', 'Rasagulla', 'Milk Liquid Sweets', 'pcs', 10, 0, 0, 0, 33.3,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 33.3,
  'GST', 5, '0', 10, '', 0, true, 0,
  0, '20140', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-jamun-172', 'Jamun', 'Milk Liquid Sweets', 'pcs', 10, 0, 0, 0, 33.3,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 33.3,
  'GST', 5, '0', 10, '', 0, true, 0,
  0, '20131', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-rasagulla-173', 'Gud Rasagulla', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 38.1,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 38.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20129', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malpua-174', 'Malpua', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 38.1,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 38.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20135', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rajbhog-175', 'Rajbhog', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 38.1,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 38.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20139', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rasamalai-176', 'Rasamalai', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 47.6,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 47.6,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20141', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mishti-doi-177', 'Mishti Doi', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 66.7,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 66.7,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20138', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-baked-rasagulla-178', 'Baked Rasagulla', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20125', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malai-roll-179', 'Malai Roll', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20134', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-butterscotch-malai-gillouri-180', 'Butterscotch Malai Gillouri', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20126', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-lychee-chenna-kheer-181', 'Lychee Chenna Kheer', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20133', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-fruit-cream-cup-182', 'Fruit Cream Cup', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20128', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chenna-payas-183', 'Chenna Payas', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20127', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-matka-rabidi-184', 'Matka Rabidi', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 71.4,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 71.4,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20137', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kesar-malai-cup-185', 'Kesar Malai Cup', 'Milk Liquid Sweets', 'pcs', 0, 0, 0, 0, 61.9,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 61.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20132', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-plain-ghewar-186', 'Plain Ghewar', 'Ghewar', 'kg', 0, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10034', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malai-gheawr-187', 'Malai Gheawr', 'Ghewar', 'kg', 0, 0, 0, 0, 819,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10033', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-keasar-ghewar-188', 'Keasar Ghewar', 'Ghewar', 'kg', 0, 0, 0, 0, 819,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10032', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-dryfruit-ghewar-189', 'Dryfruit Ghewar', 'Ghewar', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10031', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-plain-dhokla-190', 'Plain Dhokla', 'Dhokla', 'plate', 0, 0, 0, 0, 47.6,
  'IMPORTED-20260717', 'ambient', 'plate', 0, 'plate', 0, 47.6,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20029', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-sandwich-dhokla-191', 'Sandwich Dhokla', 'Dhokla', 'plate', 0, 0, 0, 0, 57.1,
  'IMPORTED-20260717', 'ambient', 'plate', 0, 'plate', 0, 57.1,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20030', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-water-botttle-1-2ltr-192', 'Water Botttle 1/2ltr', 'Water & Soft Drinks', 'pcs', 0, 0, 0, 0, 9.5,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 9.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20210', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-water-botttle-1ltr-193', 'Water Botttle 1ltr', 'Water & Soft Drinks', 'pcs', 0, 0, 0, 0, 19,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 19,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '20211', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-aval-mixture-194', 'Aval Mixture', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10178', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-corn-mixture-195', 'Corn Mixture', 'Savouries', 'kg', 0, 0, 0, 0, 571.4,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 571.4,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10153', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-bombay-mixture-196', 'Bombay Mixture', 'Savouries', 'kg', 0, 0, 0, 0, 571.4,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 571.4,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10150', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-madhur-vada-197', 'Madhur Vada', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10164', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-masala-peanut-198', 'Masala Peanut', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10165', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaara-boondhi-199', 'Kaara Boondhi', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10158', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-chakodi-200', 'Chakodi', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10152', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-small-nippattu-201', 'Small Nippattu', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10176', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ellu-murukku-202', 'Ellu Murukku', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10156', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaara-sev-203', 'Kaara Sev', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10160', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-small-sev-204', 'Small Sev', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10177', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kodubale-205', 'Kodubale', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10163', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ompodi-206', 'Ompodi', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10168', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-dry-samosa-207', 'Dry Samosa', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10155', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-ribbon-murukku-208', 'Ribbon Murukku', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10172', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-onion-pakkoda-209', 'Onion Pakkoda', 'Savouries', 'kg', 0, 0, 0, 0, 495.2,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 495.2,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10169', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-palak-pakoda-210', 'Palak Pakoda', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10170', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-karela-pakoda-211', 'Karela Pakoda', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10162', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-garlic-nippattu-212', 'Garlic Nippattu', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10157', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaara-mixture-213', 'Kaara Mixture', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10159', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-namak-para-214', 'Namak Para', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10166', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-dry-fruit-mixture-215', 'Dry Fruit Mixture', 'Savouries', 'kg', 0, 0, 0, 0, 609.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 609.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10154', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-navadhaniya-mixture-216', 'Navadhaniya Mixture', 'Savouries', 'kg', 0, 0, 0, 0, 609.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 609.5,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10167', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-pakoda-217', 'Kaju Pakoda', 'Savouries', 'kg', 0, 0, 0, 0, 685.7,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 685.7,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10161', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pepper-cashews-218', 'Pepper Cashews', 'Savouries', 'kg', 0, 0, 0, 0, 1714.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1714.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10171', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-salted-cashews-219', 'Salted Cashews', 'Savouries', 'kg', 0, 0, 0, 0, 1714.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1714.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10174', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-salted-badam-220', 'Salted Badam', 'Savouries', 'kg', 0, 0, 0, 0, 1714.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1714.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10173', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-butter-murukku-221', 'Butter Murukku', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10151', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-big-nippattu-222', 'Big Nippattu', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10149', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-shakkar-pali-223', 'Shakkar Pali', 'Savouries', 'kg', 0, 0, 0, 0, 533.3,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 533.3,
  'GST', 5, '0', 0, '', 0, true, 0,
  0, '10175', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-hot-and-cold-badam-milk-200ml-224', 'Hot & Cold Badam Milk 200ml', 'Milk Liquid Sweets', 'pcs', 5, 0, 0, 0, 57.1,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 57.1,
  'GST', 5, '0', 5, '', 0, true, 0,
  0, '20130', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-plain-modak-225', 'Plain Modak', 'Modak Sweets', 'kg', 1, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 1, '', 0, true, 0,
  0, '10146', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kaju-modak-226', 'Kaju Modak', 'Modak Sweets', 'kg', 1, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '0', 1, '', 0, true, 0,
  0, '10143', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-coconut-modak-227', 'Coconut Modak', 'Modak Sweets', 'kg', 1, 0, 0, 0, 819,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '0', 1, '', 0, true, 0,
  0, '10142', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mothichur-modak-228', 'Mothichur Modak', 'Modak Sweets', 'kg', 1, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '0', 1, '', 0, true, 0,
  0, '10145', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-maza-frooti-229', 'Maza/frooti', 'Water & Soft Drinks', 'pcs', 5, 0, 0, 0, 9.5,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 9.5,
  'GST', 5, '0', 5, '', 0, true, 0,
  0, '20209', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pomegranate-turkish-delight-230', 'Pomegranate Turkish Delight', 'Turkish Delights', 'kg', 1, 1, 0, 0, 857.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '0', 1, '', 0, true, 0,
  0, '10181', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-200gms-50gx4-231', '200gms - 50gx4', 'Gift Box (dry Fruits & Special Sweets)', 'box', 2, 2, 0, 0, 332.4,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 332.4,
  'GST', 5, '0', 2, '', 0, true, 0,
  0, '20212', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-300gms-75gx4-232', '300gms - 75gx4', 'Gift Box (dry Fruits & Special Sweets)', 'box', 2, 2, 0, 0, 465.7,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 465.7,
  'GST', 5, '0', 2, '', 0, true, 0,
  0, '20213', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-500gms-125gx4-233', '500gms - 125gx4', 'Gift Box (dry Fruits & Special Sweets)', 'box', 2, 2, 0, 0, 656.2,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 656.2,
  'GST', 5, '0', 2, '', 0, true, 0,
  0, '20215', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-750gms-125gx6-234', '750gms - 125gx6', 'Gift Box (dry Fruits & Special Sweets)', 'box', 2, 2, 0, 0, 856.2,
  'IMPORTED-20260717', 'ambient', 'BOX', 0, 'BOX', 0, 856.2,
  'GST', 5, '0', 2, '', 0, true, 0,
  0, '20217', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-til-mava-laddu-235', 'Til Mava Laddu', 'Til Items', 'kg', 1, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 1, '', 0, true, 0,
  0, '10180', true, 'Weighted', false, false, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rose-kaju-biscuits-236', 'Rose Kaju Biscuits', 'Kaju Biscuits', 'kg', 0.5, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10063', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-pista-kaju-biscuits-237', 'Pista Kaju Biscuits', 'Kaju Biscuits', 'kg', 0.5, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10062', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-creme-coco-laddu-238', 'Creme Coco Laddu', 'Milk & Ghee Sweets', 'kg', 1, 0, 0, 0, 819,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '', 1, '', 0, true, 0,
  0, '10077', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-cranberry-delight-239', 'Cranberry Delight', 'Kaju & Anjeer Sweets', 'kg', 0.5, 0, 0, 0, 1390.5,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1390.5,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10040', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kesar-cham-cham-240', 'Kesar Cham Cham', 'Bengali Sweets', 'kg', 0.5, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10012', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malai-chop-241', 'Malai Chop', 'Bengali Sweets', 'kg', 0.5, 0, 0, 0, 761.9,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 761.9,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10015', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-badam-kaju-biscuits-242', 'Badam Kaju Biscuits', 'Kaju Biscuits', 'kg', 0.5, 0, 0, 0, 1257.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 1257.1,
  'GST', 5, '', 0.5, '', 0, true, 0,
  0, '10061', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-gud-soanpapdi-243', 'Gud Soanpapdi', 'Milk & Ghee Sweets', 'kg', 1, 0, 0, 0, 819,
  'IMPORTED-20260717', 'chilled', 'Kg', 0, 'Kg', 0, 819,
  'GST', 5, '', 1, '', 0, true, 0,
  0, '10086', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-malai-toast-244', 'Malai Toast', 'Bengali Sweets', 'pcs', 2, 0, 0, 0, 57.1,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 57.1,
  'GST', 5, '', 2, '', 0, true, 0,
  0, '20017', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-mango-rabidi-245', 'Mango Rabidi', 'Milk Liquid Sweets', 'pcs', 2, 0, 0, 0, 76.2,
  'IMPORTED-20260717', 'chilled', 'pcs', 0, 'pcs', 0, 76.2,
  'GST', 5, '', 2, '', 0, true, 0,
  0, '20136', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-samosa-plain-246', 'Samosa Plain', 'Rm Chats Items', 'pcs', 0, 0, 0, 0, 23.8,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 23.8,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20182', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-kachori-plain-247', 'Kachori Plain', 'Rm Chats Items', 'pcs', 0, 0, 0, 0, 28.6,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 28.6,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20183', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-aloo-tikki-plain-248', 'Aloo Tikki Plain', 'Rm Chats Items', 'pcs', 0, 0, 0, 0, 28.6,
  'IMPORTED-20260717', 'ambient', 'pcs', 0, 'pcs', 0, 28.6,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20185', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-vada-pav-249', 'Vada Pav', 'Rm Chats Items', 'plate', 0, 0, 0, 0, 47.6,
  'IMPORTED-20260717', 'ambient', 'plate', 0, 'plate', 0, 47.6,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '20207', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rm-ompodi-chat-250', 'Rm Ompodi Chat', 'Rm Semi Chat Items', 'kg', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 0,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rm-vadapav-masala-251', 'Rm Vadapav Masala', 'Rm Semi Chat Items', 'kg', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 0,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-rm-bhel-red-chautney-252', 'Rm Bhel Red Chautney', 'Rm Semi Chat Items', 'kg', 0, 0, 0, 0, 0,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 0,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
),
(
  'rm-jolbhara-sandesh-253', 'Jolbhara Sandesh', 'Bengali Sweets', 'kg', 0, 0, 0, 0, 857.1,
  'IMPORTED-20260717', 'ambient', 'Kg', 0, 'Kg', 0, 857.1,
  'GST', 5, '', 0, '', 0, true, 0,
  0, '10010', true, 'Weighted', false, true, 'RawMaterial_Report_2026_07_17_12_59_06.xlsx'
)
on conflict (code) do update set
  name = excluded.name, category = excluded.category, unit = excluded.unit, current_stock = excluded.current_stock,
  min_stock = excluded.min_stock, max_stock = excluded.max_stock, reorder_qty = excluded.reorder_qty, unit_cost = excluded.unit_cost,
  batch_no = excluded.batch_no, storage = excluded.storage, purchase_unit = excluded.purchase_unit, conversion_qty = excluded.conversion_qty,
  consumption_unit = excluded.consumption_unit, purchase_price = excluded.purchase_price, transfer_price = excluded.transfer_price,
  tax_type = excluded.tax_type, tax_rate = excluded.tax_rate, hsn = excluded.hsn, at_par_stock = excluded.at_par_stock,
  sub_category = excluded.sub_category, normal_loss_pct = excluded.normal_loss_pct, expiry_tracked = excluded.expiry_tracked,
  best_before_days = excluded.best_before_days, reconciliation_price = excluded.reconciliation_price, barcode = excluded.barcode,
  allow_decimal = excluded.allow_decimal, stock_keeping_method = excluded.stock_keeping_method, batch_wise = excluded.batch_wise,
  active = excluded.active, source_sheet = excluded.source_sheet, updated_at = now();

create table if not exists public.external_item_master (
  item_code text primary key,
  name text not null,
  short_name text,
  product_type text,
  aliases text,
  major_category text,
  created_serial numeric,
  source_created_by text,
  source_updated_by text,
  updated_serial numeric,
  decimal_point integer default 0,
  discount_allowed boolean default false,
  hsn text,
  gst_tax text,
  ean_code text,
  trade_configuration text,
  prepared text,
  generic_name text,
  item_type text,
  item_per_unit numeric default 1,
  item_product_type text,
  packing text,
  source_sheet text,
  imported_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists external_item_master_name_idx on public.external_item_master(name);
create index if not exists external_item_master_category_idx on public.external_item_master(major_category);
create index if not exists external_item_master_ean_idx on public.external_item_master(ean_code) where ean_code is not null and ean_code <> '';

insert into public.external_item_master (
  item_code, name, short_name, product_type, aliases, major_category, created_serial, source_created_by,
  source_updated_by, updated_serial, decimal_point, discount_allowed, hsn, gst_tax, ean_code,
  trade_configuration, prepared, generic_name, item_type, item_per_unit, item_product_type, packing, source_sheet
) values
(
  '221', 'KAJU BISCUITS ASSORTED', 'KAJU BISCUITS ASSORTED', 'Standard', 'KAJU BISCUITS ASSORTED', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '236', 'GHEE ASSORTED SWEETS 860', 'GHEE ASSORTED SWEETS 860', 'Standard', 'GHEE ASSORTED SWEETS 860', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '237', 'GHEE ASSORTED SWEETS 900', 'GHEE ASSORTED SWEETS 900', 'Standard', 'GHEE ASSORTED SWEETS 900', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '238', 'KAJU ASSORTED SWEETS 960', 'KAJU ASSORTED SWEETS 960', 'Standard', 'KAJU ASSORTED SWEETS 960', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '239', 'KAJU ASSORTED SWEETS 1320', 'KAJU ASSORTED SWEETS 1320', 'Standard', 'KAJU ASSORTED SWEETS 1320', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '240', 'KAJU ASSORTED SWEETS 1460', 'KAJU ASSORTED SWEETS 1460', 'Standard', 'KAJU ASSORTED SWEETS 1460', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '497', 'ASSORTED SWEETS TEST', '', 'Standard', '', 'Assorted Sweets',
  46112.82041666667, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 0, true,
  '', 'GST 5%', '', 'Regular', 'O', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '235', 'GHEE ASSORTED SWEETS 800', 'GHEE ASSORTED SWEETS 800', 'Standard', 'GHEE ASSORTED SWEETS 800', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '219', 'BENGALI SWEETS', 'BENGALI SWEETS', 'Standard', 'BENGALI SWEETS', 'Assorted Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '241', 'SMALL GIFT BOX', 'SMALL GIFT BOX', 'Standard', 'SGB', 'BOX',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '242', 'BIG GIFT BOX', 'BIG GIFT BOX', 'Standard', 'BGB', 'BOX',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '13', 'KHEER KADAM', 'KHEER KADAM', 'Standard', 'KHEER KADAM', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '14', 'LANGCHA', 'LANGCHA', 'Standard', 'LANGCHA', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '15', 'MALAI CHOP', 'KESAR MALAI CHOP', 'Standard', 'KESAR MALAI CHOP', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '16', 'MALAI SANDWICH', 'MALAI SANDWICH', 'Standard', 'MALAI SANDWICH', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '17', 'MALAI TOAST', 'MALAI TOAST', 'Standard', 'MALAI TOAST', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '18', 'HONEY DEW', 'HONEY DEW', 'Standard', 'HONEY DEW', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '19', 'PANEER JAMUN', 'PANEER JAMUN', 'Standard', 'PANEER JAMUN', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '20', 'PARWAL SANDWICH', 'PARWAL SANDWICH', 'Standard', 'PARWAL SANDWICH', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '21', 'PETHA ROLL', 'PETHA ROLL', 'Standard', 'PETHA ROLL', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '22', 'PETHA SANDWICH', 'PETHA SANDWICH', 'Standard', 'PETHA SANDWICH', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '23', 'RASAPBERRY', 'RASAPBERRY', 'Standard', 'RASAPBERRY', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '25', 'SANDESH', 'SANDESH', 'Standard', 'SANDESH', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '519', 'AGRA PETHA', '', 'Standard', '', 'Bengali Sweets',
  46135.55850694444, 'Suryarun', 'Suryarun', 46135.56518518519, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '2', 'ANGOOR JAMUN', 'ANGOOR JAMUN', 'Standard', 'ANGOOR JAMUN', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '24', 'RASKADAM', 'RASKADAM', 'Standard', 'RASKADAM', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '3', 'CHAM CHAM', 'CHAM CHAM', 'Standard', 'CHAM CHAM', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '4', 'CHAMPAKALI', 'CHAMPAKALI', 'Standard', 'CHAMPAKALI', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '5', 'CHENNA PODA', 'CHENNA PODA', 'Standard', 'CHENNA PODA', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '6', 'CREAM SANDWICH', 'CREAM SANDWICH', 'Standard', 'CREAM SANDWICH', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '7', 'FRESH PANEER', 'FRESH PANEER', 'Standard', 'FRESH PANEER', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '8', 'GUD KACHA GOLLA', 'GUD KACHA GOLLA', 'Standard', 'GUD KACHA GOLLA', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '9', 'GUD SANDESH', 'GUD SANDESH', 'Standard', 'GUD SANDESH', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '10', 'JOLBHARA SANDESH', 'JOLBHARA SANDESH', 'Standard', 'JOLBHARA SANDESH', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '11', 'KAALA JAMUN', 'KAALA JAMUN', 'Standard', 'KAALA JAMUN', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '12', 'KESAR CHAM CHAM', 'KESAR CHAM CHAM', 'Standard', 'KESAR CHAM CHAM', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '224', 'GUD KALAKAND', 'GUD KALAKAND', 'Standard', 'GUD KALAKAND', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '222', 'MALAI PURI', 'MALAI PURI', 'Standard', 'MALAI PURI', 'Bengali Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '27', 'CHOCOLATE BITES', 'CHOCOLATE BITES', 'Standard', 'CHOCOLATE BITES', 'Bites Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '28', 'PISTA BITES', 'PISTA BITES', 'Standard', 'PISTA BITES', 'Bites Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '26', 'BADAM BITES', 'BADAM BITES', 'Standard', 'BADAM BITES', 'Bites Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '193', 'CHEESE VADA PAV', 'CHEESE VADA PAV', 'Standard', 'CHEESE VADA PAV', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '248', 'MASALA PAPDI CHAT', 'MASALA PAPDI CHAT', 'Standard', 'MPC', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '204', 'SEV PURI', 'SEV PURI [6 PCS]', 'Standard', 'Sev Puri [6 Pcs]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '203', 'PAV PACKET', '.', 'Standard', '', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '202', 'EXTRA PAV', 'EXTRA PAV', 'Standard', '', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '201', 'PANEER PAV BHAJI', 'PANEER PAV BHAJI', 'Standard', 'PANEER PAV BHAJI', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '200', 'PAV BHAJI', 'PAV BHAJI', 'Standard', 'PAV BHAJI', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '199', 'DAHI VADA', 'DAHI VADA [2 PC]', 'Standard', 'Dahi Vada [2 Pc]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '198', 'DAHI PAPDI CHAAT', 'DAHI PAPDI CHAAT', 'Standard', 'DAHI PAPDI CHAAT', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '197', 'KACHORI CHAAT', 'KACHORI CHAAT [1 PC]', 'Standard', 'Kachori Chaat [1 Pc]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '196', 'MASALA PURI', 'MASALA PURI (MASALA GOL GAPPE CHAAT)', 'Standard', 'Masala Puri (Masala Gol Gappe Chaat)', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '195', 'PANI PURI', 'PANI PURI (GOLGAPPE) [7 PCS]', 'Standard', 'Pani Puri (Golgappe) [7 Pcs]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '194', 'CHEESE PAV BHAJI', 'CHEESE PAV BHAJI', 'Standard', 'CHEESE PAV BHAJI', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '192', 'DAHI TIKKI CHAAT', 'DAHI TIKKI CHAAT', 'Standard', 'DAHI TIKKI CHAAT', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '191', 'DAHI PAPDI CHAT', 'DAHI PAPDI CHAT', 'Standard', '', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '190', 'DAHI KACHORI CHAAT', 'DAHI KACHORI CHAAT', 'Standard', 'DAHI KACHORI CHAAT', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '189', 'DAHI SAMOSA CHAAT', 'DAHI SAMOSA CHAAT', 'Standard', 'DAHI SAMOSA CHAAT', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '188', 'DAHI PURI', 'DAHI PURI [6 PCS]', 'Standard', 'Dahi Puri [6 Pcs]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '187', 'ALOO TIKKI CHAAT', 'ALOO TIKKI CHAAT', 'Standard', 'ALOO TIKKI CHAAT', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '186', 'BHEL PURI', 'BHEL PURI', 'Standard', 'BHEL PURI', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '185', 'ALOO TIKKI PLAIN', 'ALOO TIKKI [1 PC]', 'Standard', 'Aloo Tikki [1 Pc]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '184', 'ALOO PURI', 'ALOO PURI [6 PCS]', 'Standard', 'Aloo Puri [6 Pcs]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '183', 'DAL KACHORI', 'DAL KACHORI [1 PC]', 'Standard', 'DAL KACHORI [1 Pc]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '182', 'ALOO SAMOSA', 'ALOO SAMOSA [1 PC]', 'Standard', 'Aloo Samosa [1 Pc]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '207', 'VADA PAV', 'VADA PAV [1 PC]', 'Standard', 'Vada Pav [1 Pc]', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '206', 'RAJ KACHORI', 'RAJ KACHORI', 'Standard', 'RAJ KACHORI', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '205', 'SAMOSA CHAAT', 'SAMOSA CHAAT', 'Standard', 'Samosa Chaat', 'Chats',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46122.46457175926, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '249', 'CHOCOLATE CRUNCH 130 GMS', 'CHOCOLATE CRUNCH 130 GMS', 'Standard', 'CC', 'Cookies',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '348', 'ALMOND CHOCOLATES 200GMS', '', 'Standard', '', 'Cookies',
  46061.45515046296, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '228', 'JAGGERY OATS 150GMS', '.', 'Standard', '', 'Cookies',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '227', 'BESAN BADAM COOKIES', '.', 'Standard', '', 'Cookies',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '349', 'CASHEW CHOCOLATES 200GMS', '', 'Standard', '', 'Cookies',
  46061.45579861111, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '230', 'BUTTER COCONUT COOKIES 230GMS', 'BUTTER COCONUT COOKIES 230GMS.', 'Standard', '', 'Cookies',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '229', 'KESAR PISTA STICKS 300GMS', '.', 'Standard', '', 'Cookies',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '30', 'SANDWICH DHOKLA', 'SANDWICH DHOKLA', 'Standard', '', 'Dhokla',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '29', 'PLAIN DHOKLA', 'PLAIN DHOKLA PLATE', 'Standard', 'Plain Dhokla Plate', 'Dhokla',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '31', 'DRYFRUIT GHEWAR', 'DRYFRUIT GHEWAR', 'Standard', 'DRYFRUIT GHEWAR', 'Ghewar',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '32', 'KEASAR GHEWAR', 'KEASAR GHEWAR', 'Standard', 'KEASAR GHEWAR', 'Ghewar',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '33', 'MALAI GHEAWR', 'MALAI GHEAWR', 'Standard', 'MALAI GHEAWR', 'Ghewar',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '34', 'PLAIN GHEWAR', 'PLAIN GHEWAR', 'Standard', 'PLAIN GHEWAR', 'Ghewar',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '217', '750GMS - 125GX6', '.', 'Standard', '', 'Gift Box (dry Fruits & Special Sweets)',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '216', '600GMS - 100GX6', '.', 'Standard', '', 'Gift Box (dry Fruits & Special Sweets)',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '215', '500GMS - 125GX4', '.', 'Standard', '', 'Gift Box (dry Fruits & Special Sweets)',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '214', '400GMS - 100GX4', '.', 'Standard', '', 'Gift Box (dry Fruits & Special Sweets)',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '213', '300GMS - 75GX4', '.', 'Standard', '', 'Gift Box (dry Fruits & Special Sweets)',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '212', '200GMS - 50GX4', '.', 'Standard', '', 'Gift Box (dry Fruits & Special Sweets)',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '147', 'COCONUT HOLIGE', 'COCONUT HOLIGE (PURAN POLI) 2PCS', 'Standard', 'COCONUT HOLIGE (Puran Poli) 2pcs', 'Holige',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '148', 'DHAL HOLIGE', 'DHAL HOLIGE (PURAN POLI) 2PCS', 'Standard', 'DHAL HOLIGE (Puran Poli) 2pcs', 'Holige',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '408', 'GHEURA ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '253', 'TUTI FROOTI GREEN', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '255', 'MASALA PURI PACKET', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'Suryarun', 46208.92233796296, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '257', 'KOVA RM', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46123.48402777778, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '258', 'GULKAND', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '260', 'WHEAT ATTA', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '261', 'COCONUT POWDER', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '267', 'VENNILA POWDER 500GMS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '268', 'BTC BESAN FLOUR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '269', 'BOORA SUGAR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '270', 'CHENNA MILK RM', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '271', 'SUGAR SYRUP', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '272', 'SUGARCANE JUICE 3LTRS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '273', 'CHIROTTI SOOJI RAVA', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '274', 'TENDER COCONUT 3LTRS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '275', 'LEMON', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '279', 'DELHI CARROT', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '282', 'KESAR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '283', 'GREEN PISTA FULL', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '284', 'HORLICKS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '285', 'CORN FLOUR WEIKFIELD', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '286', 'SODA', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '287', 'LEMON SALT', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '288', 'BAKING POWDER', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '290', 'CORN FLOUR ATC', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '293', 'DIAMOND SUGAR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '294', 'KISMIS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '295', 'DALDA VANASPATHI', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '297', 'MILK POWDER', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '298', 'GANESH GHEE', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '301', 'MAIDA', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '302', 'REFINED OIL', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '303', 'VINIGER 750ML', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '304', 'JAKAI POWDER', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '306', 'NANDHINI CURD 1 LTR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'Suryarun', 46208.731782407405, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '307', 'WHEAT', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '308', 'JAGGERY', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '310', 'NANDHINI MILK BLUE 1LTR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'Suryarun', 46208.72641203704, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '312', 'ANJEER', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '313', 'KHAJUR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '315', 'HONEY', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '316', 'RP GHEE', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'Suryarun', 46208.92884259259, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '317', 'GLUCOSE', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '318', 'ANJEER CHOORA', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '320', 'KAJU 2 PCS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '323', 'PISTA FULL PCS NORMAL', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '326', 'KAJU 320', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '327', 'SUGAR', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '328', 'GHEE OVIYA', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '329', 'WATER', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'Suryarun', 46207.63626157407, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '331', 'LIQUID GLUCOSE', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '332', 'BUTTERSCOTCH NUTS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '333', 'BADAM 2 PCS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '337', 'BADAM FULL PCS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '338', 'KAJU 210', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '339', 'KAJU 4 PCS LWP', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '342', 'BUTTERSCOTCH SYRUP', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'Suryarun', 46123.57709490741, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '344', 'KAJU 180', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '345', 'GAS', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '350', 'RICE', '', 'Standard', '', 'Ingredients',
  46070.83159722222, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'T', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '351', 'KOLKATA PATALI GUD ROUND', '', 'Standard', '', 'Ingredients',
  46071.38836805556, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'T', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '352', 'KAJU KUNDHA WHITE', '', 'Standard', '', 'Ingredients',
  46072.79659722222, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'T', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '356', 'PALM JAGGERY', '', 'Standard', 'KARUPPATTI', 'Ingredients',
  46075.68366898148, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '357', 'SILVER LEAVES WARAK (NATRAJ)', '', 'Standard', '', 'Ingredients',
  46078.835069444445, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 3%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '359', 'RICE FLOUR', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '360', 'NORMAL RAVA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '361', 'KANPUR LADDU BESAN', 'KANPUR LADDU BESAN', 'Standard', 'KANPUR LADDU BESAN', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '362', 'BOMBAY BESAN (DHOKLA)', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '364', 'CHOCOLATE NUTS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '365', 'CHOCOLATE RICE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '366', 'CHOCO POWDER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '367', 'CHOCO BAR WHITE 500GMS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '368', 'CHOCO BAR DARK 500GMS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '369', 'CHERRY FRUIT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '370', 'LICHI', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '371', 'COCONUT SEVAL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '372', 'COCONUT SEVAL WHITE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '373', 'BADAM POWDER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '374', 'CHOCO SAUSE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '375', 'MALA`S KESAR SYRUP', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '376', 'MALA`S ROSE SYRUP', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '377', 'PINEAPPLE CRUSH', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '378', 'POMO CRUSH', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '379', 'ROSE ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '380', 'ALMOND ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '381', 'VENNILA ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '382', 'CHOCOLATE ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '383', 'PISTA ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '384', 'PINEAPPLE ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '385', 'ORANGE LIQUID ESSANCE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '386', 'PINK LIQUID 500ML', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '387', 'ROSE WATER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '390', 'SUGARFREE POWDER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '391', 'LEMON YELLOW 100G', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '392', 'ORANGE RED 100G', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '393', 'RASAPBERRY D', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '394', 'CHOCOLATE BROWN D', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '395', 'APPLE GREEN D', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '396', 'KOLA POWDER D', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '397', 'KESARI POWDER D', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'Suryarun', 46211.57475694444, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '398', 'ICING SUGAR', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '399', 'ROSE PETALS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '400', 'HYDROS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '401', 'PAPPER CUP BENGALI 6`NO', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '402', 'FUNNEL FOR JALEBI', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '404', 'CARAMEL TOPING', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '405', 'PAAN SHOT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '406', 'BLUEBERRY CRUSH', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '407', 'MILKMAID NESTLE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '409', 'KAJU 240', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '410', 'HIRANI BADHAM', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '411', 'ELAICHI FULL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '413', 'JAKAI FULL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '414', 'ANTU', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '415', 'BLUEBERRY FRUIT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '416', 'JEERA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '417', 'OM KAAL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '418', 'PEPPER SEEDS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '419', 'DHANIYA SEEDS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '420', 'ANANAS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '421', 'PATTA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '422', 'THILL BLACK', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '423', 'THILL WHITE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '424', 'KASTHURI METHI', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '425', 'CLOVES', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '426', 'MARATI MOGGU', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '427', 'BIRIYANI LEAF', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '428', 'JAPATHIRI', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '429', 'KALLUVA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '430', 'SOMBU', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '431', 'TASTING SALT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '432', 'JALJEERA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '433', 'CHAT MASALA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '434', 'BLACK SALT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '435', 'LG POWDER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '436', 'LG SOLID', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '437', 'CHILLI RED', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '438', 'CHILLI BADAGE', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '439', 'CHILLI POWDER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '440', 'DHANIYA POWDER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '441', 'TURMARIC POWDER', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '442', 'GARAM MASALA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '443', 'CHICKEN MASALA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '444', 'KARI MASALA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '445', 'SALT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '447', 'DRY COCONUT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '448', 'SARAPARUPPU', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '449', 'GROUND NUT', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '450', 'GROUND NUT MEDIUM', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '451', 'URAD DAAL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '452', 'GREEN MOONG DAAL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '453', 'GREEN PEAS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '454', 'GRAM DHAAL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '455', 'KAALA MASOOR DHAAL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '456', 'TOOR DHAAL', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '457', 'AVULAKKI', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '459', 'CORN FLACKES', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '460', 'TAMIRAND', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '461', 'SABINA', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '462', 'SURF', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '463', 'VIM BAR 5RS', '', 'Standard', '', 'Ingredients',
  46078.87226851852, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '464', 'KOLKATTA NOLEN GUD LIQUID', '', 'Standard', '', 'Ingredients',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '465', 'EDIBLE CAMPHOR', '', 'Standard', '', 'Ingredients',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '466', 'PADIGARAM FITKARI', '', 'Standard', '', 'Ingredients',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '467', 'GARLIC', '', 'Standard', '', 'Ingredients',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '468', 'FRIED GRAM 2 PCS', '', 'Standard', '', 'Ingredients',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '485', 'KUNDHA RM', '', 'Standard', '', 'Ingredients',
  46078.91185185185, 'Bulk Insert - Suryarun', 'Suryarun', 46210.845729166664, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '490', 'CARROT NORMAL', '', 'Standard', '', 'Ingredients',
  46103.584189814814, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '491', 'ELAICHI POWDER', '', 'Standard', '', 'Ingredients',
  46103.59809027778, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '492', 'MOTTA BESAN (GROUND)', '', 'Standard', '', 'Ingredients',
  46103.59809027778, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '493', 'GASAGASA SEEDS', '', 'Standard', '', 'Ingredients',
  46106.59517361111, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '494', 'CHOCOLATE KOVA CHOORA', '', 'Standard', '', 'Ingredients',
  46111.67099537037, 'Suryarun', 'BULK Item - Suryarun', 46129.54405092593, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '495', 'MILK ESSANCE', '', 'Standard', '', 'Ingredients',
  46112.705659722225, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '496', 'MALAI KUNDHA', '', 'Standard', '', 'Ingredients',
  46112.705659722225, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '498', 'JACKFRUIT RAW', '', 'Standard', '', 'Ingredients',
  46116.495, 'Suryarun', '', 0, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '499', 'JACKFRUIT HALWA', '', 'Standard', '', 'Ingredients',
  46116.68597222222, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '503', 'BENGALI LIQUID CHOORA', '', 'Standard', '', 'Ingredients',
  46119.56366898148, 'Suryarun', 'Suryarun', 46220.49197916667, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '504', 'MYSORE PAK CHOORA', '', 'Standard', '', 'Ingredients',
  46119.7346412037, 'Suryarun', 'Suryarun', 46208.586006944446, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '508', 'MALAI KUNDHA 2 KOVA MADE', '', 'Standard', '', 'Ingredients',
  46124.53506944444, 'Suryarun', 'BULK Item - Suryarun', 46132.469826388886, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '512', 'SOANPAPDI CHOORA', '', 'Standard', '', 'Ingredients',
  46132.722962962966, 'Suryarun', 'Suryarun', 46208.58547453704, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '513', 'PINEAPPLE', '', 'Standard', '', 'Ingredients',
  46135.43662037037, 'Bulk Insert - Suryarun', 'Suryarun', 46135.439467592594, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '514', 'SAPOTA', '', 'Standard', '', 'Ingredients',
  46135.43662037037, 'Bulk Insert - Suryarun', 'Suryarun', 46135.44008101852, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '515', 'APPLE', '', 'Standard', '', 'Ingredients',
  46135.43662037037, 'Bulk Insert - Suryarun', 'Suryarun', 46135.44074074074, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '516', 'BANANA', '', 'Standard', '', 'Ingredients',
  46135.43662037037, 'Bulk Insert - Suryarun', 'Suryarun', 46135.44138888889, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '517', 'KIWI', '', 'Standard', '', 'Ingredients',
  46135.43662037037, 'Bulk Insert - Suryarun', 'Suryarun', 46135.442199074074, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '520', 'MOONG DAL PIECE', '', 'Standard', '', 'Ingredients',
  46143.58280092593, 'Suryarun', '', 0, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '521', 'DEEP POORI BHEL', '', 'Standard', '', 'Ingredients',
  46143.583657407406, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '522', 'AMULYA MITHAI MATE', '', 'Standard', '', 'Ingredients',
  46143.586064814815, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '523', 'PALMOLEIN OIL', '', 'Standard', '', 'Ingredients',
  46143.60886574074, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '524', 'BREAD CUM POWDER', '', 'Standard', '', 'Ingredients',
  46144.57980324074, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '525', 'BROWN CHENNA GRAM FULL', '', 'Standard', '', 'Ingredients',
  46144.589525462965, 'Suryarun', 'Suryarun', 46209.8128125, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '526', 'KASHMIRI MIRCHI DEGGI MIRCHI POWDER', '', 'Standard', '', 'Ingredients',
  46144.60778935185, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '532', 'PORI PLAIN', '', 'Standard', '', 'Ingredients',
  46206.891076388885, 'Suryarun', '', 0, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '533', 'NANDHINI MILK BLUE 1/2 LTR', '', 'Standard', '', 'Ingredients',
  46208.72969907407, 'Suryarun', '', 0, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '534', 'NANDHINI GHEE 1LTR', '', 'Standard', '', 'Ingredients',
  46209.529131944444, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '535', 'CONGRAS PEANUTS', '', 'Standard', '', 'Ingredients',
  46216.562256944446, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '536', 'BENGALI CHOORA', '', 'Standard', '', 'Ingredients',
  46220.49328703704, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '208', 'PANI PURI PACKET', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'Suryarun', 46208.914143518516, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '250', 'FRIED GRAM GUNDAL FULL', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '252', 'TUTI FROOTI RED', '.', 'Standard', '', 'Ingredients',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '509', 'ANJEER KING', '', 'Standard', '', 'Kaju & Anjeer Sweets',
  46129.43883101852, 'Suryarun', 'BULK Item - Suryarun', 46129.4440625, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '38', 'BADAM KATLI', 'BADAM KATLI', 'Standard', 'BADAM KATLI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '39', 'CHOCO MANGO DELICACIES', 'CHOCO MANGO DELICACIES', 'Standard', 'CHOCO MANGO DELICACIES', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '37', 'BADAM HALWA', 'BADAM HALWA', 'Standard', 'BADAM HALWA', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '40', 'CRANBERRY DELIGHT', 'CRANBERRY DELIGHT', 'Standard', 'CRANBERRY DELIGHT', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '41', 'GUD KAJU KATLI', 'GUD KAJU KATLI', 'Standard', 'GUD KAJU KATLI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '42', 'KAJU CARAMEL ROLL', 'KAJU CARAMEL ROLL', 'Standard', 'KAJU CARAMEL ROLL', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '43', 'KAJU CHOCO LADDU', 'KAJU CHOCO LADDU', 'Standard', 'KAJU CHOCO LADDU', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '44', 'KAJU CHOCOLATE BURFI', 'KAJU CHOCOLATE BURFI', 'Standard', 'KAJU CHOCOLATE BURFI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '45', 'BLUEBERRY DELIGHT', 'BLUEBERRY DELIGHT', 'Standard', 'BLUEBERRY DELIGHT', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '46', 'KAJU FLOWER', 'KAJU FLOWER', 'Standard', 'KAJU FLOWER', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '47', 'KAJU KALAM', 'KAJU KALAM', 'Standard', 'KAJU KALAM', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '48', 'KAJU KATLI', 'KAJU KATLI', 'Standard', 'KAJU KATLI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '49', 'KAJU KATORI', 'KAJU KATORI', 'Standard', 'KAJU KATORI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '234', 'KAJU SANDWICH', 'KAJU SANDWICH', 'Standard', 'KAJU SANDWICH', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '231', 'KAJU CHOCO ROLL', 'KAJU CHOCO ROLL', 'Standard', 'KAJU CHOCO ROLL', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '50', 'BLUEBERRY KATLI', 'BLUEBERRY KATLI', 'Standard', 'BLUEBERRY KATLI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '51', 'KAJU MYSORE PAK', 'KAJU MYSORE PAK', 'Standard', 'Kaju Mysore Pak', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '52', 'KAJU PAAN', 'KAJU PAAN', 'Standard', 'KAJU PAAN', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '53', 'KAJU PINE', 'KAJU PINE', 'Standard', 'KAJU PINE', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '36', 'ANJEER ROLL', 'ANJEER ROLL', 'Standard', 'ANJEER ROLL', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '35', 'ANJEER DRY FRUIT BURFI', 'ANJEER DRY FRUIT BURFI', 'Standard', 'ANJEER DRY FRUIT BURFI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '54', 'KAJU PISTA ROLL', 'KAJU PISTA ROLL', 'Standard', 'KAJU PISTA ROLL', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '55', 'KAJU ROSE PETALS LADDU', 'KAJU ROSE PETALS LADDU', 'Standard', 'KAJU ROSE PETALS LADDU', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '56', 'KAJU SOAN PAPDI', 'KAJU SOAN PAPDI', 'Standard', 'KAJU SOAN PAPDI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '57', 'SUGARFREE KAJU KATLI', 'SUGARFREE KAJU KATLI', 'Standard', 'SUGARFREE KAJU KATLI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '58', 'KESAR PISTA KATLI', 'KESAR PISTA KATLI', 'Standard', 'KESAR PISTA KATLI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '59', 'ROASTED KAJU ROLL', 'ROASTED KAJU ROLL', 'Standard', 'ROASTED KAJU ROLL', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '60', 'SUGAR FREE DRY FRUIT BURFI', 'SUGAR FREE DRY FRUIT BURFI', 'Standard', 'SUGAR FREE DRY FRUIT BURFI', 'Kaju & Anjeer Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '61', 'BADAM KAJU BISCUITS', 'BADAM KAJU BISCUITS', 'Standard', 'BADAM KAJU BISCUITS', 'Kaju Biscuits',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '62', 'PISTA KAJU BISCUITS', 'PISTA KAJU BISCUITS', 'Standard', 'PISTA KAJU BISCUITS', 'Kaju Biscuits',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '63', 'ROSE KAJU BISCUITS', 'ROSE KAJU BISCUITS', 'Standard', 'ROSE KAJU BISCUITS', 'Kaju Biscuits',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '124', 'ZEERO SUGAR LADDU', 'ZEERO SUGAR LADDU', 'Standard', 'ZEERO SUGAR LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '91', 'JALEBI', 'JALEBI', 'Standard', '', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '90', 'JACKFRUIT MYSORE PAK', 'JACKFRUIT MYSORE PAK', 'Standard', 'Jackfruit Mysore Pak', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '92', 'JANGIRI', 'JANGIRI [IMARTHI]', 'Standard', 'Jangiri [Imarthi]', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '93', 'KAJAYA', 'KAJAYA', 'Standard', 'KAJAYA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '94', 'KALAKAND BURFI', 'KALAKAND BURFI', 'Standard', 'KALAKAND BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '95', 'KASHMIRI KALAKAND', 'KASHMIRI KALAKAND', 'Standard', '', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '96', 'KESAR PEDA', 'KESAR PEDA', 'Standard', 'KESAR PEDA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '97', 'KHAJUR DRY FRUIT BURFI', 'KHAJUR DRY FRUIT BURFI', 'Standard', 'KHAJUR DRY FRUIT BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '98', 'KHAJUR DRY FRUIT LADDU', 'KHAJUR DRY FRUIT LADDU', 'Standard', 'KHAJUR DRY FRUIT LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '99', 'BOONDHI LADDU', 'BOONDHI LADDU', 'Standard', 'BOONDHI LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '100', 'MALAI PEDA', 'MALAI PEDA', 'Standard', 'MALAI PEDA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '101', 'MANGO MYSORE PAK', 'MANGO MYSORE PAK', 'Standard', 'Mango Mysore Pak', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '102', 'MILK CAKE', 'MILK CAKE', 'Standard', 'Milk Cake', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '103', 'MILK MYSORE PAK', 'MILK MYSORE PAK', 'Standard', 'Milk Mysore Pak', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '104', 'MOTHI PAK', 'MOTHI PAK', 'Standard', 'MOTHI PAK', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '105', 'MOTHICHUR LADDU', 'MOTHICHUR LADDU', 'Standard', 'MOTHICHUR LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '106', 'MYSORE PAK HARD', 'MYSORE PAK HARD', 'Standard', 'Mysore Pak Hard', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '107', 'PALM JAGGARY MOTHI LADDU', 'PALM JAGGARY MOTHI LADDU', 'Standard', 'PALM JAGGARY MOTHI LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '108', 'PALM JAGGARY MYSORE PAK', 'PALM JAGGARY MYSORE PAK', 'Standard', 'Palm Jaggary Mysore Pak', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '109', 'PANEER JALEBI', 'PANEER JALEBI', 'Standard', 'Paneer Jalebi', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '110', 'PHENI 2PCS', 'PHENI 2PCS', 'Standard', 'PHENI 2PCS', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '111', 'PISTA BURFI', 'PISTA BURFI', 'Standard', 'PISTA BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '112', 'PISTA KATLI', 'PISTA KATLI', 'Standard', 'PISTA KATLI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '113', 'PLAIN KOVA', 'PLAIN KOVA', 'Standard', '', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '114', 'PUTHAREKULU DRY FRUITS', 'PUTHAREKULU DRY FRUITS [5 PCS] (ANDHRA SPECIAL)', 'Standard', 'PUTHAREKULU DRY FRUITS [5 Pcs] (Andhra Special)', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '115', 'ROASTED CHENNA DHAL BURFI', 'ROASTED CHENNA DHAL BURFI', 'Standard', 'ROASTED CHENNA DHAL BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '116', 'SOAN CAKE', 'SOAN CAKE', 'Standard', 'SOAN CAKE', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '117', 'SPECIAL KALAKAND', 'SPECIAL KALAKAND', 'Standard', 'SPECIAL KALAKAND', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '118', 'SPECIAL MYSORE PAK', 'SPECIAL MYSORE PAK', 'Standard', 'Special Mysore Pak', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '119', 'SUGARCANE MILK HALWA', 'SUGARCANE MILK HALWA', 'Standard', 'SUGARCANE MILK HALWA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '120', 'SWEET BOONDHI GHEE', 'SWEET BOONDHI GHEE', 'Standard', 'SWEET BOONDHI GHEE', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '121', 'TENDER COCONUT HALWA', 'TENDER COCONUT HALWA', 'Standard', 'TENDER COCONUT HALWA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '122', 'THIRUPATI LADDU', 'THIRUPATI LADDU', 'Standard', 'THIRUPATI LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '123', 'WHEAT HALWA', 'WHEAT HALWA', 'Standard', 'WHEAT HALWA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '89', 'HORLICKS BURFI', 'HORLICKS BURFI', 'Standard', 'HORLICKS BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '88', 'GULKAND ROLL', 'GULKAND ROLL', 'Standard', 'GULKAND ROLL', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '87', 'GUJIYA', 'GUJIYA (DRYFRUITS AND KHOYA)', 'Standard', 'Gujiya (Dryfruits and Khoya)', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '86', 'GUD SOANPAPDI', 'GUD SOANPAPDI', 'Standard', 'GUD SOANPAPDI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '85', 'GONDH LADDU', 'GONDH LADDU', 'Standard', 'GONDH LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '84', 'GHEE LADDU', 'GHEE LADDU', 'Standard', 'GHEE LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '83', 'GHEE JANGIRI', 'GHEE JANGIRI', 'Standard', '', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '82', 'GHEE JALEBI', 'DESI GHEE JALEBI', 'Standard', 'DESI GHEE JALEBI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '81', 'DRY FRUIT HALWA', 'DRY FRUIT HALWA', 'Standard', 'DRY FRUIT HALWA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '80', 'DOODH PEDA', 'DOODH PEDA', 'Standard', 'DOODH PEDA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '79', 'DODA BURFI', 'DODA BURFI', 'Standard', 'DODA BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '78', 'DHARWAD PEDA', 'DHARWAD PEDA', 'Standard', 'DHARWAD PEDA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '77', 'CREME COCO LADDU', 'CREME COCO LADDU', 'Standard', 'CREME COCO LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '76', 'KESAR COCONUT BURFI', 'KESAR COCONUT BURFI', 'Standard', 'KESAR COCONUT BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '75', 'CHOCOLATE BURFI', 'CHOCOLATE BURFI', 'Standard', 'CHOCOLATE BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '74', 'CHANDRAKALA', 'CHANDRAKALA', 'Standard', 'CHANDRAKALA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '73', 'CARROT MYSORE PAK', 'CARROT MYSORE PAK', 'Standard', 'CARROT MYSORE PAK', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '72', 'CARROT HALWA', 'GAJAR HALWA (CARROT HALWA)', 'Standard', 'Gajar Halwa (Carrot Halwa)', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '71', 'BUTTERSCOTCH BADAM LADDU', 'BUTTERSCOTCH BADAM LADDU', 'Standard', 'BUTTERSCOTCH BADAM LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '70', 'BOMBAY HALWA', 'BOMBAY HALWA', 'Standard', 'BOMBAY HALWA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '69', 'BESAN LADDU', 'BESAN LADDU', 'Standard', 'BESAN LADDU', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '68', 'BANARAS SOANPAPDI', 'BANARAS SOANPAPDI', 'Standard', 'BANARAS SOANPAPDI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '67', 'BADUSHA', 'BADUSHA', 'Standard', 'BADUSHA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '66', 'ANJEER KALAKAND', 'ANJEER KALAKAND', 'Standard', 'ANJEER KALAKAND', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '65', 'AJMERI MILK CAKE', 'AJMERI MILK CAKE', 'Standard', 'AJMERI MILK CAKE', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '64', 'AJMERI KALAKAND', 'AJMERI KALAKAND', 'Standard', 'AJMERI KALAKAND', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '226', 'TIRANGA BURFI', 'TIRANGA BURFI', 'Standard', 'TIRANGA BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '232', 'MOONG DAL BURFI', 'MOONG DAL BURFI', 'Standard', 'MOONG DAL BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '233', 'MILK HALWA', 'MILK HALWA', 'Standard', 'MILK HALWA', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '501', 'ANJEER MAVA SANDWICH', '', 'Standard', '', 'Milk & Ghee Sweets',
  46118.41195601852, 'Suryarun', 'BULK Item - Suryarun', 46145.45211805555, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '502', 'MADATHAKAJA', 'MADATHAKAJA', 'Standard', '', 'Milk & Ghee Sweets',
  46118.69329861111, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '346', 'ICE CREAM BURFI', 'ICE CREAM BURFI', 'Standard', 'ICE CREAM BURFI', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '347', 'SWEET BOONDHI', 'SWEET BOONDHI', 'Standard', '', 'Milk & Ghee Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '518', 'FRESH FRUIT HALWA', '', 'Standard', '', 'Milk & Ghee Sweets',
  46135.44541666667, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '500', 'NAVRATAN LADDU', '', 'Standard', '', 'Milk & Ghee Sweets',
  46117.768587962964, 'Suryarun', 'BULK Item - Suryarun', 46142.44825231482, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '137', 'MATKA RABIDI', 'MATKA RABIDI [1 PC]', 'Standard', 'MATKA RABIDI [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '138', 'MISHTI DOI', 'MISHTI DOI', 'Standard', 'MISHTI DOI', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '139', 'RAJBHOG', 'RAJBHOG [2 PCS]', 'Standard', 'RAJBHOG [2 pcs]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '140', 'RASAGULLA', 'RASAGULLA 2 PCS', 'Standard', 'RASAGULLA [2 pcs]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46118.74450231482, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '141', 'RASAMALAI', 'RASAMALAI 2 PCS', 'Standard', 'RASAMALAI [2 pcs]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46118.74450231482, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '132', 'KESAR MALAI CUP', 'KESAR MALAI CUP [1 PC]', 'Standard', 'KESAR MALAI CUP [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '133', 'LYCHEE CHENNA KHEER', 'LYCHEE CHENNA KHEER [1 PC]', 'Standard', 'LYCHEE CHENNA KHEER [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '134', 'MALAI ROLL', 'MALAI ROLL [1 PC]', 'Standard', 'MALAI ROLL [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '135', 'MALPUA', 'MALPUA [2 PCS]', 'Standard', 'MALPUA [2 pcs]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '136', 'MANGO RABIDI', 'MANGO RABIDI [1 PC]', 'Standard', 'MANGO RABIDI [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '126', 'BUTTERSCOTCH MALAI GILLOURI', 'BUTTERSCOTCH MALAI GILLOURI [1 PC]', 'Standard', 'BUTTERSCOTCH MALAI GILLOURI [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '225', 'MANGO MALAI GOLLA', 'MANGO MALAI GOLLA [1 PC]', 'Standard', 'MANGO MALAI GOLLA [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '127', 'CHENNA PAYAS', 'CHENNA PAYAS [1 PC]', 'Standard', 'CHENNA PAYAS [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '129', 'GUD RASAGULLA', 'GUD RASAGULLA 2 PCS', 'Standard', 'GUD RASAGULLA [2 pcs]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46118.74450231482, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '128', 'FRUIT CREAM CUP', 'FRUIT CREAM CUP [1 PC]', 'Standard', 'FRUIT CREAM CUP [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '125', 'BAKED RASAGULLA', 'BAKED RASGULLA 1 PC', 'Standard', 'Baked Rasgulla [1 Pc]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46118.74450231482, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '130', 'HOT & COLD BADAM MILK 200ML', 'HOT & COLD BADAM MILK 200ML', 'Standard', 'HOT & COLD BADAM MILK 200ML', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '131', 'JAMUN', 'JAMUN [2 PCS]', 'Standard', 'JAMUN [2 pcs]', 'Milk Liquid Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '144', 'KESAR MODAK', 'KESAR MODAK', 'Standard', 'KESAR MODAK', 'Modak Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '143', 'KAJU MODAK', 'KAJU MODAK', 'Standard', 'KAJU MODAK', 'Modak Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '142', 'COCONUT MODAK', 'COCONUT MODAK', 'Standard', 'COCONUT MODAK', 'Modak Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '145', 'MOTHICHUR MODAK', 'MOTHICHUR MODAK', 'Standard', 'MOTHICHUR MODAK', 'Modak Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '146', 'PLAIN MODAK', 'PLAIN MODAK', 'Standard', 'PLAIN MODAK', 'Modak Sweets',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '528', 'ALOO PARATHA', '', 'Standard', '', 'PARATHA',
  46151.424375, 'Suryarun', 'Suryarun', 46151.42804398148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '529', 'GOBI PARATHA', '', 'Standard', '', 'PARATHA',
  46151.42487268519, 'Suryarun', 'Suryarun', 46151.427615740744, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '527', 'ONION PARATHA', '', 'Standard', '', 'PARATHA',
  46151.423680555556, 'Suryarun', 'Suryarun', 46151.42868055555, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '531', 'ALOO CHEESE PARATHA', '', 'Standard', '', 'PARATHA',
  46151.42681712963, 'Suryarun', '', 0, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '530', 'PANEER PARATHA', '', 'Standard', '', 'PARATHA',
  46151.42601851852, 'Suryarun', 'Suryarun', 46151.4272337963, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '487', 'OIL LADDU DHANA', 'OIL LADDU DHANA', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '488', 'CHENNA JEERA NEW', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.913252314815, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '489', 'GUD JEERA', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.913252314815, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '470', 'KOVA KUNDHA', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '469', 'SOANPAPDI KUNDHA', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '353', 'JEERA COMMON OLD', '', 'Standard', 'SUGAR SYRUP', 'SEMI FINISHED ITEMS',
  46075.58363425926, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '354', 'JALEBI KESAR JEERA', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46075.59108796297, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '355', 'BOILING GHEE', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46075.59318287037, 'Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 0% Tax', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '471', 'KALAKAND KUNDHA', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '472', 'KAJU KUNDHA GREEN', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '473', 'ANJEER KAJU KUNDHA', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '474', 'CHOCOLATE KAJU KUNDHA', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '475', 'PISTA CUT SMALL NORMAL', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '476', 'PISTA POWDER NORMAL', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '477', 'GREEN PISTA SLICE', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '478', 'GREEN PISTA CUT SMALL', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '266', 'PINK GHEE LADDU DHANA', 'PINK GHEE LADDU DHANA', 'Standard', 'PINK GHEE LADDU DHANA', 'SEMI FINISHED ITEMS',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'I', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '479', 'GREEN PISTA POWDER', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '480', 'PISTA SLICE NORMAL', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '481', 'BADAM SLICE', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '482', 'BADAM CUT SMALL', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '483', 'BADAM POWDER MACHINE', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '484', 'KALAKAND RM', '', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - Suryarun', 46123.48390046296, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '486', 'RED LADDU DHANA GHEE', 'RED LADDU DHANA GHEE', 'Standard', '', 'SEMI FINISHED ITEMS',
  46078.91185185185, 'Bulk Insert - Suryarun', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '276', 'GHEE LADDU DHANA', 'GHEE LADDU DHANA', 'Standard', '', 'SEMI FINISHED ITEMS',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '178', 'AVAL MIXTURE', 'AVAL MIXTURE', 'Standard', 'AVAL MIXTURE', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '223', 'CHAKLI', 'CHAKLI', 'Standard', 'CHAKLI', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '150', 'BOMBAY MIXTURE', 'BOMBAY MIXTURE', 'Standard', 'BOMBAY MIXTURE', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '151', 'BUTTER MURUKKU', 'BUTTER MURUKKU', 'Standard', 'BUTTER MURUKKU', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '152', 'CHAKODI', 'CHAKODI', 'Standard', 'CHAKODI', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '153', 'CORN MIXTURE', 'CORN MIXTURE', 'Standard', 'CORN MIXTURE', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '154', 'DRY FRUIT MIXTURE', 'DRY FRUIT MIXTURE', 'Standard', 'DRY FRUIT MIXTURE', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '155', 'DRY SAMOSA', 'DRY SAMOSA', 'Standard', 'DRY SAMOSA', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '156', 'ELLU MURUKKU', 'ELLU MURUKKU', 'Standard', 'ELLU MURUKKU', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '157', 'GARLIC NIPPATTU', 'GARLIC NIPPATTU', 'Standard', 'GARLIC NIPPATTU', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '158', 'KAARA BOONDHI', 'KAARA BOONDHI', 'Standard', 'KAARA BOONDHI', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '159', 'KAARA MIXTURE', 'KAARA MIXTURE', 'Standard', 'KAARA MIXTURE', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '160', 'KAARA SEV', 'KAARA SEV', 'Standard', 'KAARA SEV', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '161', 'KAJU PAKODA', 'KAJU PAKODA', 'Standard', 'KAJU PAKODA', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '162', 'KARELA PAKODA', 'KARELA PAKODA', 'Standard', 'KARELA PAKODA', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '163', 'KODUBALE', 'KODUBALE', 'Standard', 'KODUBALE', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '164', 'MADHUR VADA', 'MADHUR VADA', 'Standard', 'MADHUR VADA', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '165', 'MASALA PEANUT', 'MASALA PEANUT', 'Standard', 'MASALA PEANUT', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '166', 'NAMAK PARA', 'NAMAK PARA', 'Standard', 'NAMAK PARA', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '167', 'NAVADHANIYA MIXTURE', 'NAVADHANIYA MIXTURE', 'Standard', 'NAVADHANIYA MIXTURE', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - Suryarun', 46123.43678240741, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '168', 'OMPODI', 'OMPODI', 'Standard', 'OMPODI', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '169', 'ONION PAKKODA', 'ONION PAKKODA', 'Standard', 'ONION PAKKODA', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '170', 'PALAK PAKODA', 'PALAK PAKODA', 'Standard', 'PALAK PAKODA', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '171', 'PEPPER CASHEWS', 'PEPPER CASHEWS', 'Standard', 'PEPPER CASHEWS', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '172', 'RIBBON MURUKKU', 'RIBBON MURUKKU', 'Standard', 'RIBBON MURUKKU', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '173', 'SALTED BADAM', 'SALTED BADAM', 'Standard', 'SALTED BADAM', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '174', 'SALTED CASHEWS', 'SALTED CASHEWS', 'Standard', 'SALTED CASHEWS', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '175', 'SHAKKAR PALI', 'SHAKKAR PALI', 'Standard', 'SHAKKAR PALI', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '176', 'SMALL NIPPATTU', 'SMALL NIPPATTU', 'Standard', 'SMALL NIPPATTU', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '177', 'SMALL SEV', 'SMALL SEV', 'Standard', 'SMALL SEV', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '149', 'BIG NIPPATTU', 'BIG NIPPATTU', 'Standard', 'BIG NIPPATTU', 'Savouries',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '244', 'GUD KHASTA GAJAK 200GMS', 'GUD KHASTA GAJAK 200GMS', 'Standard', '', 'Til Items',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '180', 'TIL LADDU', 'TIL LADDU', 'Standard', 'Til Laddu', 'Til Items',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '245', 'GUD GAJAK ROLL 200GMS', 'GUD GAJAK ROLL 200GMS', 'Standard', '', 'Til Items',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '246', 'GUD GAJAK BURFI 250GMS', 'GUD GAJAK BURFI 250GMS', 'Standard', '', 'Til Items',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '247', 'GUD REWDI 200GMS', 'GUD REWDI 200GMS', 'Standard', '', 'Til Items',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '179', 'TIL BURFI', 'TIL BURFI', 'Standard', 'Til Burfi', 'Til Items',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '181', 'POMEGRANATE TURKISH DELIGHT', 'POMEGRANATE TURKISH DELIGHT', 'Standard', 'POMEGRANATE TURKISH DELIGHT', 'Turkish Delights',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '210', 'WATER BOTTTLE 1/2LTR', '.', 'Standard', '', 'Water & Cool Drinks',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '209', 'MAZA/FROOTI', '.', 'Standard', '', 'Water & Cool Drinks',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
),
(
  '211', 'WATER BOTTTLE 1LTR', '.', 'Standard', '', 'Water & Cool Drinks',
  46056.50996527778, 'MIGRATION', 'BULK Item - gowtham.m.agiledev@gofrugal.com', 46114.76460648148, 3, true,
  '', 'GST 5%', '', 'Regular', 'K', 'UNINITIALIZED',
  '', 1, '1', '', '13081_Item_maste_tem_master_1_2026_07_17_130705.xls'
)
on conflict (item_code) do update set
  name = excluded.name, short_name = excluded.short_name, product_type = excluded.product_type,
  aliases = excluded.aliases, major_category = excluded.major_category, created_serial = excluded.created_serial,
  source_created_by = excluded.source_created_by, source_updated_by = excluded.source_updated_by,
  updated_serial = excluded.updated_serial, decimal_point = excluded.decimal_point,
  discount_allowed = excluded.discount_allowed, hsn = excluded.hsn, gst_tax = excluded.gst_tax,
  ean_code = excluded.ean_code, trade_configuration = excluded.trade_configuration, prepared = excluded.prepared,
  generic_name = excluded.generic_name, item_type = excluded.item_type, item_per_unit = excluded.item_per_unit,
  item_product_type = excluded.item_product_type, packing = excluded.packing, source_sheet = excluded.source_sheet,
  updated_at = now();

alter table public.external_item_master enable row level security;

drop policy if exists external_item_master_read on public.external_item_master;
create policy external_item_master_read on public.external_item_master
  for select to authenticated using (private.has_permission('items-menu','view'));

drop policy if exists external_item_master_admin_write on public.external_item_master;
create policy external_item_master_admin_write on public.external_item_master
  for all to authenticated
  using (private.has_permission('items-menu','edit'))
  with check (private.has_permission('items-menu','edit'));
