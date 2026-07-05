-- Fix submitter_nic format constraints to allow 9 digits + 'V' (uppercase) or 12 digits
-- and to be robust against CHAR(12) padding by trimming spaces and uppercasing before regex.

begin;

-- Regular teams submissions
alter table if exists round_submissions
  drop constraint if exists chk_submitter_nic_format;

alter table if exists round_submissions
  add constraint chk_submitter_nic_format
  check (
    regexp_replace(upper(submitter_nic), '\\s+', '', 'g') ~ '^(\\d{9}V|\\d{12})$'
  ) not valid;

-- USJ BIS submissions
alter table if exists usj_bis_round_submissions
  drop constraint if exists chk_bis_submitter_nic_format;

alter table if exists usj_bis_round_submissions
  add constraint chk_bis_submitter_nic_format
  check (
    regexp_replace(upper(submitter_nic), '\\s+', '', 'g') ~ '^(\\d{9}V|\\d{12})$'
  ) not valid;

-- Normalize any existing data to satisfy constraints
update round_submissions
set submitter_nic = regexp_replace(upper(submitter_nic), '\\s+', '', 'g')
where submitter_nic is not null
  and submitter_nic <> regexp_replace(upper(submitter_nic), '\\s+', '', 'g');

update usj_bis_round_submissions
set submitter_nic = regexp_replace(upper(submitter_nic), '\\s+', '', 'g')
where submitter_nic is not null
  and submitter_nic <> regexp_replace(upper(submitter_nic), '\\s+', '', 'g');

-- Any rows still invalid after normalization → set to NULL to satisfy constraint
update round_submissions
set submitter_nic = null
where submitter_nic is not null
  and not (
    regexp_replace(upper(submitter_nic), '\\s+', '', 'g') ~ '^(\\d{9}V|\\d{12})$'
  );

update usj_bis_round_submissions
set submitter_nic = null
where submitter_nic is not null
  and not (
    regexp_replace(upper(submitter_nic), '\\s+', '', 'g') ~ '^(\\d{9}V|\\d{12})$'
  );

-- Now validate the constraints
alter table if exists round_submissions
  validate constraint chk_submitter_nic_format;

alter table if exists usj_bis_round_submissions
  validate constraint chk_bis_submitter_nic_format;

commit;


