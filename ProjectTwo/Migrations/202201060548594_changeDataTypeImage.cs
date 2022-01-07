namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class changeDataTypeImage : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Groups", "GroupImg", c => c.String());
            AlterColumn("dbo.AspNetUsers", "Avatar", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.AspNetUsers", "Avatar", c => c.Binary());
            AlterColumn("dbo.Groups", "GroupImg", c => c.Binary());
        }
    }
}
