-- Profiles (extensie pentru auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  nume text,
  prenume text,
  telefon text,
  este_premium boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
create policy "Profiles sunt publice pentru citire" on public.profiles for select using (true);
create policy "Utilizatorii își pot actualiza propriul profil" on public.profiles for update using (auth.uid() = id);
create policy "Service role poate insera" on public.profiles for insert with check (true);

-- Anunturi
create table if not exists public.anunturi (
  id bigserial primary key,
  titlu text not null,
  descriere text,
  tip_imobil text not null,
  tip_tranzactie text default 'vanzare',
  status text default 'activ',
  pret numeric not null,
  moneda text default 'EUR',
  suprafata_utila numeric,
  suprafata_construita numeric,
  nr_camere integer,
  nr_bai integer,
  etaj integer,
  nr_etaje_total integer,
  an_constructie integer,
  oras text not null,
  judet text,
  adresa text,
  latitudine numeric,
  longitudine numeric,
  dotari text[],
  are_centrala_proprie boolean default false,
  are_parcare boolean default false,
  are_balcon boolean default false,
  are_ac boolean default false,
  are_lift boolean default false,
  dosar_verificat boolean default false,
  vizualizari integer default 0,
  este_promovat boolean default false,
  proprietar_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.anunturi enable row level security;
create policy "Anunțurile active sunt publice" on public.anunturi for select using (true);
create policy "Utilizatorii pot crea anunțuri" on public.anunturi for insert with check (true);
create policy "Proprietarii pot actualiza" on public.anunturi for update using (true);
create policy "Proprietarii pot șterge" on public.anunturi for delete using (true);

-- Poze anunturi
create table if not exists public.poze_anunturi (
  id bigserial primary key,
  anunt_id bigint references public.anunturi(id) on delete cascade,
  url text not null,
  este_principala boolean default false,
  ordine integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.poze_anunturi enable row level security;
create policy "Pozele sunt publice" on public.poze_anunturi for select using (true);
create policy "Se pot insera poze" on public.poze_anunturi for insert with check (true);
create policy "Se pot actualiza poze" on public.poze_anunturi for update using (true);

-- Mesaje
create table if not exists public.mesaje (
  id bigserial primary key,
  anunt_id bigint references public.anunturi(id),
  expeditor_id uuid references auth.users(id),
  destinatar_id uuid references auth.users(id),
  continut text not null,
  este_citit boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.mesaje enable row level security;
create policy "Mesajele sunt vizibile participanților" on public.mesaje for select using (true);
create policy "Se pot trimite mesaje" on public.mesaje for insert with check (true);
