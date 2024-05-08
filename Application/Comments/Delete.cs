using Application.Core;
using Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Delete
    {
        // Command class for deleting a comment, including the CommentId and ActivityId
        public class Command : IRequest<Result<Unit>>
        {
            public int CommentId { get; set; }
            public Guid ActivityId { get; set; }
        }

        // Validator class for the Command
        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.CommentId).NotEmpty();
                RuleFor(x => x.ActivityId).NotEmpty();
            }
        }

        // Handler class for processing the Command
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            // Method for handling the deletion of a comment
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                // Retrieve the comment including the author relationship
                var comment = await _context.Comments
                    .Include(c => c.Author)
                    .FirstOrDefaultAsync(c => c.Id == request.CommentId, cancellationToken);

                if (comment == null)
                {
                    // Return failure if the comment is not found
                    return Result<Unit>.Failure("Comment not found");
                }

                // Get the currently logged-in user
                var currentUser = await _context.Users
                    .SingleOrDefaultAsync(u => u.UserName == _userAccessor.GetUsername(), cancellationToken);

                // Check if the current user is the author of the comment
                if (comment.Author.UserName != currentUser.UserName)
                {
                    // Return failure if the user is not authorized to delete the comment
                    return Result<Unit>.Failure("You are not authorized to delete this comment");
                }

                // Remove the comment from the context
                _context.Comments.Remove(comment);

                // Save changes to the database
                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!success)
                {
                    // Return failure if the comment deletion fails
                    return Result<Unit>.Failure("Failed to delete the comment");
                }

                // Return success if the comment deletion is successful
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
