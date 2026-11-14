-- Remove the kiln-opening signup feature. Drops stored signup emails (irreversible).
drop table if exists kiln_signups cascade;
