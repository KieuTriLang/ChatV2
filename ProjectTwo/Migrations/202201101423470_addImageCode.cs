namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addImageCode : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Messages", "ImageCode", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Messages", "ImageCode");
        }
    }
}
