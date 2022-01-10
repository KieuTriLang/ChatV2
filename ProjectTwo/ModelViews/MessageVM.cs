using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectTwo.ModelViews
{
    public class MessageVM
    {
        public string Content { get; set; }
        public string When { get; set; }
        public string ImageCode { get; set; }
        public string GroupId { get; set; }
        public string SenderId { get; set; }
    }
}