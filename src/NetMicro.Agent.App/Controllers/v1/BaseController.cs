using Microsoft.AspNetCore.Mvc;

namespace NetMicro.Agent.App.Controllers.v1
{
    [ApiController]
    [Route("/api/v1/agentapp/[controller]/[action]")]
    public class BaseController : ControllerBase
    {
    }
}
