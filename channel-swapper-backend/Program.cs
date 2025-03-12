using channel_swapper_backend.Services;
using channel_swapper_backend.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Get allowed origins from environment variable or use default for development
var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(",") 
    ?? new[] { "http://localhost:3000" };

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR
builder.Services.AddSignalR();

// Add TvShowService as Singleton
builder.Services.AddSingleton<TvShowService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins(allowedOrigins)
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TvShowHub>("/tvShowHub");

app.Urls.Add("http://localhost:5000");

app.Run();
