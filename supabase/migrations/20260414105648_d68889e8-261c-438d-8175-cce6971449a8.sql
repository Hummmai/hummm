create table public.property_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  property_id uuid references public.landlord_properties(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  document_type text not null default 'Other',
  uploaded_at timestamptz not null default now()
);

alter table public.property_documents enable row level security;

create policy "Users can view own documents"
  on public.property_documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.property_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.property_documents for delete
  using (auth.uid() = user_id);