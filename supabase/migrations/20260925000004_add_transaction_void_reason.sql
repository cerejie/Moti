-- Phase 10, part 1: the stock_in reason written when a transaction is voided.
-- Its own migration: Postgres cannot use a new enum value in the transaction that adds it.

alter type app.movement_reason add value if not exists 'transaction_void';
