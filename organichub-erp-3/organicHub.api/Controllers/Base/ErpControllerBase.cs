using Microsoft.AspNetCore.Mvc;

namespace OrganicHub.Api.Controllers.Base
{
    // 🔓 TEMPORARY: Remove Authorize until login implemented
    [ApiController]
    public abstract class ErpControllerBase : ControllerBase
    {
        protected string CurrentUsername =>
            User.Identity?.Name ?? "System";

        protected string CurrentUserId =>
            User.FindFirst("UserId")?.Value ?? "";
    }
}