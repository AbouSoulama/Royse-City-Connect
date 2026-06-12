-- New post categories: hospitality (hôtels) & real estate (immobilier)
alter type public.post_category add value if not exists 'hospitality';
alter type public.post_category add value if not exists 'realestate';
