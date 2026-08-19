-- Operators may permanently delete their own listings (vehicles,
-- verifications and products cascade with the parent row).
create policy "Taxi providers can delete own driver profile"
  on public.local_taxi_drivers for delete
  using (auth.uid() = user_id);

create policy "Sellers can delete own seller profile"
  on public.marketplace_sellers for delete
  using (auth.uid() = user_id);
