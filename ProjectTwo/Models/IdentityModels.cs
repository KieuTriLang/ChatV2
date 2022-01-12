using System.Collections.Generic;
using System.Data.Entity;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using static ProjectTwo.Models.ManageDbModels;

namespace ProjectTwo.Models
{
    // You can add profile data for the user by adding more properties to your ApplicationUser class, please visit https://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
    public class ApplicationUser : IdentityUser
    {
        public ApplicationUser()
        {
            this.Groups = new HashSet<Group>();
            this.Messages = new HashSet<Message>();
        }
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            // Add custom user claims here
            return userIdentity;
        }
        public string Avatar { get; set; }
        public string DisplayName { get; set; }
        public virtual ICollection<Group> Groups { get; set; }
        public virtual ICollection<Message> Messages { get; set; }
    }

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext()
            : base("DefaultConnection", throwIfV1Schema: false)
        {
        }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Message> Messages { get; set; }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>()
                .HasMany<Message>(u => u.Messages)
                .WithRequired(m => m.Sender);

            modelBuilder.Entity<Group>()
                .HasMany<Message>(g => g.Messages)
                .WithRequired(m => m.Group);
        }
    }
}