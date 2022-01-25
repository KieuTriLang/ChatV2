using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTwo.ModelViews
{
    public class SeenMessageVM
    {
        public string GroupId { get; set; }
        public string UserId { get; set; }
        public MessageVM MessageSeen { get; set; }
    }
}