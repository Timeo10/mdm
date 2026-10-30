CREATE SEQUENCE IF NOT EXISTS tiers_code_tiers_mdm_seq;

ALTER TABLE tiers
  ADD COLUMN IF NOT EXISTS code_tiers_mdm VARCHAR(50);

WITH numbered_tiers AS (
  SELECT
    uuid,
    ROW_NUMBER() OVER (ORDER BY date_creation, uuid) AS rn
  FROM tiers
  WHERE code_tiers_mdm IS NULL
)
UPDATE tiers t
SET code_tiers_mdm = 'MDM' || numbered_tiers.rn
FROM numbered_tiers
WHERE t.uuid = numbered_tiers.uuid;

WITH current_max AS (
  SELECT COALESCE(MAX(CAST(SUBSTRING(code_tiers_mdm FROM 4) AS integer)), 0) AS max_value
  FROM tiers
  WHERE code_tiers_mdm ~ '^MDM[0-9]+$'
)
SELECT setval(
  'tiers_code_tiers_mdm_seq',
  GREATEST(max_value, 1),
  max_value > 0
)
FROM current_max;

ALTER TABLE tiers
  ALTER COLUMN code_tiers_mdm SET DEFAULT 'MDM' || nextval('tiers_code_tiers_mdm_seq');

CREATE UNIQUE INDEX IF NOT EXISTS idx_tiers_code_tiers_mdm
  ON tiers(code_tiers_mdm)
  WHERE code_tiers_mdm IS NOT NULL;
