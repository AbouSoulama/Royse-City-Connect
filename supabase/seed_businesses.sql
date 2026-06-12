-- Données de démo — entreprises (exécuter après 001_initial_schema.sql)
-- Ignorer si déjà inséré

insert into public.businesses (
  name, category, description, owner_name, phone, whatsapp, city, address,
  emoji, color, verified, featured, rating, status, created_at
) values
  ('Mama Africa Market', 'Grocery',
   'Authentic African groceries: plantains, cassava, fufu, palm oil, dried fish, spices and more. Family-owned since 2024.',
   'Sarah Eyong', '+1 (469) 555-0142', '+14695550142', 'Rockwall', '1240 N Goliad St, Rockwall, TX',
   '🛒', 'from-amber-500 to-orange-600', true, true, 4.8, 'approved', '2024-08-12'),
  ('Chez Tantine Restaurant', 'Restaurant',
   'Authentic Cameroonian cuisine. Ndolè, eru, achu, pepper soup, grilled fish. Catering available for events.',
   'Marie Ngono', '+1 (469) 555-0188', '+14695550188', 'Dallas', '3402 Forest Ln, Dallas, TX',
   '🍲', 'from-crimson to-crimson-dark', true, true, 4.9, 'approved', '2023-11-04'),
  ('Royse City Auto Repair', 'Automotive',
   'Honest, affordable car repair by a trusted African mechanic. Oil change, brakes, diagnostics, body work.',
   'Jean-Paul Mbarga', '+1 (214) 555-0199', '+12145550199', 'Royse City', '801 E Main St, Royse City, TX',
   '🔧', 'from-slate-600 to-slate-800', true, false, 4.7, 'approved', '2024-02-20'),
  ('Afro Beauty Salon', 'Beauty',
   'Braids, twists, locs, weaves and natural hair care. Specialist in African hairstyles for women and children.',
   'Aissatou Diallo', '+1 (972) 555-0166', '+19725550166', 'Dallas', null,
   '💇🏾‍♀️', 'from-pink-500 to-fuchsia-600', true, false, 4.9, 'approved', '2024-05-08'),
  ('Sankofa Tax & Accounting', 'Services',
   'Tax filing, ITIN applications, small business bookkeeping. Bilingual French/English service.',
   'Kwame Asante', '+1 (469) 555-0173', '+14695550173', 'Royse City', null,
   '📊', 'from-emerald-600 to-teal-700', true, true, 4.8, 'approved', '2023-09-15'),
  ('African Fashion House', 'Fashion',
   'Custom-made African wear: kaba, agbada, kente, ankara dresses. Tailoring and alterations.',
   'Fatou Sow', '+1 (214) 555-0155', '+12145550155', 'Dallas', null,
   '👗', 'from-purple-600 to-indigo-700', false, false, 4.6, 'pending', '2024-10-01');
