using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;

        public ChatHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task SendComment(Create.Command command)
        {
            var comment = await _mediator.Send(command);

            await Clients.Group(command.ActivityId.ToString())
                .SendAsync("ReceiveComment", comment.Value);
        }

          public async Task DeleteComment(Delete.Command command)
        {
            var result = await _mediator.Send(command);

            if (result.IsSuccess)
            {
                await Clients.Group(command.ActivityId.ToString())
                    .SendAsync("DeleteComment", command.CommentId);
            }
        }

          public async Task EditComment(Edit.Command command)
        {
            var result = await _mediator.Send(command);

            if (result.IsSuccess)
            {
                // If the comment was successfully edited, broadcast the updated comment to the group
                await Clients.Group(command.ActivityId.ToString())
                    .SendAsync("EditComment", result.Value);
            }
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var activityId = httpContext.Request.Query["activityId"];
            await Groups.AddToGroupAsync(Context.ConnectionId, activityId);
            var result = await _mediator.Send(new List.Query{ActivityId = Guid.Parse(activityId)});
            await Clients.Caller.SendAsync("LoadComments", result.Value);
        }
    }
}
