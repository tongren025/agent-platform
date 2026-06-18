using NetMicro.Agent.App.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Agent Service", Version = "v1" });
});
builder.Services.AddHttpClient();
builder.Services.AddAgentServices(builder.Configuration);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseStaticFiles();
app.MapGet("/healthcheck", () => "ok");
app.MapControllers();

var port = builder.Configuration["Port"] ?? "5311";
app.Urls.Add($"http://localhost:{port}");

app.Run();
