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


-- =========================
-- INVITATION DISCOUNT TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION apply_discount_on_paid_subscription()
RETURNS TRIGGER AS $$
DECLARE
    v_inviter INT;
BEGIN
    -- Only when a paid subscription becomes active
    IF NEW.is_trial = FALSE AND (OLD.is_trial = TRUE OR OLD.is_trial IS NULL) THEN

        -- Check if this account was invited
        SELECT inviter_account_id
        INTO v_inviter
        FROM invitation
        WHERE invitee_account_id = NEW.account_id
          AND status = 'ACCEPTED'
          AND discount_expiry_date IS NULL;

        IF v_inviter IS NOT NULL THEN

            -- Discount for invitee
            INSERT INTO discount (account_id, source, percentage, valid_from, valid_until)
            VALUES (
                NEW.account_id,
                'INVITATION',
                20,
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '1 month'
            )
            ON CONFLICT DO NOTHING;

            -- Discount for inviter
            INSERT INTO discount (account_id, source, percentage, valid_from, valid_until)
            VALUES (
                v_inviter,
                'INVITATION',
                20,
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '1 month'
            )
            ON CONFLICT DO NOTHING;

            -- Mark invitation as completed
            UPDATE invitation
            SET
              discount_expiry_date = CURRENT_DATE + INTERVAL '1 month',
              status = 'COMPLETED'
            WHERE invitee_account_id = NEW.account_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apply_discount_on_paid_subscription
AFTER UPDATE OF is_trial
ON account_subscription
FOR EACH ROW
EXECUTE FUNCTION apply_discount_on_paid_subscription();

-- =========================
-- EXPIRED DISCOUNT TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION deactivate_expired_discounts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.active = TRUE AND NEW.valid_until < CURRENT_DATE THEN
        NEW.active := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deactivate_expired_discounts
BEFORE UPDATE OF active
ON discount
FOR EACH ROW
EXECUTE FUNCTION deactivate_expired_discounts();
