-- Trigger: Create discount when invitation is accepted
CREATE OR REPLACE FUNCTION create_discount_on_invitation_accept()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter INT;
BEGIN
  IF NEW.status = 'ACCEPTED' AND OLD.status <> 'ACCEPTED' THEN
    v_inviter := NEW.inviter_account_id;

    INSERT INTO discount (account_id, source, percentage, valid_from, valid_until)
    VALUES (
      NEW.invitee_account_id,
      'INVITATION',
      20,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 month'
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO discount (account_id, source, percentage, valid_from, valid_until)
    VALUES (
      v_inviter,
      'INVITATION',
      20,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 month'
    )
    ON CONFLICT DO NOTHING;

    UPDATE invitation
    SET discount_expiry_date = CURRENT_DATE + INTERVAL '1 month'
    WHERE invitation_id = NEW.invitation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_discount_on_invitation_accept ON invitation;

CREATE TRIGGER trg_create_discount_on_invitation_accept
AFTER UPDATE OF status
ON invitation
FOR EACH ROW
EXECUTE FUNCTION create_discount_on_invitation_accept();
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

DROP TRIGGER IF EXISTS trg_remove_watchlist_on_complete ON viewing_session;

CREATE TRIGGER trg_remove_watchlist_on_complete
AFTER INSERT OR UPDATE OF completed
ON viewing_session
FOR EACH ROW
EXECUTE FUNCTION remove_from_watchlist_on_complete();


CREATE OR REPLACE FUNCTION block_account_after_failed_logins()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.failed_login_attempts >= 3 THEN
    NEW.status := 'BLOCKED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_account_after_failed_logins ON account;

CREATE TRIGGER trg_block_account_after_failed_logins
BEFORE UPDATE OF failed_login_attempts
ON account
FOR EACH ROW
EXECUTE FUNCTION block_account_after_failed_logins();


CREATE OR REPLACE FUNCTION apply_discount_on_paid_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter INT;
BEGIN
  SELECT inviter_account_id
  INTO v_inviter
  FROM invitation
  WHERE invitee_account_id = NEW.account_id
    AND status = 'ACCEPTED'
    AND discount_expiry_date IS NULL
  LIMIT 1;

  IF v_inviter IS NOT NULL THEN
    INSERT INTO discount (account_id, source, percentage, valid_from, valid_until)
    VALUES (
      NEW.account_id,
      'INVITATION',
      20,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 month'
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO discount (account_id, source, percentage, valid_from, valid_until)
    VALUES (
      v_inviter,
      'INVITATION',
      20,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 month'
    )
    ON CONFLICT DO NOTHING;

    UPDATE invitation
    SET
      discount_expiry_date = CURRENT_DATE + INTERVAL '1 month',
      status = 'COMPLETED'
    WHERE invitee_account_id = NEW.account_id
      AND status = 'ACCEPTED'
      AND discount_expiry_date IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_apply_discount_on_paid_subscription ON account_subscription;

CREATE TRIGGER trg_apply_discount_on_paid_subscription
AFTER INSERT
ON account_subscription
FOR EACH ROW
EXECUTE FUNCTION apply_discount_on_paid_subscription();


CREATE OR REPLACE FUNCTION deactivate_expired_discounts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active = TRUE AND NEW.valid_until < CURRENT_DATE THEN
    NEW.active := FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deactivate_expired_discounts ON discount;

CREATE TRIGGER trg_deactivate_expired_discounts
BEFORE UPDATE OF active
ON discount
FOR EACH ROW
EXECUTE FUNCTION deactivate_expired_discounts();
