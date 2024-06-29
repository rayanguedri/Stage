namespace API.DTOs
{
    public class UserDto
    {
        public string DisplayName { get; set; }
        public string Token { get; set; }
        public string Image { get; set; }
        public string Username { get; set; }
         public int ActivitiesCount { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingsCount { get; set; }
        public string Email { get; set; }
        public string Bio { get; set; }
    }
}