-- Create a table for transactions
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  description text not null,
  category text not null,
  payment_method text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense'))
);

-- Enable Row Level Security (RLS)
alter table transactions enable row level security;

-- Create policies to ensure users only see their own data
create policy "Users can create their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);
