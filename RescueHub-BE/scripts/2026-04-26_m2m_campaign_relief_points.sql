BEGIN;

CREATE TABLE IF NOT EXISTS campaign_relief_points (
    campaign_id UUID NOT NULL REFERENCES relief_campaign(id) ON DELETE CASCADE,
    relief_point_id UUID NOT NULL REFERENCES relief_point(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (campaign_id, relief_point_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_relief_points_campaign_id
    ON campaign_relief_points (campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_relief_points_relief_point_id
    ON campaign_relief_points (relief_point_id);

INSERT INTO campaign_relief_points (campaign_id, relief_point_id, created_at)
SELECT rp.campaign_id, rp.id, now()
FROM relief_point rp
WHERE rp.campaign_id IS NOT NULL
ON CONFLICT (campaign_id, relief_point_id) DO NOTHING;

ALTER TABLE relief_point
    DROP CONSTRAINT IF EXISTS relief_point_campaign_id_fkey;

ALTER TABLE relief_point
    DROP COLUMN IF EXISTS campaign_id;

COMMIT;
