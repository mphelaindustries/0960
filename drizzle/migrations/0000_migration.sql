-- Roles
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  postal text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "Update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- New user: profile + role (first ever user becomes the store owner)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''));
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'customer');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  tagline text not null default '',
  description text not null default '',
  front_image text not null default '',
  back_image text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Anyone sees active products" on public.products for select to anon, authenticated
  using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admin insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admin update products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admin delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.product_stock (
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  quantity int not null default 0 check (quantity >= 0),
  primary key (product_id, size)
);
grant select on public.product_stock to anon;
grant select, insert, update, delete on public.product_stock to authenticated;
grant all on public.product_stock to service_role;
alter table public.product_stock enable row level security;
create policy "Anyone reads stock" on public.product_stock for select to anon, authenticated using (true);
create policy "Admin insert stock" on public.product_stock for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admin update stock" on public.product_stock for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admin delete stock" on public.product_stock for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Settings
create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'ELIM 0960',
  whatsapp_number text not null default '27000000000',
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  contact_email text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon;
grant select, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "Anyone reads settings" on public.store_settings for select to anon, authenticated using (true);
create policy "Admin updates settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001) unique,
  user_id uuid,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  postal text not null,
  notes text not null default '',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'new' check (status in ('new','paid','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Own or admin reads orders" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admin updates orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "Own or admin reads items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))));

-- Place order: prices & stock checked on the server side
create or replace function public.place_order(p_items jsonb, p_customer jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  it jsonb; prod public.products; stock_qty int; q int; sz text;
  v_sub numeric := 0; v_fee numeric; v_order public.orders;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty'; end if;
  if length(trim(coalesce(p_customer->>'name',''))) < 2 then raise exception 'Name is required'; end if;
  if length(trim(coalesce(p_customer->>'phone',''))) < 9 then raise exception 'Phone is required'; end if;
  if length(trim(coalesce(p_customer->>'address',''))) < 5 then raise exception 'Address is required'; end if;

  for it in select * from jsonb_array_elements(p_items) loop
    q := (it->>'qty')::int; sz := it->>'size';
    if q is null or q < 1 or q > 20 then raise exception 'Invalid quantity'; end if;
    select * into prod from public.products where slug = it->>'slug' and active;
    if not found then raise exception 'A product in your cart is no longer available'; end if;
    select quantity into stock_qty from public.product_stock where product_id = prod.id and size = sz for update;
    if stock_qty is null or stock_qty < q then
      raise exception '% size % only has % left', prod.name, sz, coalesce(stock_qty, 0);
    end if;
    v_sub := v_sub + prod.price * q;
  end loop;

  select delivery_fee into v_fee from public.store_settings where id = 1;
  v_fee := coalesce(v_fee, 0);

  insert into public.orders (user_id, customer_name, phone, email, address, city, postal, notes, subtotal, delivery_fee, total)
  values (auth.uid(), trim(p_customer->>'name'), trim(p_customer->>'phone'), nullif(trim(coalesce(p_customer->>'email','')), ''),
    trim(p_customer->>'address'), trim(coalesce(p_customer->>'city','')), trim(coalesce(p_customer->>'postal','')),
    left(trim(coalesce(p_customer->>'notes','')), 300), v_sub, v_fee, v_sub + v_fee)
  returning * into v_order;

  for it in select * from jsonb_array_elements(p_items) loop
    q := (it->>'qty')::int; sz := it->>'size';
    select * into prod from public.products where slug = it->>'slug';
    update public.product_stock set quantity = quantity - q where product_id = prod.id and size = sz;
    insert into public.order_items (order_id, product_id, product_name, size, quantity, unit_price, line_total)
    values (v_order.id, prod.id, prod.name, sz, q, prod.price, prod.price * q);
  end loop;

  return jsonb_build_object('id', v_order.id, 'order_number', v_order.order_number, 'total', v_order.total);
end $$;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;

-- Receipt lookup by private order id (for the confirmation page, incl. guests)
create or replace function public.get_order_receipt(p_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'order', to_jsonb(o),
    'items', coalesce((select jsonb_agg(to_jsonb(i)) from public.order_items i where i.order_id = o.id), '[]'::jsonb)
  ) from public.orders o where o.id = p_id
$$;
grant execute on function public.get_order_receipt(uuid) to anon, authenticated;

-- Return stock when an order is cancelled
create or replace function public.restock_on_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.product_stock s set quantity = s.quantity + i.quantity
    from public.order_items i where i.order_id = new.id and s.product_id = i.product_id and s.size = i.size;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    update public.product_stock s set quantity = greatest(0, s.quantity - i.quantity)
    from public.order_items i where i.order_id = new.id and s.product_id = i.product_id and s.size = i.size;
  end if;
  return new;
end $$;
create trigger orders_restock after update of status on public.orders
  for each row execute function public.restock_on_cancel();

-- Storage policies for product photos
create policy "Public reads product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admin uploads product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admin updates product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admin deletes product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

-- Seed
insert into public.store_settings (id) values (1);
insert into public.products (slug, name, price, tagline, description, front_image, back_image)
values ('elim-map-graphic-tee', 'Elim Map Graphic Tee', 350, 'Black · Front & Back Print',
  'Mountain-inspired 0960 ELIM graphic on the front. A detailed map of Mpheni, Waterval, Shirley, Magangeni, Mbhokota and surrounds on the back. Wear your story.',
  '/__l5e/assets-v1/6ce4913f-518d-4d6d-a868-caef44f2c94e/tee-front.jpg',
  '/__l5e/assets-v1/1e14427c-49d3-4bf1-a80c-4e1d1909f71d/tee-back.jpg');
insert into public.product_stock (product_id, size, quantity)
select id, s, 10 from public.products, unnest(array['S','M','L','XL','XXL']) s where slug = 'elim-map-graphic-tee';