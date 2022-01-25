namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class listSeenColumn : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Messages", "ListSeen", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Messages", "ListSeen");
        }
    }
}
