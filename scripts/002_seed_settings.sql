-- Insert default site settings if not exists
INSERT INTO site_settings (id, name, description)
VALUES ('global', 'LinkHub', 'Your personal link collection')
ON CONFLICT (id) DO NOTHING;
