
DROP POLICY "Users can create enquiries" ON public.enquiries;
DROP POLICY "Anon can create enquiries" ON public.enquiries;

CREATE POLICY "Authenticated users can create enquiries" ON public.enquiries 
FOR INSERT TO authenticated 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Anonymous users can create enquiries" ON public.enquiries 
FOR INSERT TO anon 
WITH CHECK (user_id IS NULL);
