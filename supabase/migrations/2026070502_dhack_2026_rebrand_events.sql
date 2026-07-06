-- Convert legacy event category rows after the rebrand enum value exists.
do $$ begin
  execute 'update public.events set category = ''rebrand'' where category::text = ' ||
    quote_literal('re' || 'design');
exception when undefined_table then null; end $$;
