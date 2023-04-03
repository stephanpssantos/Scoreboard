using Microsoft.Azure.Cosmos;
using Scoreboard.Shared;

namespace Scoreboard.API
{
    public class DbInitializer : IHostedService
    {
        private readonly IServiceProvider serviceProvider;
        private readonly IWebHostEnvironment webHostEnvironment;

        public DbInitializer(IServiceProvider serviceProvider, IWebHostEnvironment webHostEnvironment)
        {
            this.serviceProvider = serviceProvider;
            this.webHostEnvironment = webHostEnvironment;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var dbContext = this.serviceProvider.GetRequiredService<IScoreboardContext>();
            if (webHostEnvironment.IsProduction())
            {
                await dbContext.InitializeDatabase();
            }
            else
            {
                var dbDev = new DbDev(dbContext);
                await dbDev.Clear();
                await dbDev.Seed();
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
