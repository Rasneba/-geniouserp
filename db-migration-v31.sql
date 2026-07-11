-- AddisPay payment gateway integration
-- Add 'addispay' to payment_method CHECK constraints

-- 1. parking_payments
ALTER TABLE parking_payments DROP CONSTRAINT IF EXISTS parking_payments_payment_method_check;
ALTER TABLE parking_payments ADD CONSTRAINT parking_payments_payment_method_check
  CHECK (payment_method IN ('cash','telebirr','cbebirr','chapa','addispay','santimpay','bank','pos','credit_card','debit_card'));

-- 2. parking_subscriptions
ALTER TABLE parking_subscriptions DROP CONSTRAINT IF EXISTS parking_subscriptions_payment_method_check;
ALTER TABLE parking_subscriptions ADD CONSTRAINT parking_subscriptions_payment_method_check
  CHECK (payment_method IN ('cash','telebirr','cbebirr','chapa','addispay','santimpay','bank','pos','credit_card','debit_card'));
