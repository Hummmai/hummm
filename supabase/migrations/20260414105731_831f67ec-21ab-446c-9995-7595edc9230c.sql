insert into storage.buckets (id, name, public)
values ('property-documents', 'property-documents', false);

create policy "Users can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'property-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own documents"
  on storage.objects for select
  using (
    bucket_id = 'property-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own documents"
  on storage.objects for delete
  using (
    bucket_id = 'property-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );