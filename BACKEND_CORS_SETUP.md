# Backend CORS Setup Required

## Problem
Your Angular app at `http://localhost:63945` cannot connect to the backend at `https://localhost:7196/api/Orders` due to CORS restrictions.

## Solution: Enable CORS in your .NET Backend

### For .NET 6+ (Program.cs):

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:63945",
            "http://localhost:4200",
            "http://localhost:5003"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Enable CORS (MUST be before UseAuthorization)
app.UseCors("AllowAngularApp");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### For .NET 5 or older (Startup.cs):

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    
    services.AddCors(options =>
    {
        options.AddPolicy("AllowAngularApp", policy =>
        {
            policy.WithOrigins(
                "http://localhost:63945",
                "http://localhost:4200",
                "http://localhost:5003"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseRouting();
    
    // Enable CORS (MUST be after UseRouting, before UseAuthorization)
    app.UseCors("AllowAngularApp");
    
    app.UseAuthorization();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

## Expected API Request Format

Your Angular app sends orders in this format:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "cakes": [
    {
      "cakeName": "Chocolate Cake",
      "price": 1110
    },
    {
      "cakeName": "Vanilla Cake",
      "price": 950
    }
  ]
}
```

## Backend Controller Example

```csharp
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpPost]
    public IActionResult CreateOrder([FromBody] OrderRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Process order...
        
        return Ok(new { message = "Order created successfully" });
    }
}

public class OrderRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public List<CakeItem> Cakes { get; set; }
}

public class CakeItem
{
    public string CakeName { get; set; }
    public decimal Price { get; set; }
}
```

## Testing Checklist

1. ✅ Backend server is running at `https://localhost:7196`
2. ✅ CORS policy is configured
3. ✅ CORS middleware is enabled **before** UseAuthorization
4. ✅ SSL certificate is trusted (or use `http://` for local dev)
5. ✅ Controller accepts the exact JSON format shown above
6. ✅ Test with Postman or browser console first
