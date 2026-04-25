using System;

namespace RescueHub.Persistence.Entities.Scaffolded;

public partial class campaign_relief_point
{
    public Guid campaign_id { get; set; }

    public Guid relief_point_id { get; set; }

    public DateTime created_at { get; set; }

    public virtual relief_campaign campaign { get; set; } = null!;

    public virtual relief_point relief_point { get; set; } = null!;
}
