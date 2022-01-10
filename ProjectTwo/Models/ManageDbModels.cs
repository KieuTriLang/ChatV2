using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ProjectTwo.Models
{
    public class ManageDbModels
    {
        public class Message
        {
            [Key]
            public int Id { get; set; }
            public string Content { get; set; }
            public DateTime When { get; set; }
            public string ImageCode { get; set; }
            public virtual Group Group { get; set; }
            public virtual ApplicationUser Sender { get; set; }
        }
        public class Group
        {
            public Group()
            {
                this.Members = new HashSet<ApplicationUser>();
                this.Messages = new HashSet<Message>();
            }
            [Key]
            public string GroupId { get; set; }
            public string GroupName { get; set; }
            public string GroupImg { get; set; }
            public virtual ICollection<ApplicationUser> Members { get; set; }
            public virtual ICollection<Message> Messages { get; set; }
        }

    }
}