using Application.Core;
using Application.Interfaces;
using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Edit
    {
        // Command class for editing a comment
        public class Command : IRequest<Result<CommentDto>>
        {
            public int CommentId { get; set; }  // The ID of the comment to edit
            public Guid ActivityId { get; set; } // The ID of the activity to which the comment belongs
            public string Body { get; set; } // The new body of the comment
        }

        // Validator class for the Command
        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.CommentId).NotEmpty();
                RuleFor(x => x.ActivityId).NotEmpty();
                RuleFor(x => x.Body).NotEmpty();
            }
        }

        // Handler class for processing the Command
        public class Handler : IRequestHandler<Command, Result<CommentDto>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper)
            {
                _context = context;
                _userAccessor = userAccessor;
                _mapper = mapper;
            }

            public async Task<Result<CommentDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                // Retrieve the comment including the author relationship
                var comment = await _context.Comments
                    .Include(c => c.Author)
                    .FirstOrDefaultAsync(c => c.Id == request.CommentId, cancellationToken);

                if (comment == null)
                {
                    // Return failure if the comment is not found
                    return Result<CommentDto>.Failure("Comment not found");
                }

                // Get the currently logged-in user
                var currentUser = await _context.Users
                    .SingleOrDefaultAsync(u => u.UserName == _userAccessor.GetUsername(), cancellationToken);

                // Check if the current user is the author of the comment
                if (comment.Author.UserName != currentUser.UserName)
                {
                    // Return failure if the user is not authorized to edit the comment
                    return Result<CommentDto>.Failure("You are not authorized to edit this comment");
                }

                // Update the body of the comment
                comment.Body = request.Body;

                // Save changes to the database
                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!success)
                {
                    // Return failure if the comment update fails
                    return Result<CommentDto>.Failure("Failed to edit the comment");
                }

                // Return success and the updated CommentDto
                return Result<CommentDto>.Success(_mapper.Map<CommentDto>(comment));
            }
        }
    }
}
