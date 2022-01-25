using Microsoft.AspNet.Identity;
using Microsoft.AspNet.SignalR;
using ProjectTwo.ModelViews;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace ProjectTwo
{
    public class ChatHub : Hub
    {
        public override Task OnConnected()
        {
            ConnectedUser.UserIds.Add(Context.User.Identity.GetUserId());
            return base.OnConnected();
        }
        public override Task OnDisconnected(bool stopCalled)
        {
            ConnectedUser.UserIds.Remove(Context.User.Identity.GetUserId());
            return base.OnDisconnected(stopCalled);
        }
        public Task JoinGroup(string roomName)
        {
            return Groups.Add(Context.ConnectionId, roomName);
        }

        public Task LeaveGroup(string roomName)
        {
            return Groups.Remove(Context.ConnectionId, roomName);
        }
        public void SendMessage(string fromPerson,string toGroup, string message,string when)
        {
            Clients.Group(toGroup).ReceiveMessage(toGroup,fromPerson, message,when);
        }
        public void SendRequest(string toPerson,string groupName)
        {
            Clients.All.ReceiveRequest(toPerson, groupName);
        }
        public void SendUpdate(string toGroup)
        {
            Clients.Group(toGroup).ReceiveUpdate(toGroup);
        }
        public void SendKick(string toGroup, string toPerson)
        {
            Clients.Group(toGroup).ReceiveKick(toGroup,toPerson);
        }
        public void SendSeen(string toGroup)
        {
            Clients.Group(toGroup).ReceiveSeen(toGroup);
        }
    }
}