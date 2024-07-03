using Application.Core;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class DeleteAdmin
    {
        
        public class Command : IRequest<Result<Unit>>
        {
            public int CommentId { get; set; }
            public Guid ActivityId { get; set; }
        }

        
        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.CommentId).NotEmpty();
                RuleFor(x => x.ActivityId).NotEmpty();
            }
        }

        
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

           
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                
                var comment = await _context.Comments
                    .FirstOrDefaultAsync(c => c.Id == request.CommentId, cancellationToken);

                if (comment == null)
                {
                    
                    return Result<Unit>.Failure("Comment not found");
                }

                
                _context.Comments.Remove(comment);

                
                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!success)
                {
                    
                    return Result<Unit>.Failure("Failed to delete the comment");
                }

                
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
