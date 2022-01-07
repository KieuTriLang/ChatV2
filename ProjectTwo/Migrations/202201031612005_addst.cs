namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addst : DbMigration
    {
        public override void Up()
        {
            RenameColumn(table: "dbo.Messages", name: "GroupId", newName: "Group_GroupId");
            RenameColumn(table: "dbo.Messages", name: "SenderId", newName: "Sender_Id");
            RenameIndex(table: "dbo.Messages", name: "IX_SenderId", newName: "IX_Sender_Id");
            RenameIndex(table: "dbo.Messages", name: "IX_GroupId", newName: "IX_Group_GroupId");
        }
        
        public override void Down()
        {
            RenameIndex(table: "dbo.Messages", name: "IX_Group_GroupId", newName: "IX_GroupId");
            RenameIndex(table: "dbo.Messages", name: "IX_Sender_Id", newName: "IX_SenderId");
            RenameColumn(table: "dbo.Messages", name: "Sender_Id", newName: "SenderId");
            RenameColumn(table: "dbo.Messages", name: "Group_GroupId", newName: "GroupId");
        }
    }
}
