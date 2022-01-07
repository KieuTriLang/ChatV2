using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace ProjectTwo
{
    public class ChatHub : Hub
    {
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
    }
}