using Microsoft.AspNet.Identity;
using Newtonsoft.Json;
using ProjectTwo.Models;
using ProjectTwo.ModelViews;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static ProjectTwo.Models.ManageDbModels;

namespace ProjectTwo.Controllers
{
    [Authorize]
    public class MessageController : Controller
    {
        private ApplicationDbContext _db = new ApplicationDbContext();

        private static Random random = new Random();

        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        [AllowAnonymous]
        [HttpGet]
        public ActionResult SearchFriend(string keyword)
        {
            IEnumerable<ApplicationUser> applicationUsers = null;
            if (keyword != null)
            {
                applicationUsers = _db.Users.Where(u => u.UserName.Contains(keyword) && u.UserName != User.Identity.Name).Take(10);
            }
            return PartialView(applicationUsers);
        }
        
        [HttpGet]
        public ActionResult RenderPage(string groupId,string active ="")
        {
            Group group = _db.Groups.Find(groupId);
            ViewBag.Active = active;
            return PartialView(group);
        }
        
        [HttpGet]
        public ActionResult RenderNavItem(string groupId)
        {
            Group group = _db.Groups.Find(groupId);
            return PartialView(group);
        }

        
        [HttpPost]
        public ActionResult CreateGroup(string userId)
        {
            string groupId = RandomString(16);
            try
            {
                ApplicationUser user = _db.Users.Find(userId);
                Group group = new Group()
                {
                    GroupId = groupId,
                    GroupName = "#" + random.Next(1, 160602)
                };
                _db.Groups.Add(group);
                _db.SaveChanges();
                if(!AddToGroup(groupId, User.Identity.GetUserId()) && !AddToGroup(groupId, userId))
                {
                    return Json(new { status = "notok"});
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = "notok", message = ex });
            }

            return Json(new { status = "ok", groupId = groupId, userId = userId });
        }
        
        [HttpPost]
        public ActionResult UpdateGroup(Group group)
        {
            Group record = _db.Groups.Find(group.GroupId);
            try
            {
                record.GroupName = group.GroupName;
                record.GroupImg = group.GroupImg;
                _db.SaveChanges();
            }
            catch (Exception ex)
            {
                return Json(new { status = "notok", message = ex });
            }

            return Json(new { status = "ok"});
        }
        
        [HttpGet]
        public ActionResult GetInfoGroup(string groupId)
        {
            Group group = _db.Groups.Find(groupId);
            return Json(new { GroupId = group.GroupId, GroupName = group.GroupName, GroupImg = group.GroupImg },JsonRequestBehavior.AllowGet);
        }
        
        [HttpPost]
        public bool AddToGroup(string groupId, string memberId)
        {
            Group group = _db.Groups.Find(groupId);
            ApplicationUser record = group.Members.Where(m => m.Id == memberId).FirstOrDefault();
            if (group != null && record == null)
            {
                var user = _db.Users.Find(memberId);
                _db.Users.Attach(user);
                group.Members.Add(user);
                _db.SaveChanges();
                return true;
            }
            return false;
        }
        
        public bool RemoveToGroup(string groupId, string memberId)
        {
            Group group = _db.Groups.Find(groupId);
            if (group != null)
            {
                var user = _db.Users.Find(memberId);
                _db.Users.Attach(user);
                group.Members.Remove(user);
                _db.SaveChanges();
                return true;

            }
            return false;
        }

        [HttpPost]
        public bool LeaveGroup(string groupId)
        {
            Group group = _db.Groups.Find(groupId);
            if(group != null)
            {
                if(group.Members.Count() == 1)
                {
                    RemoveToGroup(groupId, User.Identity.GetUserId());
                    _db.Groups.Remove(group);
                    _db.SaveChanges();
                }
                else
                {
                    RemoveToGroup(groupId, User.Identity.GetUserId());
                }
                    return true;
            }
            return false;
        }
        
        [HttpPost]
        public bool SaveMessage(MessageVM info)
        {
            if(info!= null && info.GroupId!=null)
            {
                Message message = new Message()
                {
                    Content = info.Content,
                    When = Convert.ToDateTime(info.When),
                    Group = _db.Groups.Find(info.GroupId),
                    Sender = _db.Users.Find(info.SenderId)
                };
                try
                {
                    _db.Messages.Add(message);
                    _db.SaveChanges();
                }
                catch (Exception ex)
                {
                    return false;
                }
                return true;
            }            
            return false;
        }
        [HttpPost]
        public string SaveImage(MessageVM info)
        {
            if (info != null && info.GroupId != null)
            {
                Message message = new Message()
                {
                    Content = info.Content,
                    ImageCode = RandomString(12),
                    When = Convert.ToDateTime(info.When),
                    Group = _db.Groups.Find(info.GroupId),
                    Sender = _db.Users.Find(info.SenderId)
                };
                try
                {
                    _db.Messages.Add(message);
                    _db.SaveChanges();
                }
                catch (Exception ex)
                {
                    return "wrong";
                }
                return message.ImageCode;
            }
            return "wrong";
        }


        [HttpGet]
        public ActionResult GetConversation(string groupId,string lastTimeSend)
        {
            Group group = _db.Groups.Find(groupId);
            IEnumerable<Message> messages =group.Messages.Where(m => m.When < Convert.ToDateTime(lastTimeSend)).Reverse().Take(50).ToList();
            List<MessageVM> result = new List<MessageVM>();
            foreach(Message item in messages)
            {
                MessageVM messageVM = new MessageVM()
                {
                    Content = item.Content,
                    When = item.When + "",
                    GroupId = item.Group.GroupId,
                    SenderId = item.Sender.Id
                };
                result.Add(messageVM);
            }
            var json = JsonConvert.SerializeObject(result,Formatting.None,new JsonSerializerSettings(){ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore});
            return Content(json, "application/json");
        }
        
        [HttpGet]
        public ActionResult GetInfoUser(string userId)
        {
            ApplicationUser user = _db.Users.Find(userId);
            string userName = user.DisplayName != null ? user.DisplayName : user.UserName;
            return Json(new { status = "ok",userId = user.Id,userName = userName,avatar = user.Avatar },JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public string GetImage(string groupId, string imageCode)
        {
            Group group = _db.Groups.Find(groupId);
            Message message = group.Messages.Where(m => m.ImageCode == imageCode).FirstOrDefault();
            if(message != null)
            {
                string image = message.Content;
                return image;
            }
            else
            {
                return "Pchat-image";
            }
        }
    }
}