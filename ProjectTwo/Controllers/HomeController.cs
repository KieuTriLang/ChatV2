using Microsoft.AspNet.Identity;
using ProjectTwo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static ProjectTwo.Models.ManageDbModels;

namespace ProjectTwo.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _db = new ApplicationDbContext();
        public ActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
            {
                IEnumerable<Group> groups = _db.Users.Find(User.Identity.GetUserId()).Groups;
                return View(groups);
            }
            else
            {
                return View();
            }
            
        }
    }
}