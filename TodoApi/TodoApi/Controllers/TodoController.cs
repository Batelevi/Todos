using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TodoApi.Models;

[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private readonly string connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=TodoDb;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False";
    public TodoController() { }

    #region Todo
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Todo>>> GetTodos()
    {
        try
        {
            var todos = new List<Todo>();

            using (var conn = new SqlConnection(connectionString))
            {
                var query = "SELECT * FROM Todos";

                await conn.OpenAsync();

                using (var command = new SqlCommand(query, conn))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            todos.Add(new Todo
                            {
                                Id = reader.GetInt32(0),
                                Title = reader.GetString(1),
                                Description = reader.GetString(2),
                                Status = reader.GetString(3),
                                AssignedUser = reader.GetString(4),
                                CreatedAt = reader.GetString(5)
                            }); ;
                        }
                    }
                }
            }

            return Ok(todos);
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"SQL error: {ex.Message}");
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Todo>> GetTodoById(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid ID");
        }

        try
        {
            using (var connection = new SqlConnection(connectionString))
            {
                var query = "SELECT * FROM Todos WHERE Id = @Id";

                await connection.OpenAsync();

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var todo = new Todo
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Title = reader.GetString(reader.GetOrdinal("Title")),
                                Description = reader.GetString(reader.GetOrdinal("Description")),
                                Status = reader.GetString(reader.GetOrdinal("Status")),
                                AssignedUser = reader.GetString(reader.GetOrdinal("AssignedUser")),
                                CreatedAt = reader.GetString(reader.GetOrdinal("CreatedAt"))
                            };

                            return Ok(todo);
                        }
                        else
                        {
                            return NotFound($"Todo with ID {id} not found.");
                        }
                    }
                }
            }
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"SQL error: {ex.Message}");
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Todo>> CreateTodo(Todo todo)
    {
        if (todo == null)
        {
            return BadRequest("Invalid Todo");
        }

        try
        {
            using (var conn = new SqlConnection(connectionString))
            {
                todo.CreatedAt = DateTime.UtcNow.ToString();

                var query = "INSERT INTO Todos (Title, Description, Status, AssignedUser, CreatedAt) " +
                               "OUTPUT INSERTED.Id " +
                               "VALUES (@Title, @Description, @Status, @AssignedUser, @CreatedAt)";

                using (var command = new SqlCommand(query, conn))
                {
                    command.Parameters.AddWithValue("@Title", todo.Title);
                    command.Parameters.AddWithValue("@Description", todo.Description);
                    command.Parameters.AddWithValue("@Status", todo.Status);
                    command.Parameters.AddWithValue("@AssignedUser", todo.AssignedUser);
                    command.Parameters.AddWithValue("@CreatedAt", todo.CreatedAt);

                    await conn.OpenAsync();
                    todo.Id = (int)await command.ExecuteScalarAsync();
                }
            }
            return CreatedAtAction(nameof(GetTodoById), new { id = todo.Id }, todo);
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"SQL error: {ex.Message}");
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTodo(int id, Todo todo)
    {
        if (id != todo.Id)
        {
            return BadRequest("The ID doesn't match");
        }

        try
        {
            using (var conn = new SqlConnection(connectionString))
            {
                await conn.OpenAsync();

                var query = "UPDATE Todos SET Title = @Title, Description = @Description, Status = @Status, AssignedUser = @AssignedUser, CreatedAt = @CreatedAt WHERE Id = @Id";
                
                using (var command = new SqlCommand(query, conn))
                {
                    command.Parameters.AddWithValue("@Title", todo.Title);
                    command.Parameters.AddWithValue("@Description", todo.Description);
                    command.Parameters.AddWithValue("@Status", todo.Status);
                    command.Parameters.AddWithValue("@AssignedUser", todo.AssignedUser);
                    command.Parameters.AddWithValue("@CreatedAt", todo.CreatedAt);
                    command.Parameters.AddWithValue("@Id", id);

                    var rowsAffected = await command.ExecuteNonQueryAsync();

                    if (rowsAffected == 0)
                    {
                        return NotFound($"Todo with ID {id} not found.");
                    }
                }
            }

            return NoContent();
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"SQL error: {ex.Message}");
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTodo(int id)
    {
        try
        {
            using (var conn = new SqlConnection(connectionString))
            {
                await conn.OpenAsync();

                var qurey = "DELETE FROM History WHERE todoId = @todoId " +
                            "DELETE FROM Todos WHERE id = @id";

                using (var command = new SqlCommand(qurey, conn))
                {
                    command.Parameters.AddWithValue("todoId", id);
                    command.Parameters.AddWithValue("id", id);

                    var rowsAffected = await command.ExecuteNonQueryAsync();

                    if (rowsAffected == 0)
                    {
                        return NotFound($"Todo with ID {id} not found");
                    }

                    return NoContent();
                }
            }
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"SQL error: {ex.Message}");
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    #endregion Todo

    #region History
    [HttpPost("history")]
    public async Task<IActionResult> AddHistory([FromBody] List<History> historyRecords)
    {
        if (historyRecords == null || !historyRecords.Any())
        {
            return BadRequest("No history records provided");
        }

        try
        {
            using (var conn = new SqlConnection(connectionString))
            {
                var date = DateTime.Now.ToString();
                
                var query = "INSERT INTO History (TodoId, Date, ChangeType, ChangedBy, Details) " +
                            "VALUES (@TodoId, @Date, @ChangeType, @ChangedBy, @Details)";

                await conn.OpenAsync();

                foreach (var record in historyRecords)
                {
                    using (var command = new SqlCommand(query, conn))
                    {
                        command.Parameters.AddWithValue("@TodoId", record.TodoId);
                        command.Parameters.AddWithValue("@Date", date);
                        command.Parameters.AddWithValue("@ChangeType", record.ChangeType);
                        command.Parameters.AddWithValue("@ChangedBy", record.ChangedBy);
                        command.Parameters.AddWithValue("@Details", record.Details);

                        await command.ExecuteNonQueryAsync();
                    }
                }
            }

            return Ok("History records added successfully");
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"SQL error: {ex.Message}");
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpGet("history/{todoId}")]
    public async Task<ActionResult<IEnumerable<History>>> GetHistoryByTodoId(int todoId)
    {
        if (todoId <= 0)
        {
            return BadRequest("Invalid Todo ID");
        }

        try
        {
            var historyRecords = new List<History>();

            using (var conn = new SqlConnection(connectionString))
            {

                var query = "SELECT * FROM History WHERE TodoId = @TodoId";

                await conn.OpenAsync();

                using (var command = new SqlCommand(query, conn))
                {
                    command.Parameters.AddWithValue("@TodoId", todoId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            historyRecords.Add(new History
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                TodoId = reader.GetInt32(reader.GetOrdinal("TodoId")),
                                Date = reader.GetString(reader.GetOrdinal("Date")),
                                ChangeType = reader.GetString(reader.GetOrdinal("ChangeType")),
                                ChangedBy = reader.GetString(reader.GetOrdinal("ChangedBy")),
                                Details = reader.GetString(reader.GetOrdinal("Details"))
                            });
                        }
                    }
                }
            }

            return Ok(historyRecords);
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"SQL error: {ex.Message}");
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    #endregion History
}
