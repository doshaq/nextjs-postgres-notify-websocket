-- example table
create or replace table reservations (
id int primary key,
value var(500));

-- trigger function
-- https://www.postgresql.org/docs/current/sql-notify.html
create
or replace function fn_reservation_inserted() returns trigger as $psql$
begin
  perform pg_notify(
    'reservation_insert_event',
    'refresh'
  );return new;
end;$psql$ language plpgsql;

-- hook the trigger function to a trigger 'after insert'
-- https://www.postgresql.org/docs/current/sql-createtrigger.html
create trigger reservation_insert after
insert
  on reservations for each row execute procedure fn_reservation_inserted();
  