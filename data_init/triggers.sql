-- =========================
-- WATCHLIST CLEANUP TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION remove_from_watchlist_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE THEN
    DELETE FROM watchlist_item
    WHERE profile_id = NEW.profile_id
      AND content_id = NEW.content_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_watchlist_on_complete
AFTER INSERT OR UPDATE OF completed
ON viewing_session
FOR EACH ROW
EXECUTE FUNCTION remove_from_watchlist_on_complete();


-- =========================
-- ACCOUNT BLOCKING TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION block_account_after_failed_logins()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.failed_login_attempts >= 3 THEN
    NEW.status := 'BLOCKED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_account_after_failed_logins
BEFORE UPDATE OF failed_login_attempts
ON account
FOR EACH ROW
EXECUTE FUNCTION block_account_after_failed_logins();
