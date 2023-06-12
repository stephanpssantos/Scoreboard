using Microsoft.AspNetCore.HttpLogging;
using Scoreboard.Shared;

namespace Scoreboard.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            string endpointURI;
            string primaryKey;

            if (builder.Environment.IsProduction())
            {
                endpointURI = builder.Configuration.GetSection("Cosmos")["EndpointUri"]!;
                primaryKey = builder.Configuration["Cosmos_PrimaryKey"]!;
            }
            else
            {
                endpointURI = builder.Configuration.GetSection("Cosmos")["DevEndpointUri"]!;
                primaryKey = builder.Configuration["Cosmos_DevPrimaryKey"]!;
            }
            
            builder.Services.AddSingleton<IScoreboardContext>(s => new ScoreboardContext(endpointURI, primaryKey));
            builder.Services.AddHostedService<DbInitializer>();
            builder.Services.AddControllers();

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins(builder.Configuration["ClientAddress"]!)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseCors();
            }

            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}