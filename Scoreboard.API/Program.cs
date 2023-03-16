using Scoreboard.Shared;

namespace Scoreboard.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            string endpointURI = builder.Configuration.GetSection("Cosmos")["EndpointUri"]!;
            string primaryKey = builder.Configuration["Cosmos:PrimaryKey"]!;
            builder.Services.AddSingleton<IDemoContext>(s => new DemoContext(endpointURI, primaryKey));
            builder.Services.AddHostedService<DbInitializer>();
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}