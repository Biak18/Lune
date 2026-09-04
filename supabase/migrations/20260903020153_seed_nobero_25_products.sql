-- Clear existing catalog (idempotent)
delete from product_images;
delete from product_variants;
delete from products;
delete from categories;

-- Seed categories (Nobero-inspired)
insert into categories (id, name, slug, description, sort_order, is_active, image_url) values
  (gen_random_uuid(), 'T-Shirts', 't-shirts', 'Essential and graphic tees inspired by Nobero', 1, true, 'https://nobero.com/cdn/shop/collections/6_3947fc67-5783-4d32-9311-506c676a9ce8.jpg'),
  (gen_random_uuid(), 'Shirts', 'shirts', 'Oxford, linen and flannel shirts', 2, true, 'https://nobero.com/cdn/shop/collections/TEXTURED_SHIRTS_jpg.jpg'),
  (gen_random_uuid(), 'Hoodies', 'hoodies', 'Fleece, zip-up and washed hoodies', 3, true, 'https://nobero.com/cdn/shop/collections/Website_Shop_men_220_x_304_9.png'),
  (gen_random_uuid(), 'Pants', 'pants', 'Cargo, chino and linen pants', 4, true, 'https://nobero.com/cdn/shop/collections/Cargo_Pants_Icon_Home_Page_copy.jpg'),
  (gen_random_uuid(), 'Joggers', 'joggers', 'Everyday and travel joggers', 5, true, 'https://nobero.com/cdn/shop/collections/6_29719fa5-f748-482e-8039-fda30c64d1db.jpg'),
  (gen_random_uuid(), 'Shorts', 'shorts', 'Utility and active shorts', 6, true, 'https://nobero.com/cdn/shop/collections/8.jpg'),
  (gen_random_uuid(), 'Polos', 'polos', 'Classic and travel polos', 7, true, 'https://nobero.com/cdn/shop/collections/7p_69c2c6cf-78a7-441f-b34a-ab147745806d.jpg'),
  (gen_random_uuid(), 'Co-ord Sets', 'co-ord-sets', 'Matched co-ord sets', 8, true, 'https://nobero.com/cdn/shop/collections/9.jpg');

-- Seed 25 products
insert into products (name, slug, description, base_price, category_id, style, occasion, is_active) values
  ('Classic Cotton T-Shirt', 'classic-cotton-t-shirt', 'Nobero-inspired everyday tee — soft cotton, clean finish for daily wear.', 49.00, (select id from categories where slug='t-shirts'), 'minimal', 'everyday', true),
  ('Oversized Street T-Shirt', 'oversized-street-t-shirt', 'Heavyweight oversized street tee with dropped shoulders.', 59.00, (select id from categories where slug='t-shirts'), 'casual', 'everyday', true),
  ('Vintage Graphic T-Shirt', 'vintage-graphic-t-shirt', 'Vintage washed graphic tee with soft handfeel print.', 55.00, (select id from categories where slug='t-shirts'), 'bold', 'casual', true),
  ('Oxford Casual Shirt', 'oxford-casual-shirt', 'Classic oxford weave shirt — crisp, breathable, perfect for smart-casual.', 69.00, (select id from categories where slug='shirts'), 'minimal', 'office', true),
  ('Linen Button-Up Shirt', 'linen-button-up-shirt', 'Lightweight linen shirt with relaxed drape for summer.', 72.00, (select id from categories where slug='shirts'), 'elegant', 'vacation', true),
  ('Classic Flannel Shirt', 'classic-flannel-shirt', 'Brushed flannel shirt with timeless checks.', 75.00, (select id from categories where slug='shirts'), 'casual', 'everyday', true),
  ('Urban Fleece Hoodie', 'urban-fleece-hoodie', 'Mid-weight fleece hoodie with kangaroo pocket — street-ready warmth.', 89.00, (select id from categories where slug='hoodies'), 'casual', 'everyday', true),
  ('Essential Pullover Hoodie', 'essential-pullover-hoodie', 'Premium pullover hoodie, garment-washed softness.', 85.00, (select id from categories where slug='hoodies'), 'minimal', 'casual', true),
  ('Zip-Up Performance Hoodie', 'zip-up-performance-hoodie', 'Athleisure zip-up with stretch and breathability.', 92.00, (select id from categories where slug='hoodies'), 'minimal', 'casual', true),
  ('Vintage Washed Hoodie', 'vintage-washed-hoodie', 'Pigment-washed vintage hoodie with faded texture.', 88.00, (select id from categories where slug='hoodies'), 'bold', 'casual', true),
  ('Cargo Pants', 'cargo-pants', 'Utility cargo pants with multiple pockets and tapered fit.', 79.00, (select id from categories where slug='pants'), 'casual', 'everyday', true),
  ('Slim Chino Pants', 'slim-chino-pants', 'Slim chino with stretch twill — work to weekend.', 78.00, (select id from categories where slug='pants'), 'minimal', 'office', true),
  ('Wide-Leg Linen Pants', 'wide-leg-linen-pants', 'Relaxed wide-leg linen pants for effortless vacation wear.', 82.00, (select id from categories where slug='pants'), 'elegant', 'vacation', true),
  ('Jogger Sweat Pants', 'jogger-sweat-pants', 'French terry jogger with ribbed cuffs.', 76.00, (select id from categories where slug='pants'), 'casual', 'everyday', true),
  ('Travel Jogger', 'travel-jogger', 'Nobero-inspired travel jogger — 4-way stretch, wrinkle-resistant.', 84.00, (select id from categories where slug='joggers'), 'minimal', 'vacation', true),
  ('Everyday Terry Jogger', 'everyday-terry-jogger', 'Soft loop-knit terry jogger for daily comfort.', 74.00, (select id from categories where slug='joggers'), 'casual', 'everyday', true),
  ('Active Training Jogger', 'active-training-jogger', 'Performance jogger with moisture-wicking.', 79.00, (select id from categories where slug='joggers'), 'minimal', 'everyday', true),
  ('Zip Pocket Shorts', 'zip-pocket-shorts', 'Utility zip pocket shorts — bestseller at Nobero.', 49.00, (select id from categories where slug='shorts'), 'casual', 'everyday', true),
  ('Classic Chino Shorts', 'classic-chino-shorts', 'Chino shorts with garment wash.', 54.00, (select id from categories where slug='shorts'), 'minimal', 'vacation', true),
  ('Active Mesh Shorts', 'active-mesh-shorts', 'Lightweight active shorts with breathable mesh.', 46.00, (select id from categories where slug='shorts'), 'casual', 'casual', true),
  ('Classic Pique Polo', 'classic-pique-polo', 'Pique knit polo — timeless collar, modern fit.', 64.00, (select id from categories where slug='polos'), 'minimal', 'office', true),
  ('Travel Polo T-Shirt', 'travel-polo-t-shirt', 'Travel polo with quick-dry pique, Nobero bestseller.', 68.00, (select id from categories where slug='polos'), 'minimal', 'vacation', true),
  ('Striped Knit Polo', 'striped-knit-polo', 'Striped knit polo with retro collar.', 66.00, (select id from categories where slug='polos'), 'bold', 'casual', true),
  ('Daily Co-ord Set', 'daily-co-ord-set', 'Matching co-ord set — tee + bottoms for effortless styling.', 99.00, (select id from categories where slug='co-ord-sets'), 'minimal', 'everyday', true),
  ('Loungewear Co-ord', 'loungewear-co-ord', 'Soft loungewear co-ord with relaxed silhouette.', 96.00, (select id from categories where slug='co-ord-sets'), 'elegant', 'everyday', true);

-- Seed variants per spec (color x size)
insert into product_variants (product_id, sku, color, size, stock_quantity, price) 
select p.id, sku, color, size, stock, null from products p cross join (values
  ('CCT-BLK-S','Black','S',12),('CCT-BLK-M','Black','M',10),('CCT-BLK-L','Black','L',8),('CCT-BLK-XL','Black','XL',6),
  ('CCT-WHT-S','White','S',11),('CCT-WHT-M','White','M',9),('CCT-WHT-L','White','L',7),('CCT-WHT-XL','White','XL',5),
  ('CCT-NVY-S','Navy','S',9),('CCT-NVY-M','Navy','M',8),('CCT-NVY-L','Navy','L',6),('CCT-NVY-XL','Navy','XL',4)
) v(sku,color,size,stock) where p.slug='classic-cotton-t-shirt';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('OST-BLK-M','Black','M',14),('OST-BLK-L','Black','L',11),('OST-BLK-XL','Black','XL',8),('OST-BLK-XXL','Black','XXL',5),
  ('OST-BEI-M','Beige','M',10),('OST-BEI-L','Beige','L',8),('OST-BEI-XL','Beige','XL',6),('OST-BEI-XXL','Beige','XXL',3),
  ('OST-GRY-M','Gray','M',9),('OST-GRY-L','Gray','L',7),('OST-GRY-XL','Gray','XL',5),('OST-GRY-XXL','Gray','XXL',2)
) v(sku,color,size,stock) where p.slug='oversized-street-t-shirt';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('VGT-WHT-S','White','S',10),('VGT-WHT-M','White','M',8),('VGT-WHT-L','White','L',6),('VGT-WHT-XL','White','XL',4),
  ('VGT-BRN-S','Brown','S',9),('VGT-BRN-M','Brown','M',7),('VGT-BRN-L','Brown','L',5),('VGT-BRN-XL','Brown','XL',3),
  ('VGT-GRN-S','Green','S',8),('VGT-GRN-M','Green','M',6),('VGT-GRN-L','Green','L',4),('VGT-GRN-XL','Green','XL',0)
) v(sku,color,size,stock) where p.slug='vintage-graphic-t-shirt';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('OCS-WHT-S','White','S',12),('OCS-WHT-M','White','M',10),('OCS-WHT-L','White','L',7),('OCS-WHT-XL','White','XL',4),
  ('OCS-BLU-S','Blue','S',11),('OCS-BLU-M','Blue','M',9),('OCS-BLU-L','Blue','L',6),('OCS-BLU-XL','Blue','XL',3),
  ('OCS-GRY-S','Gray','S',10),('OCS-GRY-M','Gray','M',8),('OCS-GRY-L','Gray','L',5),('OCS-GRY-XL','Gray','XL',2)
) v(sku,color,size,stock) where p.slug='oxford-casual-shirt';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('LBS-BEI-S','Beige','S',10),('LBS-BEI-M','Beige','M',8),('LBS-BEI-L','Beige','L',6),('LBS-BEI-XL','Beige','XL',3),
  ('LBS-WHT-S','White','S',9),('LBS-WHT-M','White','M',7),('LBS-WHT-L','White','L',5),('LBS-WHT-XL','White','XL',2),
  ('LBS-OLV-S','Olive','S',8),('LBS-OLV-M','Olive','M',6),('LBS-OLV-L','Olive','L',4),('LBS-OLV-XL','Olive','XL',1)
) v(sku,color,size,stock) where p.slug='linen-button-up-shirt';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('CFS-RED-M','Red','M',11),('CFS-RED-L','Red','L',8),('CFS-RED-XL','Red','XL',5),('CFS-RED-XXL','Red','XXL',2),
  ('CFS-GRN-M','Green','M',9),('CFS-GRN-L','Green','L',6),('CFS-GRN-XL','Green','XL',3),('CFS-GRN-XXL','Green','XXL',1),
  ('CFS-NVY-M','Navy','M',10),('CFS-NVY-L','Navy','L',7),('CFS-NVY-XL','Navy','XL',4),('CFS-NVY-XXL','Navy','XXL',0)
) v(sku,color,size,stock) where p.slug='classic-flannel-shirt';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('UFH-BLK-M','Black','M',12),('UFH-BLK-L','Black','L',9),('UFH-BLK-XL','Black','XL',6),('UFH-BLK-XXL','Black','XXL',3),
  ('UFH-GRY-M','Gray','M',10),('UFH-GRY-L','Gray','L',7),('UFH-GRY-XL','Gray','XL',4),('UFH-GRY-XXL','Gray','XXL',2),
  ('UFH-NVY-M','Navy','M',11),('UFH-NVY-L','Navy','L',8),('UFH-NVY-XL','Navy','XL',5),('UFH-NVY-XXL','Navy','XXL',1)
) v(sku,color,size,stock) where p.slug='urban-fleece-hoodie';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('EPH-CHA-S','Charcoal','S',10),('EPH-CHA-M','Charcoal','M',8),('EPH-CHA-L','Charcoal','L',6),('EPH-CHA-XL','Charcoal','XL',3),
  ('EPH-CRM-S','Cream','S',9),('EPH-CRM-M','Cream','M',7),('EPH-CRM-L','Cream','L',4),('EPH-CRM-XL','Cream','XL',2),
  ('EPH-OLV-S','Olive','S',8),('EPH-OLV-M','Olive','M',6),('EPH-OLV-L','Olive','L',3),('EPH-OLV-XL','Olive','XL',1)
) v(sku,color,size,stock) where p.slug='essential-pullover-hoodie';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('ZPH-BLK-S','Black','S',11),('ZPH-BLK-M','Black','M',9),('ZPH-BLK-L','Black','L',6),('ZPH-BLK-XL','Black','XL',3),
  ('ZPH-WHT-S','White','S',10),('ZPH-WHT-M','White','M',8),('ZPH-WHT-L','White','L',5),('ZPH-WHT-XL','White','XL',2),
  ('ZPH-BLU-S','Blue','S',9),('ZPH-BLU-M','Blue','M',7),('ZPH-BLU-L','Blue','L',4),('ZPH-BLU-XL','Blue','XL',1)
) v(sku,color,size,stock) where p.slug='zip-up-performance-hoodie';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('VWH-BEI-M','Beige','M',10),('VWH-BEI-L','Beige','L',7),('VWH-BEI-XL','Beige','XL',4),('VWH-BEI-XXL','Beige','XXL',1),
  ('VWH-BRN-M','Brown','M',9),('VWH-BRN-L','Brown','L',6),('VWH-BRN-XL','Brown','XL',3),('VWH-BRN-XXL','Brown','XXL',0),
  ('VWH-GRY-M','Gray','M',8),('VWH-GRY-L','Gray','L',5),('VWH-GRY-XL','Gray','XL',2),('VWH-GRY-XXL','Gray','XXL',1)
) v(sku,color,size,stock) where p.slug='vintage-washed-hoodie';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('CRG-BLK-S','Black','S',12),('CRG-BLK-M','Black','M',9),('CRG-BLK-L','Black','L',6),('CRG-BLK-XL','Black','XL',3),
  ('CRG-OLV-S','Olive','S',10),('CRG-OLV-M','Olive','M',7),('CRG-OLV-L','Olive','L',4),('CRG-OLV-XL','Olive','XL',1),
  ('CRG-KHK-S','Khaki','S',9),('CRG-KHK-M','Khaki','M',6),('CRG-KHK-L','Khaki','L',3),('CRG-KHK-XL','Khaki','XL',0)
) v(sku,color,size,stock) where p.slug='cargo-pants';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('SCP-NVY-S','Navy','S',11),('SCP-NVY-M','Navy','M',8),('SCP-NVY-L','Navy','L',5),('SCP-NVY-XL','Navy','XL',2),
  ('SCP-BEI-S','Beige','S',10),('SCP-BEI-M','Beige','M',7),('SCP-BEI-L','Beige','L',4),('SCP-BEI-XL','Beige','XL',1),
  ('SCP-GRY-S','Gray','S',9),('SCP-GRY-M','Gray','M',6),('SCP-GRY-L','Gray','L',3),('SCP-GRY-XL','Gray','XL',0)
) v(sku,color,size,stock) where p.slug='slim-chino-pants';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('WLP-WHT-S','White','S',10),('WLP-WHT-M','White','M',7),('WLP-WHT-L','White','L',4),('WLP-WHT-XL','White','XL',1),
  ('WLP-BEI-S','Beige','S',9),('WLP-BEI-M','Beige','M',6),('WLP-BEI-L','Beige','L',3),('WLP-BEI-XL','Beige','XL',0),
  ('WLP-OLV-S','Olive','S',8),('WLP-OLV-M','Olive','M',5),('WLP-OLV-L','Olive','L',2),('WLP-OLV-XL','Olive','XL',1)
) v(sku,color,size,stock) where p.slug='wide-leg-linen-pants';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('JSP-BLK-S','Black','S',12),('JSP-BLK-M','Black','M',9),('JSP-BLK-L','Black','L',6),('JSP-BLK-XL','Black','XL',3),('JSP-BLK-XXL','Black','XXL',1),
  ('JSP-GRY-S','Gray','S',10),('JSP-GRY-M','Gray','M',7),('JSP-GRY-L','Gray','L',4),('JSP-GRY-XL','Gray','XL',2),('JSP-GRY-XXL','Gray','XXL',0),
  ('JSP-NVY-S','Navy','S',11),('JSP-NVY-M','Navy','M',8),('JSP-NVY-L','Navy','L',5),('JSP-NVY-XL','Navy','XL',2),('JSP-NVY-XXL','Navy','XXL',1)
) v(sku,color,size,stock) where p.slug='jogger-sweat-pants';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('TRJ-BLK-S','Black','S',12),('TRJ-BLK-M','Black','M',9),('TRJ-BLK-L','Black','L',6),('TRJ-BLK-XL','Black','XL',3),
  ('TRJ-GRY-S','Gray','S',10),('TRJ-GRY-M','Gray','M',7),('TRJ-GRY-L','Gray','L',4),('TRJ-GRY-XL','Gray','XL',1),
  ('TRJ-NVY-S','Navy','S',11),('TRJ-NVY-M','Navy','M',8),('TRJ-NVY-L','Navy','L',5),('TRJ-NVY-XL','Navy','XL',2)
) v(sku,color,size,stock) where p.slug='travel-jogger';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('ETJ-BEI-M','Beige','M',10),('ETJ-BEI-L','Beige','L',7),('ETJ-BEI-XL','Beige','XL',4),('ETJ-BEI-XXL','Beige','XXL',1),
  ('ETJ-OLV-M','Olive','M',9),('ETJ-OLV-L','Olive','L',6),('ETJ-OLV-XL','Olive','XL',3),('ETJ-OLV-XXL','Olive','XXL',0),
  ('ETJ-CHA-M','Charcoal','M',8),('ETJ-CHA-L','Charcoal','L',5),('ETJ-CHA-XL','Charcoal','XL',2),('ETJ-CHA-XXL','Charcoal','XXL',1)
) v(sku,color,size,stock) where p.slug='everyday-terry-jogger';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('ATJ-BLK-S','Black','S',11),('ATJ-BLK-M','Black','M',8),('ATJ-BLK-L','Black','L',5),('ATJ-BLK-XL','Black','XL',2),
  ('ATJ-BLU-S','Blue','S',10),('ATJ-BLU-M','Blue','M',7),('ATJ-BLU-L','Blue','L',4),('ATJ-BLU-XL','Blue','XL',1),
  ('ATJ-GRY-S','Gray','S',9),('ATJ-GRY-M','Gray','M',6),('ATJ-GRY-L','Gray','L',3),('ATJ-GRY-XL','Gray','XL',0)
) v(sku,color,size,stock) where p.slug='active-training-jogger';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('ZPS-BLK-S','Black','S',12),('ZPS-BLK-M','Black','M',9),('ZPS-BLK-L','Black','L',6),('ZPS-BLK-XL','Black','XL',3),
  ('ZPS-GRY-S','Gray','S',10),('ZPS-GRY-M','Gray','M',7),('ZPS-GRY-L','Gray','L',4),('ZPS-GRY-XL','Gray','XL',1),
  ('ZPS-NVY-S','Navy','S',11),('ZPS-NVY-M','Navy','M',8),('ZPS-NVY-L','Navy','L',5),('ZPS-NVY-XL','Navy','XL',2)
) v(sku,color,size,stock) where p.slug='zip-pocket-shorts';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('CCS-KHK-S','Khaki','S',10),('CCS-KHK-M','Khaki','M',7),('CCS-KHK-L','Khaki','L',4),('CCS-KHK-XL','Khaki','XL',1),
  ('CCS-OLV-S','Olive','S',9),('CCS-OLV-M','Olive','M',6),('CCS-OLV-L','Olive','L',3),('CCS-OLV-XL','Olive','XL',0),
  ('CCS-NVY-S','Navy','S',8),('CCS-NVY-M','Navy','M',5),('CCS-NVY-L','Navy','L',2),('CCS-NVY-XL','Navy','XL',1)
) v(sku,color,size,stock) where p.slug='classic-chino-shorts';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('AMS-BLK-M','Black','M',11),('AMS-BLK-L','Black','L',8),('AMS-BLK-XL','Black','XL',5),('AMS-BLK-XXL','Black','XXL',2),
  ('AMS-WHT-M','White','M',10),('AMS-WHT-L','White','L',7),('AMS-WHT-XL','White','XL',4),('AMS-WHT-XXL','White','XXL',1),
  ('AMS-BLU-M','Blue','M',9),('AMS-BLU-L','Blue','L',6),('AMS-BLU-XL','Blue','XL',3),('AMS-BLU-XXL','Blue','XXL',0)
) v(sku,color,size,stock) where p.slug='active-mesh-shorts';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('CPP-WHT-S','White','S',11),('CPP-WHT-M','White','M',8),('CPP-WHT-L','White','L',5),('CPP-WHT-XL','White','XL',2),
  ('CPP-BLK-S','Black','S',10),('CPP-BLK-M','Black','M',7),('CPP-BLK-L','Black','L',4),('CPP-BLK-XL','Black','XL',1),
  ('CPP-NVY-S','Navy','S',9),('CPP-NVY-M','Navy','M',6),('CPP-NVY-L','Navy','L',3),('CPP-NVY-XL','Navy','XL',0)
) v(sku,color,size,stock) where p.slug='classic-pique-polo';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('TPT-WHT-S','White','S',12),('TPT-WHT-M','White','M',9),('TPT-WHT-L','White','L',6),('TPT-WHT-XL','White','XL',3),
  ('TPT-BLU-S','Blue','S',10),('TPT-BLU-M','Blue','M',7),('TPT-BLU-L','Blue','L',4),('TPT-BLU-XL','Blue','XL',1),
  ('TPT-BLK-S','Black','S',11),('TPT-BLK-M','Black','M',8),('TPT-BLK-L','Black','L',5),('TPT-BLK-XL','Black','XL',2)
) v(sku,color,size,stock) where p.slug='travel-polo-t-shirt';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('SKP-BEI-S','Beige','S',10),('SKP-BEI-M','Beige','M',7),('SKP-BEI-L','Beige','L',4),('SKP-BEI-XL','Beige','XL',1),
  ('SKP-BLU-S','Blue','S',9),('SKP-BLU-M','Blue','M',6),('SKP-BLU-L','Blue','L',3),('SKP-BLU-XL','Blue','XL',0),
  ('SKP-GRN-S','Green','S',8),('SKP-GRN-M','Green','M',5),('SKP-GRN-L','Green','L',2),('SKP-GRN-XL','Green','XL',1)
) v(sku,color,size,stock) where p.slug='striped-knit-polo';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('DCS-BLK-M','Black','M',10),('DCS-BLK-L','Black','L',7),('DCS-BLK-XL','Black','XL',4),
  ('DCS-BEI-M','Beige','M',9),('DCS-BEI-L','Beige','L',6),('DCS-BEI-XL','Beige','XL',3),
  ('DCS-OLV-M','Olive','M',8),('DCS-OLV-L','Olive','L',5),('DCS-OLV-XL','Olive','XL',2)
) v(sku,color,size,stock) where p.slug='daily-co-ord-set';

insert into product_variants (product_id, sku, color, size, stock_quantity, price)
select p.id, sku, color, size, stock, null from products p cross join (values
  ('LWC-GRY-S','Gray','S',10),('LWC-GRY-M','Gray','M',7),('LWC-GRY-L','Gray','L',4),('LWC-GRY-XL','Gray','XL',1),
  ('LWC-NVY-S','Navy','S',9),('LWC-NVY-M','Navy','M',6),('LWC-NVY-L','Navy','L',3),('LWC-NVY-XL','Navy','XL',0),
  ('LWC-CRM-S','Cream','S',8),('LWC-CRM-M','Cream','M',5),('LWC-CRM-L','Cream','L',2),('LWC-CRM-XL','Cream','XL',1)
) v(sku,color,size,stock) where p.slug='loungewear-co-ord';

-- Images (2 per product, primary + secondary) using Nobero CDN
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary) 
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/Black_04141ba6-659a-40cf-bd10-7ead3b65f1e2.jpg','Classic Cotton T-Shirt - Black',0,true),
  ('https://nobero.com/cdn/shop/files/PowderBlue_8a2ed8da-bbd6-444c-bedd-17db0fef3b9b.jpg','Classic Cotton T-Shirt - White/Navy',1,false)
) v(url,alt,ord,is_prim) where p.slug='classic-cotton-t-shirt';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/AloeGreen_ef5515ed-4bf4-4762-8bd0-6e20c77c2dc0.jpg','Oversized Street T-Shirt - Olive',0,true),
  ('https://nobero.com/cdn/shop/files/Black_04141ba6-659a-40cf-bd10-7ead3b65f1e2.jpg','Oversized Street T-Shirt - Black',1,false)
) v(url,alt,ord,is_prim) where p.slug='oversized-street-t-shirt';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/PowderBlue_8a2ed8da-bbd6-444c-bedd-17db0fef3b9b.jpg','Vintage Graphic T-Shirt - White',0,true),
  ('https://nobero.com/cdn/shop/files/AloeGreen_ef5515ed-4bf4-4762-8bd0-6e20c77c2dc0.jpg','Vintage Graphic T-Shirt - Green',1,false)
) v(url,alt,ord,is_prim) where p.slug='vintage-graphic-t-shirt';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/OXFORD_SHIRTS_70007ae9-9e3b-4b98-afe3-bc1b8b64764a.jpg','Oxford Casual Shirt - Flatlay',0,true),
  ('https://nobero.com/cdn/shop/files/OXFORD_SHIRTS_-_Desktop_Homepage_fbc099ae-299c-4c4c-a790-122264685e5e.jpg','Oxford Casual Shirt - Lifestyle',1,false)
) v(url,alt,ord,is_prim) where p.slug='oxford-casual-shirt';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/OXFORD_SHIRTS_70007ae9-9e3b-4b98-afe3-bc1b8b64764a.jpg','Linen Shirt - Beige',0,true),
  ('https://nobero.com/cdn/shop/files/Linen_Shirts-4.jpg','Linen Shirt - Texture',1,false)
) v(url,alt,ord,is_prim) where p.slug='linen-button-up-shirt';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/OXFORD_SHIRTS_70007ae9-9e3b-4b98-afe3-bc1b8b64764a.jpg','Flannel Shirt - Check',0,true),
  ('https://picsum.photos/seed/flannel2/600/800','Flannel Shirt - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='classic-flannel-shirt';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/trevel_hoodie.jpg','Urban Fleece Hoodie - Black',0,true),
  ('https://nobero.com/cdn/shop/collections/Website_Shop_men_220_x_304_9.png','Urban Fleece Hoodie - Grey',1,false)
) v(url,alt,ord,is_prim) where p.slug='urban-fleece-hoodie';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/trevel_hoodie.jpg','Essential Pullover Hoodie - Charcoal',0,true),
  ('https://picsum.photos/seed/hoodie2/600/800','Essential Pullover Hoodie - Back',1,false)
) v(url,alt,ord,is_prim) where p.slug='essential-pullover-hoodie';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/trevel_hoodie.jpg','Zip-Up Performance Hoodie - Navy',0,true),
  ('https://picsum.photos/seed/ziphoodie/600/800','Zip-Up Performance Hoodie - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='zip-up-performance-hoodie';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/trevel_hoodie.jpg','Vintage Washed Hoodie - Beige',0,true),
  ('https://picsum.photos/seed/vhoodie/600/800','Vintage Washed Hoodie - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='vintage-washed-hoodie';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/Cargo_Pants_f4f28077-9d53-45e8-92d8-ceebffdbb6f6.jpg','Cargo Pants - Olive',0,true),
  ('https://nobero.com/cdn/shop/collections/Cargo_Pants_Icon_Home_Page_copy.jpg','Cargo Pants - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='cargo-pants';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/Cargo_Pants_f4f28077-9d53-45e8-92d8-ceebffdbb6f6.jpg','Slim Chino Pants - Navy',0,true),
  ('https://picsum.photos/seed/chino/600/800','Slim Chino Pants - Back',1,false)
) v(url,alt,ord,is_prim) where p.slug='slim-chino-pants';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/Cargo_Pants_f4f28077-9d53-45e8-92d8-ceebffdbb6f6.jpg','Wide-Leg Linen Pants - White',0,true),
  ('https://picsum.photos/seed/linenpants/600/800','Wide-Leg Linen Pants - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='wide-leg-linen-pants';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/fashion_joggers.jpg','Jogger Sweat Pants - Black',0,true),
  ('https://nobero.com/cdn/shop/files/fashion_joggers.jpg','Jogger Sweat Pants - Grey',1,false)
) v(url,alt,ord,is_prim) where p.slug='jogger-sweat-pants';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/Arctic_Wolf_f3e5b1a4-8ced-44ad-b245-e0a0b1c486ab.jpg','Travel Jogger - Arctic Wolf',0,true),
  ('https://nobero.com/cdn/shop/files/fashion_joggers.jpg','Travel Jogger - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='travel-jogger';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/fashion_joggers.jpg','Everyday Terry Jogger - Beige',0,true),
  ('https://picsum.photos/seed/terryjogger/600/800','Everyday Terry Jogger - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='everyday-terry-jogger';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/fashion_joggers.jpg','Active Training Jogger - Black',0,true),
  ('https://picsum.photos/seed/activejogger/600/800','Active Training Jogger - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='active-training-jogger';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/0_7b4825b5-1715-4031-b6f4-0f9305e45973.jpg','Zip Pocket Shorts - Black',0,true),
  ('https://nobero.com/cdn/shop/files/ZipShortsPackFeb3_0e8998a8-532c-4250-8ed5-bbdd484053f6.jpg','Zip Pocket Shorts - Pack',1,false)
) v(url,alt,ord,is_prim) where p.slug='zip-pocket-shorts';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/0_7b4825b5-1715-4031-b6f4-0f9305e45973.jpg','Chino Shorts - Khaki',0,true),
  ('https://picsum.photos/seed/chinoshort/600/800','Chino Shorts - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='classic-chino-shorts';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/0_7b4825b5-1715-4031-b6f4-0f9305e45973.jpg','Active Mesh Shorts - Black',0,true),
  ('https://picsum.photos/seed/meshshort/600/800','Active Mesh Shorts - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='active-mesh-shorts';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/WhiteFrontPDP_d72899bb-3ecf-40ce-8b09-6c6068974224.png','Classic Pique Polo - White',0,true),
  ('https://nobero.com/cdn/shop/collections/7p_69c2c6cf-78a7-441f-b34a-ab147745806d.jpg','Classic Pique Polo - Navy',1,false)
) v(url,alt,ord,is_prim) where p.slug='classic-pique-polo';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/WhiteFrontPDP_d72899bb-3ecf-40ce-8b09-6c6068974224.png','Travel Polo T-Shirt - Blue',0,true),
  ('https://picsum.photos/seed/travelpolo/600/800','Travel Polo T-Shirt - Detail',1,false)
) v(url,alt,ord,is_prim) where p.slug='travel-polo-t-shirt';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/WhiteFrontPDP_d72899bb-3ecf-40ce-8b09-6c6068974224.png','Striped Knit Polo - Beige',0,true),
  ('https://picsum.photos/seed/stripedpolo/600/800','Striped Knit Polo - Stripes',1,false)
) v(url,alt,ord,is_prim) where p.slug='striped-knit-polo';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/Moses_Oilve_Green_copy_1.jpg','Daily Co-ord Set - Olive',0,true),
  ('https://nobero.com/cdn/shop/files/Moses_Sand.jpg','Daily Co-ord Set - Sand',1,false)
) v(url,alt,ord,is_prim) where p.slug='daily-co-ord-set';
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, url, alt, ord, is_prim from products p cross join (values
  ('https://nobero.com/cdn/shop/files/Moses_Oilve_Green_copy_1.jpg','Loungewear Co-ord - Gray',0,true),
  ('https://nobero.com/cdn/shop/files/Moses_Navy_blue_1_33af152c-f3a1-4fe2-b553-ce085efae0e5.jpg','Loungewear Co-ord - Navy',1,false)
) v(url,alt,ord,is_prim) where p.slug='loungewear-co-ord';
