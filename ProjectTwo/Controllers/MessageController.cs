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
                applicationUsers = _db.Users.Where(u => u.UserName.Contains(keyword) && u.UserName != User.Identity.Name && u.Id != "PchatSystem").Take(10);
            }
            return PartialView(applicationUsers);
        }

        [HttpGet]
        public ActionResult RenderPage(string groupId, string active = "")
        {
            Group group = _db.Groups.Find(groupId);
            ViewBag.Active = active;
            string userId = User.Identity.GetUserId();
            bool isAccept = group.MemberGroups.Where(mg => mg.Member.Id == userId).FirstOrDefault().IsAccept;
            if (isAccept)
            {
                return PartialView("~/Views/Message/RenderPage.cshtml", group);
            }
            else
            {
                return PartialView("~/Views/Message/RenderPageInvite.cshtml", group);
            }

        }

        [HttpGet]
        public ActionResult RenderNavItem(string groupId, string active = "")
        {
            Group group = _db.Groups.Find(groupId);
            ViewBag.Active = active;
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
                    GroupName = "#" + random.Next(1, 160602),
                    CreatorId = User.Identity.GetUserId()
                };
                _db.Groups.Add(group);
                _db.SaveChanges();
                if (!AddToGroup(groupId, User.Identity.GetUserId()) || !AddToGroup(groupId, userId))
                {
                    return Json(new { status = "notok" });
                }
                var creator = _db.Users.Find(User.Identity.GetUserId());
                var creatorName = user.DisplayName != null ? creator.DisplayName : creator.UserName;
                MessageVM info = new MessageVM()
                {
                    Content = creatorName +" created " + group.GroupName,
                    GroupId = groupId,
                    SenderId = "PchatSystem"
                };
                SaveMessageSystem(info);
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

            return Json(new { status = "ok" });
        }

        [HttpGet]
        public ActionResult GetInfoGroup(string groupId)
        {
            Group group = _db.Groups.Find(groupId);
            return Json(new { GroupId = group.GroupId, GroupName = group.GroupName, GroupImg = group.GroupImg }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public bool AddToGroup(string groupId, string memberId)
        {
            Group group = _db.Groups.Find(groupId);
            ApplicationUser record = group.MemberGroups.Where(mg => mg.Member.Id == memberId).FirstOrDefault()?.Member;
            if (group != null && record == null)
            {
                try
                {
                    MemberGroup memberGroup = new MemberGroup()
                    {
                        Member = _db.Users.Find(memberId),
                        Group = group,
                        IsAccept = memberId == User.Identity.GetUserId() ? true : false
                    };
                    group.MemberGroups.Add(memberGroup);
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

        public bool RemoveToGroup(string groupId, string memberId)
        {
            Group group = _db.Groups.Find(groupId);
            if (group != null)
            {
                MemberGroup record = _db.MemberGroups.Where(mg => mg.Member.Id == memberId && mg.Group.GroupId == groupId).FirstOrDefault();
                _db.MemberGroups.Remove(record);
                _db.SaveChanges();
                return true;

            }
            return false;
        }

        [HttpPost]
        public bool LeaveGroup(string groupId)
        {
            Group group = _db.Groups.Find(groupId);
            if (group != null)
            {
                if (group.MemberGroups.Count() == 1)
                {
                    RemoveToGroup(groupId, User.Identity.GetUserId());
                    _db.Groups.Remove(group);
                    _db.SaveChanges();
                }
                else
                {
                    if (!CheckHost(groupId))
                    {
                        RemoveToGroup(groupId, User.Identity.GetUserId());
                        var user = _db.Users.Find(User.Identity.GetUserId());
                        var userName = user.DisplayName != null ? user.DisplayName : user.UserName;
                        MessageVM info = new MessageVM()
                        {
                            Content = userName + " left group ",
                            GroupId = groupId,
                            SenderId = "PchatSystem"
                        };
                        SaveMessageSystem(info);
                    }
                    else
                    {
                        return false;
                    }

                }
                return true;
            }
            return false;
        }

        [HttpPost]
        public ActionResult SaveMessage(MessageVM info)
        {
            if (info != null && info.GroupId != null)
            {
                string userId = User.Identity.GetUserId();
                var record = _db.MemberGroups.Where(mg => mg.Member.Id == userId && mg.Group.GroupId == info.GroupId).FirstOrDefault().IsAccept;
                if (!record)
                {
                    return Json(new { status = "not ok"});
                }
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
                    UpdateSeen(info.GroupId);
                }
                catch (Exception ex)
                {
                    return Json(new {status = "not ok", message = ex });
                }                
                return Json(new { status = "ok",SenderId = info.SenderId,GroupId = info.GroupId,Content=message.Content,When = message.When });
            }
            return Json(new { status = "not ok" });
        }
        [HttpPost]
        public ActionResult SaveImage(MessageVM info)
        {
            if (info != null && info.GroupId != null)
            {
                string userId = User.Identity.GetUserId();
                var record = _db.MemberGroups.Where(mg => mg.Member.Id == userId && mg.Group.GroupId == info.GroupId).FirstOrDefault().IsAccept;
                if (!record)
                {
                    return Json(new { status = "not ok" });
                }
                Message message = new Message()
                {
                    Content = info.Content,
                    ImageCode = RandomString(12),
                    When = Convert.ToDateTime(info.When),
                    Group = _db.Groups.Find(info.GroupId),
                    Sender = _db.Users.Find(info.SenderId),
                    ListSeen = "[]"
                };
                try
                {
                    _db.Messages.Add(message);
                    _db.SaveChanges();
                    UpdateSeen(info.GroupId);
                }
                catch (Exception ex)
                {
                    return Json(new { status = "not ok" });
                }
                return Json(new {status="ok", ImageCode = message.ImageCode, When = message.When });
            }
            return Json(new { status = "not ok" });
        }
        protected bool SaveMessageSystem(MessageVM info)
        {
            if (info != null && info.GroupId != null)
            {
                Message message = new Message()
                {
                    Content = info.Content,
                    When = DateTime.UtcNow.AddHours(7),
                    Group = _db.Groups.Find(info.GroupId),
                    Sender = _db.Users.Find(info.SenderId),
                    ListSeen = "[]"
                };
                try
                {
                    _db.Messages.Add(message);
                    _db.SaveChanges();
                    UpdateSeen(info.GroupId);
                }
                catch (Exception ex)
                {
                    return false;
                }
                return true;
            }
            return false;
        }

        [HttpGet]
        public ActionResult GetConversation(string groupId, string lastTimeSend)
        {
            string userId = User.Identity.GetUserId();
            MemberGroup record = _db.MemberGroups.Where(mg => mg.Member.Id == userId && mg.Group.GroupId == groupId).FirstOrDefault();
            if (record.IsAccept)
            {
                Group group = _db.Groups.Find(groupId);
                IEnumerable<Message> messages = group.Messages.Where(m => m.When < Convert.ToDateTime(lastTimeSend)).Reverse().Take(50).ToList();
                List<MessageVM> result = new List<MessageVM>();
                foreach (Message item in messages)
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
                var json = JsonConvert.SerializeObject(result, Formatting.None, new JsonSerializerSettings() { ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore });
                return Content(json, "application/json");
            }
            else
            {
                return Json(new { status = "notok" }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpGet]
        public ActionResult GetInfoUser(string userId)
        {
            ApplicationUser user = _db.Users.Find(userId);
            string userName = user.DisplayName != null ? user.DisplayName : user.UserName;
            return Json(new { status = "ok", userId = user.Id, userName = userName, avatar = user.Avatar }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public string GetImage(string groupId, string imageCode)
        {
            Group group = _db.Groups.Find(groupId);
            Message message = group.Messages.Where(m => m.ImageCode == imageCode).FirstOrDefault();
            if (message != null)
            {
                string image = message.Content;
                return image;
            }
            else
            {
                return "Pchat-image";
            }
        }

        [HttpPost]
        public bool AcceptInvite(string groupId)
        {
            string userId = User.Identity.GetUserId();
            var user = _db.Users.Find(userId);
            var userName = user.DisplayName != null ? user.DisplayName : user.UserName;
            MemberGroup record = _db.MemberGroups.Where(mg => mg.Member.Id == userId && mg.Group.GroupId == groupId).FirstOrDefault();
            if (record != null)
            {
                try
                {
                    record.IsAccept = true;
                    _db.SaveChanges();
                    MessageVM info = new MessageVM()
                    {
                        Content = userName + " joined group",
                        GroupId = groupId,
                        SenderId = "PchatSystem"
                    };
                    SaveMessageSystem(info);
                    return true;
                }catch(Exception ex)
                {
                    return false;
                }
                
            }
            return false;
        }
        [HttpPost]
        public bool DeclineInvite(string groupId)
        {
            string userId = User.Identity.GetUserId();
            MemberGroup record = _db.MemberGroups.Where(mg => mg.Member.Id == userId && mg.Group.GroupId == groupId).FirstOrDefault();
            if (record != null)
            {
                _db.MemberGroups.Remove(record);
                _db.SaveChanges();
                return true;
            }
            return false;
        }

        [HttpGet]
        public ActionResult CheckOnline()
        {
            string userId = User.Identity.GetUserId();
            var record = _db.MemberGroups.Where(mg => mg.Member.Id == userId && mg.IsAccept == true).ToList();
            List<GroupOnline> groupOnlines = new List<GroupOnline>();
            foreach (var item in record)
            {
                List<UserOnline> userOnlines = new List<UserOnline>();
                foreach (var member in item.Group.MemberGroups)
                {
                    if (member.IsAccept)
                    {
                        userOnlines.Add(new UserOnline() { UserId = member.Member.Id, IsOnline = ConnectedUser.UserIds.Contains(member.Member.Id) });
                    }
                }
                GroupOnline gl = new GroupOnline()
                {
                    GroupId = item.Group.GroupId,
                    UserOnlines = userOnlines,
                    IsOnline = userOnlines.Where(uo => uo.IsOnline == true).Count() > 1 ? true : false
                };
                groupOnlines.Add(gl);
            }
            var json = JsonConvert.SerializeObject(groupOnlines, Formatting.None, new JsonSerializerSettings() { ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore });
            return Content(json, "application/json");
        }

        public bool CheckHost(string groupId)
        {
            var group = _db.Groups.Find(groupId);
            if (group != null && group.CreatorId == User.Identity.GetUserId())
            {
                return true;
            }
            return false;
        }

        [HttpPost]
        public bool ChangeHost(string groupId, string toPerson)
        {
            if (CheckHost(groupId) && groupId != null && toPerson!=null)
            {
                var group = _db.Groups.Find(groupId);
                try
                {
                    group.CreatorId = toPerson;
                    _db.SaveChanges();
                    var person = _db.Users.Find(toPerson);
                    var personName = person.DisplayName != null ? person.DisplayName : person.UserName;
                    var user = _db.Users.Find(User.Identity.GetUserId());
                    var userName = user.DisplayName != null ? user.DisplayName : user.UserName;
                    MessageVM info = new MessageVM()
                    {
                        Content = userName + " gave host to " + personName,
                        GroupId = groupId,
                        SenderId = "PchatSystem"
                    };
                    SaveMessageSystem(info);
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
        public bool KickPerson(string groupId, string personId)
        {
            if (CheckHost(groupId) && groupId != null && personId != null)
            {
                if (RemoveToGroup(groupId, personId))
                {
                    var person = _db.Users.Find(personId);
                    var personName = person.DisplayName != null ? person.DisplayName : person.UserName;
                    var user = _db.Users.Find(User.Identity.GetUserId());
                    var userName = user.DisplayName != null ? user.DisplayName : user.UserName;
                    MessageVM info = new MessageVM()
                    {
                        Content = userName + " kicked out " +personName,
                        GroupId = groupId,
                        SenderId = "PchatSystem"
                    };
                    SaveMessageSystem(info);
                    return true;
                }
            }
            return false;
        }

        [HttpGet]
        public ActionResult RenderHeaderPage(string groupId)
        {
            var group = _db.Groups.Find(groupId);
            return PartialView(group);
        }

        [HttpGet]
        public ActionResult RenderMembers(string groupId)
        {
            var memberGroups = _db.MemberGroups.Where(mg => mg.Group.GroupId == groupId).ToList();
            return PartialView(memberGroups);
        }

        [HttpPost]
        public bool UpdateSeen(string groupId)
        {
            try
            {
                Group group = _db.Groups.Find(groupId);
                IEnumerable<Message> messages = group.Messages.ToList();
                foreach (var item in messages)
                {
                    if (item.ListSeen == null || item.ListSeen == "")
                    {
                        List<string> userSeen = new List<string>();
                        userSeen.Add(User.Identity.GetUserId());
                        item.ListSeen = JsonConvert.SerializeObject(userSeen);
                    }
                    else
                    {
                        var userId = User.Identity.GetUserId();
                        List<string> userSeen = JsonConvert.DeserializeObject<List<string>>(item.ListSeen);
                        if (!userSeen.Contains(userId))
                        {
                            userSeen.Add(userId);
                        }
                        item.ListSeen = JsonConvert.SerializeObject(userSeen);
                    }
                    _db.SaveChanges();
                }
            }catch(Exception ex)
            {
                return false;
            }
            
            return true;
        }
        [HttpGet]
        public ActionResult GetSeen(string groupId)
        {
            var group = _db.Groups.Find(groupId);
            var userLog = User.Identity.GetUserId();
            var members = group.MemberGroups.Where(m => m.Member.Id !=userLog).ToList();
            List<SeenMessageVM> datas = new List<SeenMessageVM>();
            foreach( var member in members)
            {
                if (member.IsAccept)
                {
                    var userId = member.Member.Id;
                    Message message = group.Messages.Where(m => m.ListSeen.Contains(userId)).Reverse().FirstOrDefault();
                    if(message != null)
                    {
                        SeenMessageVM data = new SeenMessageVM()
                        {
                            GroupId = groupId,
                            UserId = userId,
                            MessageSeen = new MessageVM()
                            {
                                Content = message.Content,
                                When = message.When + ""
                            }
                        };
                        datas.Add(data);
                    }
                }                
            }
            var json = JsonConvert.SerializeObject(datas, Formatting.None, new JsonSerializerSettings() { ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore });
            return Content(json, "application/json");
        }
        [HttpGet]
        public ActionResult GetUnRead(string groupId)
        {
            var group = _db.Groups.Find(groupId);
            var userId = User.Identity.GetUserId();
            var member = group.MemberGroups.Where(m => m.Member.Id == userId).FirstOrDefault();
            if (member.IsAccept)
            {
                int unreadNum = group.Messages.Where(m => !m.ListSeen.Contains(userId)).Count();
                return Json(new { status = "ok", GroupId = groupId, URNum = unreadNum }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { status = "not ok" });
        }
    }
}