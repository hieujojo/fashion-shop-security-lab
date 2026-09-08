INSERT INTO users (email, password, role) VALUES
  ('admin@fashionhub.dev',   'admin123',   'admin'),
  ('alice@fashionhub.dev',   'alice123',   'customer'),
  ('mallory@fashionhub.dev', 'mallory123', 'customer');

INSERT INTO products (name, description, price_cents, category, image_url) VALUES
  ('Slim-fit Denim Jacket', 'Classic denim jacket, stone-washed.', 8900, 'men', 'https://images.unsplash.com/photo-1576871337622-98d4871dc5ae?w=800&q=80'),
  ('Cashmere Crewneck',     'Ultra-soft cashmere knit.',           12000, 'men', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6cafa?w=800&q=80'),
  ('Linen Summer Shirt',    'Breathable linen, relaxed fit.',      4500, 'men', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'),
  ('Tailored Wool Blazer',  'Italian wool, single-breasted.',      15900, 'men', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'),
  ('Cotton Chino Pants',    'Stretch cotton, tapered cut.',        6900, 'men', 'https://images.unsplash.com/photo-1478179615234-dac2fcb1288e?w=800&q=80'),
  ('Silk Wrap Dress',       'Elegant silk, midi length.',          13900, 'women', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'),
  ('Denim Skirt',           'High-waist A-line denim.',            5200, 'women', 'https://images.unsplash.com/photo-1583496661160-fb5886a0d8ab?w=800&q=80'),
  ('Knit Cardigan',         'Cozy oversized cardigan.',            7800, 'women', 'https://images.unsplash.com/photo-1434389677669-e08b99cac7c4?w=800&q=80'),
  ('Pleated Midi Skirt',    'Flowing pleats, satin finish.',       6500, 'women', 'https://images.unsplash.com/photo-1583496661141-67804be3e335?w=800&q=80'),
  ('Cropped Puffer Vest',   'Lightweight quilted vest.',           9800, 'women', 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80'),
  ('Leather Crossbody Bag', 'Full-grain leather.',                 7500, 'accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'),
  ('Aviator Sunglasses',    'UV400 polarized lenses.',             3500, 'accessories', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'),
  ('Silk Scarf',            'Hand-rolled edges.',                  2900, 'accessories', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80'),
  ('Wool Beanie',           'Merino wool, ribbed knit.',           1900, 'accessories', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab6?w=800&q=80'),
  ('Canvas Tote Bag',       'Heavy-duty canvas, inner pocket.',    2400, 'accessories', 'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80');

INSERT INTO reviews (product_id, author, content, rating) VALUES
  (1, 'alice',  'Great fit and the denim feels premium.', 5),
  (1, 'daniel', 'Runs slightly large, size down.', 4),
  (6, 'sofia',  'The silk is gorgeous, perfect for events.', 5),
  (11, 'mike',  'Nice bag but strap is a bit thin.', 4),
  (2, 'alice',  'Softest sweater I own.', 5);
