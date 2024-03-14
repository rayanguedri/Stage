using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
 
namespace Persistence
{
    public class DataContextFactory : IDesignTimeDbContextFactory<DataContext>
    {
        public DataContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DataContext>();
            optionsBuilder.UseSqlite(optionsBuilder.Options.ToString());
 
            return new DataContext(optionsBuilder.Options);
        }
    }
}