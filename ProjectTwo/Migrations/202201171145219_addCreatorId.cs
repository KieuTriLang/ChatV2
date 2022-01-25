namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addCreatorId : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Groups", "CreatorId", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Groups", "CreatorId");
        }
    }
}
