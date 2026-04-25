alter table providers add column if not exists latitude numeric;
alter table providers add column if not exists longitude numeric;
alter table providers add column if not exists is_available boolean default true;
