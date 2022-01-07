namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class changeDatatypeWhen : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Messages", "When", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Messages", "When", c => c.String());
        }
    }
}
