ALTER TABLE users ADD COLUMN public_id UUID;
UPDATE users SET public_id = gen_random_uuid() WHERE public_id IS NULL;
ALTER TABLE users ALTER COLUMN public_id SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_public_id_key UNIQUE (public_id);
