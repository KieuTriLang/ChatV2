namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<ProjectTwo.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(ProjectTwo.Models.ApplicationDbContext context)
        {
            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data.
            context.Users.AddOrUpdate(u => u.Id,
                new Models.ApplicationUser() { 
                    Id= "PchatSystem",
                    EmailConfirmed = false,
                    PasswordHash = "01673004977",
                    PhoneNumberConfirmed = false,
                    TwoFactorEnabled =false,
                    LockoutEnabled = true,
                    AccessFailedCount = 0,
                    UserName = "PchatSystem"
                }
                );
        }
    }
}
