namespace ProjectTwo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class changeRelationMemberGroup : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.ApplicationUserGroups", "ApplicationUser_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.ApplicationUserGroups", "Group_GroupId", "dbo.Groups");
            DropIndex("dbo.ApplicationUserGroups", new[] { "ApplicationUser_Id" });
            DropIndex("dbo.ApplicationUserGroups", new[] { "Group_GroupId" });
            CreateTable(
                "dbo.MemberGroups",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        IsAccept = c.Boolean(nullable: false),
                        Group_GroupId = c.String(maxLength: 128),
                        Member_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Groups", t => t.Group_GroupId)
                .ForeignKey("dbo.AspNetUsers", t => t.Member_Id)
                .Index(t => t.Group_GroupId)
                .Index(t => t.Member_Id);
            
            DropTable("dbo.ApplicationUserGroups");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.ApplicationUserGroups",
                c => new
                    {
                        ApplicationUser_Id = c.String(nullable: false, maxLength: 128),
                        Group_GroupId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.ApplicationUser_Id, t.Group_GroupId });
            
            DropForeignKey("dbo.MemberGroups", "Member_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.MemberGroups", "Group_GroupId", "dbo.Groups");
            DropIndex("dbo.MemberGroups", new[] { "Member_Id" });
            DropIndex("dbo.MemberGroups", new[] { "Group_GroupId" });
            DropTable("dbo.MemberGroups");
            CreateIndex("dbo.ApplicationUserGroups", "Group_GroupId");
            CreateIndex("dbo.ApplicationUserGroups", "ApplicationUser_Id");
            AddForeignKey("dbo.ApplicationUserGroups", "Group_GroupId", "dbo.Groups", "GroupId", cascadeDelete: true);
            AddForeignKey("dbo.ApplicationUserGroups", "ApplicationUser_Id", "dbo.AspNetUsers", "Id", cascadeDelete: true);
        }
    }
}
