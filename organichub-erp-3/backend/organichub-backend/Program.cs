var builder = WebApplication.CreateBuilder(args);

// --------------------
// Services
// --------------------

// Enable Controllers
builder.Services.AddControllers();

// Enable CORS for Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

// --------------------
// Middleware
// --------------------

// Use CORS BEFORE mapping controllers
app.UseCors("AllowAngular");

// Map Controllers
app.MapControllers();

app.Run();
