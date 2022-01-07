namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addNewRelation : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Messages", "Group_GroupId", "dbo.Groups");
            DropIndex("dbo.Messages", new[] { "Group_GroupId" });
            RenameColumn(table: "dbo.Messages", name: "Group_GroupId", newName: "GroupId");
            RenameColumn(table: "dbo.Messages", name: "Sender_Id", newName: "SenderId");
            RenameIndex(table: "dbo.Messages", name: "IX_Sender_Id", newName: "IX_SenderId");
            AlterColumn("dbo.Messages", "GroupId", c => c.String(nullable: false, maxLength: 128));
            CreateIndex("dbo.Messages", "GroupId");
            AddForeignKey("dbo.Messages", "GroupId", "dbo.Groups", "GroupId", cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Messages", "GroupId", "dbo.Groups");
            DropIndex("dbo.Messages", new[] { "GroupId" });
            AlterColumn("dbo.Messages", "GroupId", c => c.String(maxLength: 128));
            RenameIndex(table: "dbo.Messages", name: "IX_SenderId", newName: "IX_Sender_Id");
            RenameColumn(table: "dbo.Messages", name: "SenderId", newName: "Sender_Id");
            RenameColumn(table: "dbo.Messages", name: "GroupId", newName: "Group_GroupId");
            CreateIndex("dbo.Messages", "Group_GroupId");
            AddForeignKey("dbo.Messages", "Group_GroupId", "dbo.Groups", "GroupId");
        }
    }
}
