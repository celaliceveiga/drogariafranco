
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, cpf text, birth_date date, phone text, email text,
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profile own" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "profile insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profile update own" on public.profiles for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, label text, cep text not null, street text not null, number text not null,
  complement text, district text, city text not null, state text not null,
  is_default boolean not null default false, created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "addr own" on public.addresses for all to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin')) with check (user_id = auth.uid());

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete cascade,
  name text not null, slug text not null unique, icon text, image_url text,
  sort_order int not null default 0, active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "cat public read" on public.categories for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "cat admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create type public.product_kind as enum ('medicamento','dermocosmetico','higiene','beleza','infantil','suplemento','outros');
create type public.sale_class as enum ('livre','receita','controlado');
create type public.product_status as enum ('ativo','rascunho','inativo');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, brand text,
  kind product_kind not null default 'outros',
  sale_class sale_class not null default 'livre',
  is_generic boolean not null default false,
  active_ingredient text, concentration text, presentation text,
  anvisa_registry text, ean text, sku text,
  price numeric(10,2) not null default 0,
  promo_price numeric(10,2), promo_start timestamptz, promo_end timestamptz,
  cost numeric(10,2),
  stock int not null default 0, min_stock int not null default 5,
  weight_g int, width_cm numeric, height_cm numeric, length_cm numeric,
  description text, indications text, usage text, composition text, warnings text,
  leaflet_url text,
  tags text[] not null default '{}',
  status product_status not null default 'rascunho',
  featured boolean not null default false,
  seo_title text, seo_description text,
  sold_count int not null default 0,
  is_sample boolean not null default false,
  search_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_search_trgm on public.products using gin (search_text extensions.gin_trgm_ops);

create or replace function public.products_search_text() returns trigger language plpgsql set search_path = public, extensions as $$
begin
  new.search_text := lower(extensions.unaccent(coalesce(new.name,'')||' '||coalesce(new.brand,'')||' '||coalesce(new.active_ingredient,'')));
  new.updated_at := now();
  return new;
end $$;
create trigger products_search_trg before insert or update on public.products for each row execute function public.products_search_text();

grant select (id,name,slug,brand,kind,sale_class,is_generic,active_ingredient,concentration,presentation,anvisa_registry,ean,sku,price,promo_price,promo_start,promo_end,stock,min_stock,weight_g,width_cm,height_cm,length_cm,description,indications,usage,composition,warnings,leaflet_url,tags,status,featured,seo_title,seo_description,sold_count,is_sample,search_text,created_at,updated_at) on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "prod public read" on public.products for select to anon, authenticated using (status='ativo' or public.has_role(auth.uid(),'admin'));
create policy "prod admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null, alt text, sort_order int not null default 0
);
grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "img read" on public.product_images for select to anon, authenticated using (true);
create policy "img admin" on public.product_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);
grant select on public.product_categories to anon, authenticated;
grant insert, update, delete on public.product_categories to authenticated;
grant all on public.product_categories to service_role;
alter table public.product_categories enable row level security;
create policy "pc read" on public.product_categories for select to anon, authenticated using (true);
create policy "pc admin" on public.product_categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null, reason text, order_id uuid, created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.stock_movements to authenticated;
grant all on public.stock_movements to service_role;
alter table public.stock_movements enable row level security;
create policy "sm admin" on public.stock_movements for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique, updated_at timestamptz not null default now()
);
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1, unique(cart_id, product_id)
);
grant select, insert, update, delete on public.carts, public.cart_items to authenticated;
grant all on public.carts, public.cart_items to service_role;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
create policy "cart own" on public.carts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cart items own" on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

create type public.order_status as enum ('recebido','aguardando_pagamento','pagamento_aprovado','receita_validada','em_separacao','enviado','pronto_retirada','entregue','cancelado');
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigserial unique,
  user_id uuid, customer_name text not null, customer_email text not null, customer_cpf text, customer_phone text,
  delivery_method text not null default 'entrega', address jsonb,
  payment_method text not null, status order_status not null default 'aguardando_pagamento',
  subtotal numeric(10,2) not null default 0, discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0, total numeric(10,2) not null default 0,
  coupon_code text, needs_prescription boolean not null default false,
  notes text, created_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders own read" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "orders admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null, unit_price numeric(10,2) not null, quantity int not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "oi read" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status order_status not null, note text, changed_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.order_status_history to authenticated;
grant all on public.order_status_history to service_role;
alter table public.order_status_history enable row level security;
create policy "osh read" on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "osh admin insert" on public.order_status_history for insert to authenticated with check (public.has_role(auth.uid(),'admin'));

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, order_id uuid references public.orders(id) on delete cascade,
  file_path text not null, status text not null default 'pendente', reject_reason text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.prescriptions to authenticated;
grant all on public.prescriptions to service_role;
alter table public.prescriptions enable row level security;
create policy "rx own read" on public.prescriptions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "rx own insert" on public.prescriptions for insert to authenticated with check (user_id = auth.uid());
create policy "rx admin update" on public.prescriptions for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, kind text not null default 'percent', value numeric(10,2) not null,
  min_order numeric(10,2) not null default 0, starts_at timestamptz, ends_at timestamptz,
  usage_limit int, used_count int not null default 0, first_purchase_only boolean not null default false,
  active boolean not null default true, created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupon admin" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text, subtitle text, image_desktop text, image_mobile text, link text,
  sort_order int not null default 0, starts_at timestamptz, ends_at timestamptz,
  active boolean not null default true
);
grant select on public.banners to anon, authenticated;
grant insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "banner read" on public.banners for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "banner admin" on public.banners for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.showcases (
  id uuid primary key default gen_random_uuid(),
  title text not null, rule text not null default 'tag', rule_value text, product_ids uuid[] not null default '{}',
  sort_order int not null default 0, active boolean not null default true
);
grant select on public.showcases to anon, authenticated;
grant insert, update, delete on public.showcases to authenticated;
grant all on public.showcases to service_role;
alter table public.showcases enable row level security;
create policy "sc read" on public.showcases for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "sc admin" on public.showcases for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null, author_name text, rating int not null, comment text,
  approved boolean not null default false, created_at timestamptz not null default now()
);
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "rev read" on public.reviews for select to anon, authenticated using (approved or user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "rev insert" on public.reviews for insert to authenticated with check (user_id = auth.uid() and approved = false);
create policy "rev admin" on public.reviews for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "rev admin del" on public.reviews for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Drogaria Franco',
  whatsapp text, phone text, email text, hours text, pickup_address text,
  legal_name text, cnpj text, founded text, cnae text, address text,
  pharmacist text, crf text, afe text, sanitary_license text,
  free_shipping_min numeric(10,2) not null default 99,
  pickup_enabled boolean not null default true,
  pix_discount numeric(5,2) not null default 5,
  max_installments int not null default 3, min_installment numeric(10,2) not null default 20,
  pay_on_delivery boolean not null default true,
  low_stock_threshold int not null default 5,
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "settings read" on public.store_settings for select to anon, authenticated using (true);
create policy "settings admin" on public.store_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));
insert into public.store_settings(id, legal_name, cnpj, founded, cnae, address, pickup_address) values
 (1, 'G. M. Franco Drogaria', '04.574.777/0001-10', '28/06/2001', 'G-4771-7/01 Comércio varejista de produtos farmacêuticos, sem manipulação de fórmulas',
  'Avenida Brasil, 5 - Centro, Feira Nova do Maranhão - MA, 65.995-000', 'Avenida Brasil, 5 - Centro, Feira Nova do Maranhão - MA');

create table public.shipping_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null, cep_start text, cep_end text, price numeric(10,2) not null, days int not null default 2,
  active boolean not null default true
);
grant select on public.shipping_rules to anon, authenticated;
grant insert, update, delete on public.shipping_rules to authenticated;
grant all on public.shipping_rules to service_role;
alter table public.shipping_rules enable row level security;
create policy "ship read" on public.shipping_rules for select to anon, authenticated using (true);
create policy "ship admin" on public.shipping_rules for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  name text, email text not null unique, consent boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "nl insert" on public.newsletter_subscribers for insert to anon, authenticated with check (consent = true);
create policy "nl admin" on public.newsletter_subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "nl admin del" on public.newsletter_subscribers for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  email text not null, notified boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.stock_alerts to anon, authenticated;
grant select, update, delete on public.stock_alerts to authenticated;
grant all on public.stock_alerts to service_role;
alter table public.stock_alerts enable row level security;
create policy "sa insert" on public.stock_alerts for insert to anon, authenticated with check (email <> '');
create policy "sa admin" on public.stock_alerts for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.search_products(q text, lim int default 8)
returns setof public.products language sql stable set search_path = public, extensions as $$
  select p.* from public.products p
  where p.status = 'ativo' and (
    p.search_text like '%' || lower(extensions.unaccent(q)) || '%'
    or extensions.word_similarity(lower(extensions.unaccent(q)), p.search_text) > 0.35
  )
  order by extensions.word_similarity(lower(extensions.unaccent(q)), p.search_text) desc
  limit lim
$$;
grant execute on function public.search_products(text,int) to anon, authenticated;

create policy "pi public read" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy "pi admin write" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "pi admin update" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "pi admin delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "rx owner read" on storage.objects for select to authenticated using (bucket_id = 'prescriptions' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
create policy "rx owner write" on storage.objects for insert to authenticated with check (bucket_id = 'prescriptions' and (storage.foldername(name))[1] = auth.uid()::text);

insert into public.categories (name, slug, icon, sort_order) values
 ('Medicamentos','medicamentos','Pill',1),
 ('Dermocosméticos','dermocosmeticos','Sparkles',2),
 ('Higiene Pessoal','higiene-pessoal','Droplets',3),
 ('Beleza','beleza','Palette',4),
 ('Mamãe e Bebê','mamae-e-bebe','Baby',5),
 ('Saúde e Bem-estar','saude-e-bem-estar','HeartPulse',6);

insert into public.categories (parent_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.ord from public.categories c join (values
 ('medicamentos','Dor e Febre','dor-e-febre',1),('medicamentos','Gripe e Resfriado','gripe-e-resfriado',2),('medicamentos','Alergia','alergia',3),('medicamentos','Estômago e Intestino','estomago-e-intestino',4),('medicamentos','Vitaminas e Suplementos','vitaminas-e-suplementos',5),('medicamentos','Genéricos','genericos',6),
 ('dermocosmeticos','Protetor Solar','protetor-solar',1),('dermocosmeticos','Hidratantes','hidratantes',2),('dermocosmeticos','Anti-idade','anti-idade',3),('dermocosmeticos','Acne','acne',4),
 ('higiene-pessoal','Cabelo','cabelo',1),('higiene-pessoal','Desodorantes','desodorantes',2),('higiene-pessoal','Higiene Bucal','higiene-bucal',3),('higiene-pessoal','Sabonetes','sabonetes',4),
 ('beleza','Maquiagem','maquiagem',1),('beleza','Perfumaria','perfumaria',2),('beleza','Unhas','unhas',3),
 ('mamae-e-bebe','Fraldas','fraldas',1),('mamae-e-bebe','Lenços','lencos',2),('mamae-e-bebe','Mamadeiras','mamadeiras',3),('mamae-e-bebe','Cuidados com o bebê','cuidados-com-o-bebe',4),
 ('saude-e-bem-estar','Testes e medidores','testes-e-medidores',1),('saude-e-bem-estar','Primeiros socorros','primeiros-socorros',2),('saude-e-bem-estar','Ortopédicos','ortopedicos',3)
) as s(parent, name, slug, ord) on c.slug = s.parent;

insert into public.products (name, slug, brand, kind, sale_class, is_generic, active_ingredient, presentation, price, promo_price, stock, tags, status, featured, sold_count, is_sample, description, indications, usage) values
('Dipirona Monoidratada 500 mg 20 comprimidos (EXEMPLO)','dipirona-500mg-20-comprimidos','Genérico Exemplo','medicamento','livre',true,'Dipirona monoidratada','20 comprimidos',12.90,8.49,120,'{mais-vendido,oferta-da-semana}','ativo',true,340,true,'Produto de exemplo.','Dor e febre.','Conforme bula.'),
('Paracetamol 750 mg 20 comprimidos (EXEMPLO)','paracetamol-750mg-20-comprimidos','Genérico Exemplo','medicamento','livre',true,'Paracetamol','20 comprimidos',14.50,10.90,80,'{mais-vendido}','ativo',false,280,true,'Produto de exemplo.','Dor e febre.','Conforme bula.'),
('Ibuprofeno 400 mg 10 cápsulas (EXEMPLO)','ibuprofeno-400mg-10-capsulas','Marca Exemplo','medicamento','livre',false,'Ibuprofeno','10 cápsulas',19.90,null,60,'{}','ativo',false,150,true,'Produto de exemplo.','Dor, febre e inflamação.','Conforme bula.'),
('Antigripal Dia e Noite 16 comprimidos (EXEMPLO)','antigripal-dia-noite-16-comprimidos','Marca Exemplo','medicamento','livre',false,'Paracetamol + fenilefrina','16 comprimidos',24.90,19.90,40,'{oferta-da-semana}','ativo',true,120,true,'Produto de exemplo.','Sintomas de gripe.','Conforme bula.'),
('Loratadina 10 mg 12 comprimidos (EXEMPLO)','loratadina-10mg-12-comprimidos','Genérico Exemplo','medicamento','livre',true,'Loratadina','12 comprimidos',16.90,11.90,4,'{}','ativo',false,90,true,'Produto de exemplo.','Alergias.','Conforme bula.'),
('Omeprazol 20 mg 28 cápsulas (EXEMPLO)','omeprazol-20mg-28-capsulas','Genérico Exemplo','medicamento','livre',true,'Omeprazol','28 cápsulas',22.90,15.90,70,'{mais-vendido}','ativo',false,200,true,'Produto de exemplo.','Azia e gastrite.','Conforme bula.'),
('Amoxicilina 500 mg 21 cápsulas (EXEMPLO)','amoxicilina-500mg-21-capsulas','Genérico Exemplo','medicamento','receita',true,'Amoxicilina','21 cápsulas',29.90,24.90,30,'{}','ativo',false,60,true,'Produto de exemplo.','Infecções bacterianas.','Conforme prescrição.'),
('Vitamina C 1 g 10 comprimidos efervescentes (EXEMPLO)','vitamina-c-1g-10-efervescentes','Marca Exemplo','suplemento','livre',false,'Ácido ascórbico','10 comprimidos',18.90,13.90,90,'{oferta-da-semana}','ativo',true,170,true,'Produto de exemplo.','Suplementação de vitamina C.','1 comprimido ao dia.'),
('Clonazepam 2 mg 30 comprimidos (EXEMPLO)','clonazepam-2mg-30-comprimidos','Genérico Exemplo','medicamento','controlado',true,'Clonazepam','30 comprimidos',15.90,null,20,'{}','ativo',false,0,true,'Produto de exemplo.','Uso sob prescrição.','Conforme prescrição.'),
('Protetor Solar Facial FPS 50 50 g (EXEMPLO)','protetor-solar-facial-fps50-50g','Dermo Exemplo','dermocosmetico','livre',false,null,'50 g',79.90,59.90,35,'{dermo-destaque,oferta-da-semana}','ativo',true,110,true,'Produto de exemplo.','Proteção solar diária.','Aplicar antes da exposição ao sol.'),
('Protetor Solar Corporal FPS 50 200 ml (EXEMPLO)','protetor-solar-corporal-fps50-200ml','Dermo Exemplo','dermocosmetico','livre',false,null,'200 ml',69.90,null,50,'{dermo-destaque}','ativo',false,95,true,'Produto de exemplo.','Proteção solar.','Aplicar generosamente.'),
('Hidratante Corporal Pele Seca 400 ml (EXEMPLO)','hidratante-corporal-pele-seca-400ml','Dermo Exemplo','dermocosmetico','livre',false,null,'400 ml',49.90,39.90,45,'{dermo-destaque}','ativo',false,70,true,'Produto de exemplo.','Pele seca.','Aplicar após o banho.'),
('Sérum Anti-idade Vitamina C 30 ml (EXEMPLO)','serum-anti-idade-vitamina-c-30ml','Dermo Exemplo','dermocosmetico','livre',false,null,'30 ml',129.90,99.90,3,'{dermo-destaque,lancamento}','ativo',false,40,true,'Produto de exemplo.','Linhas finas.','Aplicar à noite.'),
('Gel de Limpeza Pele Oleosa 150 g (EXEMPLO)','gel-limpeza-pele-oleosa-150g','Dermo Exemplo','dermocosmetico','livre',false,null,'150 g',54.90,null,0,'{}','ativo',false,55,true,'Produto de exemplo.','Pele com acne.','Usar 2x ao dia.'),
('Shampoo Anticaspa 200 ml (EXEMPLO)','shampoo-anticaspa-200ml','Higiene Exemplo','higiene','livre',false,null,'200 ml',24.90,19.90,60,'{}','ativo',false,80,true,'Produto de exemplo.','Caspa.','Aplicar nos cabelos molhados.'),
('Desodorante Aerosol 48h 150 ml (EXEMPLO)','desodorante-aerosol-48h-150ml','Higiene Exemplo','higiene','livre',false,null,'150 ml',16.90,12.90,100,'{mais-vendido}','ativo',false,230,true,'Produto de exemplo.','Proteção 48h.','Aplicar nas axilas.'),
('Creme Dental Branqueador 90 g (EXEMPLO)','creme-dental-branqueador-90g','Higiene Exemplo','higiene','livre',false,null,'90 g',8.90,null,150,'{}','ativo',false,190,true,'Produto de exemplo.','Higiene bucal.','Escovar após as refeições.'),
('Sabonete Líquido Neutro 250 ml (EXEMPLO)','sabonete-liquido-neutro-250ml','Higiene Exemplo','higiene','livre',false,null,'250 ml',14.90,11.90,70,'{}','ativo',false,60,true,'Produto de exemplo.','Pele sensível.','Usar no banho.'),
('Base Líquida Matte 30 ml (EXEMPLO)','base-liquida-matte-30ml','Beleza Exemplo','beleza','livre',false,null,'30 ml',59.90,44.90,25,'{lancamento}','ativo',false,30,true,'Produto de exemplo.','Maquiagem.','Aplicar no rosto.'),
('Esmalte Cremoso Vermelho 8 ml (EXEMPLO)','esmalte-cremoso-vermelho-8ml','Beleza Exemplo','beleza','livre',false,null,'8 ml',7.90,null,80,'{}','ativo',false,45,true,'Produto de exemplo.','Unhas.','Aplicar 2 camadas.'),
('Fralda Infantil Tamanho G 30 unidades (EXEMPLO)','fralda-infantil-g-30-unidades','Bebê Exemplo','infantil','livre',false,null,'30 unidades',69.90,54.90,40,'{mais-vendido,oferta-da-semana}','ativo',true,260,true,'Produto de exemplo.','Bebês de 9 a 13 kg.','Trocar sempre que necessário.'),
('Lenços Umedecidos 100 unidades (EXEMPLO)','lencos-umedecidos-100-unidades','Bebê Exemplo','infantil','livre',false,null,'100 unidades',15.90,11.90,90,'{}','ativo',false,140,true,'Produto de exemplo.','Higiene do bebê.','Uso externo.'),
('Termômetro Digital (EXEMPLO)','termometro-digital','Saúde Exemplo','outros','livre',false,null,'1 unidade',29.90,24.90,30,'{}','ativo',false,50,true,'Produto de exemplo.','Medir temperatura.','Conforme manual.'),
('Curativo Adesivo 40 unidades (EXEMPLO)','curativo-adesivo-40-unidades','Saúde Exemplo','outros','livre',false,null,'40 unidades',12.90,null,110,'{}','ativo',false,75,true,'Produto de exemplo.','Pequenos cortes.','Aplicar sobre a pele limpa.');

insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p join (values
 ('dipirona-500mg-20-comprimidos','dor-e-febre'),('dipirona-500mg-20-comprimidos','genericos'),('dipirona-500mg-20-comprimidos','medicamentos'),
 ('paracetamol-750mg-20-comprimidos','dor-e-febre'),('paracetamol-750mg-20-comprimidos','genericos'),('paracetamol-750mg-20-comprimidos','medicamentos'),
 ('ibuprofeno-400mg-10-capsulas','dor-e-febre'),('ibuprofeno-400mg-10-capsulas','medicamentos'),
 ('antigripal-dia-noite-16-comprimidos','gripe-e-resfriado'),('antigripal-dia-noite-16-comprimidos','medicamentos'),
 ('loratadina-10mg-12-comprimidos','alergia'),('loratadina-10mg-12-comprimidos','genericos'),('loratadina-10mg-12-comprimidos','medicamentos'),
 ('omeprazol-20mg-28-capsulas','estomago-e-intestino'),('omeprazol-20mg-28-capsulas','genericos'),('omeprazol-20mg-28-capsulas','medicamentos'),
 ('amoxicilina-500mg-21-capsulas','genericos'),('amoxicilina-500mg-21-capsulas','medicamentos'),
 ('vitamina-c-1g-10-efervescentes','vitaminas-e-suplementos'),('vitamina-c-1g-10-efervescentes','medicamentos'),
 ('clonazepam-2mg-30-comprimidos','genericos'),('clonazepam-2mg-30-comprimidos','medicamentos'),
 ('protetor-solar-facial-fps50-50g','protetor-solar'),('protetor-solar-facial-fps50-50g','dermocosmeticos'),
 ('protetor-solar-corporal-fps50-200ml','protetor-solar'),('protetor-solar-corporal-fps50-200ml','dermocosmeticos'),
 ('hidratante-corporal-pele-seca-400ml','hidratantes'),('hidratante-corporal-pele-seca-400ml','dermocosmeticos'),
 ('serum-anti-idade-vitamina-c-30ml','anti-idade'),('serum-anti-idade-vitamina-c-30ml','dermocosmeticos'),
 ('gel-limpeza-pele-oleosa-150g','acne'),('gel-limpeza-pele-oleosa-150g','dermocosmeticos'),
 ('shampoo-anticaspa-200ml','cabelo'),('shampoo-anticaspa-200ml','higiene-pessoal'),
 ('desodorante-aerosol-48h-150ml','desodorantes'),('desodorante-aerosol-48h-150ml','higiene-pessoal'),
 ('creme-dental-branqueador-90g','higiene-bucal'),('creme-dental-branqueador-90g','higiene-pessoal'),
 ('sabonete-liquido-neutro-250ml','sabonetes'),('sabonete-liquido-neutro-250ml','higiene-pessoal'),
 ('base-liquida-matte-30ml','maquiagem'),('base-liquida-matte-30ml','beleza'),
 ('esmalte-cremoso-vermelho-8ml','unhas'),('esmalte-cremoso-vermelho-8ml','beleza'),
 ('fralda-infantil-g-30-unidades','fraldas'),('fralda-infantil-g-30-unidades','mamae-e-bebe'),
 ('lencos-umedecidos-100-unidades','lencos'),('lencos-umedecidos-100-unidades','mamae-e-bebe'),
 ('termometro-digital','testes-e-medidores'),('termometro-digital','saude-e-bem-estar'),
 ('curativo-adesivo-40-unidades','primeiros-socorros'),('curativo-adesivo-40-unidades','saude-e-bem-estar')
) as l(ps, cs) on p.slug = l.ps join public.categories c on c.slug = l.cs;

insert into public.product_images (product_id, url, alt, sort_order)
select id, case kind
  when 'medicamento' then '/images/sample-medicamento.jpg'
  when 'suplemento' then '/images/sample-medicamento.jpg'
  when 'dermocosmetico' then '/images/sample-dermo.jpg'
  when 'higiene' then '/images/sample-higiene.jpg'
  when 'beleza' then '/images/sample-beleza.jpg'
  when 'infantil' then '/images/sample-bebe.jpg'
  else '/images/sample-saude.jpg' end, name, 0
from public.products;

insert into public.banners (title, subtitle, image_desktop, image_mobile, link, sort_order) values
 ('Ofertas da semana','Até 35% off em medicamentos e dermocosméticos','/images/banner-ofertas.jpg','/images/banner-ofertas.jpg','/',1),
 ('Proteção solar todos os dias','Dermocosméticos selecionados com preço especial','/images/banner-dermo.jpg','/images/banner-dermo.jpg','/',2);

insert into public.showcases (title, rule, rule_value, sort_order) values
 ('Ofertas da semana','tag','oferta-da-semana',1),
 ('Mais vendidos','bestsellers',null,2),
 ('Genéricos com menor preço','generic',null,3),
 ('Dermocosméticos em destaque','tag','dermo-destaque',4);
