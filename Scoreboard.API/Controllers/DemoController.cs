using Microsoft.AspNetCore.Mvc;
using Scoreboard.Shared;
using Scoreboard.Shared.Model;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;

namespace Scoreboard.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DemoController : ControllerBase
    {
        private readonly IDemoContext demoContext;

        public DemoController(IDemoContext demoContext)
        {
            this.demoContext = demoContext;
        }

        [HttpGet(Name = "GetDemoFamily")]
        public async Task<IEnumerable<Family>> GetDemoFamily()
        {
            var setIterator = this.demoContext.GetContainer()
                .GetItemQueryIterator<Family>("select * from c where c.lastName = 'Andersen'");

            List<Family> families = new();

            while (setIterator.HasMoreResults)
            {
                FeedResponse<Family> currentResultSet = await setIterator.ReadNextAsync();
                foreach (Family family in currentResultSet)
                {
                    families.Add(family);
                }
            }

            return families;
        }
    }
}
