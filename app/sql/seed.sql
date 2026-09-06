INSERT INTO users (email, password, role) VALUES
  ('admin@fashionhub.dev',   'admin123',   'admin'),
  ('alice@fashionhub.dev',   'alice123',   'customer'),
  ('mallory@fashionhub.dev', 'mallory123', 'customer');

INSERT INTO products (name, description, price_cents, category, image_url) VALUES
  ('Slim-fit Denim Jacket', 'Classic denim jacket, stone-washed.', 8900, 'men', '/img/products/1.svg'),
  ('Cashmere Crewneck',     'Ultra-soft cashmere knit.',           12000, 'men', '/img/products/2.svg'),
  ('Linen Summer Shirt',    'Breathable linen, relaxed fit.',      4500, 'men', '/img/products/3.svg'),
  ('Tailored Wool Blazer',  'Italian wool, single-breasted.',      15900, 'men', '/img/products/4.svg'),
  ('Cotton Chino Pants',    'Stretch cotton, tapered cut.',        6900, 'men', '/img/products/5.svg'),
  ('Silk Wrap Dress',       'Elegant silk, midi length.',          13900, 'women', '/img/products/6.svg'),
  ('Denim Skirt',           'High-waist A-line denim.',            5200, 'women', '/img/products/7.svg'),
  ('Knit Cardigan',         'Cozy oversized cardigan.',            7800, 'women', '/img/products/8.svg'),
  ('Pleated Midi Skirt',    'Flowing pleats, satin finish.',       6500, 'women', '/img/products/9.svg'),
  ('Cropped Puffer Vest',   'Lightweight quilted vest.',           9800, 'women', '/img/products/10.svg'),
  ('Leather Crossbody Bag', 'Full-grain leather.',                 7500, 'accessories', '/img/products/11.svg'),
  ('Aviator Sunglasses',    'UV400 polarized lenses.',             3500, 'accessories', '/img/products/12.svg'),
  ('Silk Scarf',            'Hand-rolled edges.',                  2900, 'accessories', '/img/products/13.svg'),
  ('Wool Beanie',           'Merino wool, ribbed knit.',           1900, 'accessories', '/img/products/14.svg'),
  ('Canvas Tote Bag',       'Heavy-duty canvas, inner pocket.',    2400, 'accessories', '/img/products/15.svg');

INSERT INTO reviews (product_id, author, content, rating) VALUES
  (1, 'alice',  'Great fit and the denim feels premium.', 5),
  (1, 'daniel', 'Runs slightly large, size down.', 4),
  (6, 'sofia',  'The silk is gorgeous, perfect for events.', 5),
  (11, 'mike',  'Nice bag but strap is a bit thin.', 4),
  (2, 'alice',  'Softest sweater I own.', 5);
