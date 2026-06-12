-- Données de démo — à exécuter après 001_initial_schema.sql
-- Les posts n'ont pas d'author_id (contenu système / seed)

insert into public.posts (author_name, category, title, body, city, status, pinned, important, reactions_count, created_at) values
  ('Royse City Connect Team', 'alert', 'Severe weather alert — North Texas',
   'Strong thunderstorms expected this evening across Royse City and Rockwall County. Please stay indoors after 7pm and check on your elderly neighbors.',
   'Royse City', 'approved', true, true, 84, '2026-03-18'),
  ('African Legal Aid Network', 'immigration', 'Free immigration legal clinic — Saturday',
   'Free consultations with certified immigration attorneys. Bring your documents. Walk-ins welcome from 10am to 3pm at the Royse City Community Center.',
   'Royse City', 'approved', true, false, 142, '2026-03-17'),
  ('CCF Dallas', 'church', 'Sunday service — Cameroonian Christian Fellowship',
   'Join us this Sunday at 11am for worship, fellowship and a special message from Pastor Eyong. Children''s Sunday school available.',
   'Dallas', 'approved', false, false, 38, '2026-03-16'),
  ('Community Solidarity', 'fundraiser', 'Help the Nguemba family rebuild after fire',
   'The Nguemba family lost everything in a house fire last week. We are raising $15,000 to help them get back on their feet. Every dollar counts.',
   'Royse City', 'approved', false, false, 211, '2026-03-15'),
  ('Community News', 'news', 'New African grocery store opens in Rockwall',
   'Mama Africa Market officially opened its doors this weekend. Fresh plantains, cassava, fufu flour, palm oil and more available now.',
   'Rockwall', 'approved', false, false, 96, '2026-03-14'),
  ('CAANT - Cameroonian Association', 'association', 'Cameroonian Association monthly meeting',
   'Our monthly assembly will take place on March 30th at 4pm. Agenda: summer cultural festival planning, scholarship program, member updates.',
   'Dallas', 'approved', false, false, 27, '2026-03-13'),
  ('Tabi Family', 'funeral', 'Funeral arrangements — Late Mr. Tabi',
   'Wake keeping on Friday 7pm at the family residence. Funeral service Saturday at 10am. The community is invited to support the family.',
   'Royse City', 'pending', false, false, 0, '2026-03-12');
