using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTwo.ModelViews
{
    public class GroupOnline
    {
        public string GroupId { get; set; }
        public List<UserOnline> UserOnlines { get; set; }
        public bool IsOnline { get; set; }
    }

    public class UserOnline
    {
        public string UserId { get; set; }
        public bool IsOnline { get; set; }
    }
}