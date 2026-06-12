insert into public.events (
  title, description, event_date, event_time, location, organizer_name, city,
  emoji, color, featured, attendees_count, status
) values
  ('African Cultural Festival 2026',
   'A full day celebration of African culture: music, dance, food, fashion show and kids activities. Free entry for the community.',
   '2026-04-12', '11:00 AM', 'Royse City Park, Main Pavilion',
   'Royse City African Community', 'Royse City',
   '🎉', 'from-crimson to-amber-500', true, 184, 'approved'),
  ('Immigration legal clinic',
   'Free consultations with certified immigration attorneys. Bring your documents. Translation in French available.',
   '2026-03-22', '10:00 AM', 'Royse City Community Center',
   'African Legal Aid Network', 'Royse City',
   '⚖️', 'from-navy to-navy-light', true, 56, 'approved'),
  ('Youth mentorship program launch',
   'Mentorship program for African youth aged 14-22. Career guidance, college prep, leadership skills.',
   '2026-03-29', '2:00 PM', 'Dallas Public Library, Room 204',
   'African Youth Network', 'Dallas',
   '🎓', 'from-emerald-600 to-teal-700', false, 32, 'approved'),
  ('Women entrepreneurs networking',
   'Monthly networking for African women business owners. Guest speaker: founder of Sankofa Tax.',
   '2026-04-05', '6:30 PM', 'Chez Tantine Restaurant',
   'African Women Business Network', 'Dallas',
   '👩🏾‍💼', 'from-purple-600 to-pink-600', false, 48, 'approved');
