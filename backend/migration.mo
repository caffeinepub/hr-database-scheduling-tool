import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type BadgeId = Text;
  type StaffBadgeId = Text;
  type NewActor = {
    badgeMap : Map.Map<BadgeId, Badge>;
    staffBadgeMap : Map.Map<StaffBadgeId, StaffBadge>;
  };

  public type Badge = {
    id : BadgeId;
    name : Text;
    description : Text;
    category : Text;
    iconKey : Text;
    createdAt : Int;
  };

  public type StaffBadge = {
    id : StaffBadgeId;
    employeeId : Text;
    badgeId : BadgeId;
    assignedBy : Text;
    assignedAt : Int;
    note : ?Text;
  };

  public func run(old : {}) : NewActor {
    let badgeMap = Map.empty<BadgeId, Badge>();
    let staffBadgeMap = Map.empty<StaffBadgeId, StaffBadge>();

    // Seed badges
    let seedBadges = [
      // Attendance & Reliability
      {
        id = "perfect_attendance";
        name = "Perfect Attendance";
        description = "Zero absences in a period";
        category = "Attendance";
        iconKey = "🏆";
        createdAt = 0;
      },
      {
        id = "early_bird";
        name = "Early Bird";
        description = "Consistently early to shifts";
        category = "Attendance";
        iconKey = "🐦";
        createdAt = 0;
      },
      {
        id = "reliable_hero";
        name = "Reliable Hero";
        description = "Never missed a shift";
        category = "Attendance";
        iconKey = "🦸";
        createdAt = 0;
      },
      // Performance & Reviews
      {
        id = "five_star_review";
        name = "Five Star Review";
        description = "Received an outstanding customer review";
        category = "Performance";
        iconKey = "⭐";
        createdAt = 0;
      },
      {
        id = "crowd_favourite";
        name = "Crowd Favourite";
        description = "Multiple positive feedback submissions";
        category = "Performance";
        iconKey = "🎉";
        createdAt = 0;
      },
      {
        id = "top_performer";
        name = "Top Performer";
        description = "Excellent appraisal score";
        category = "Performance";
        iconKey = "🥇";
        createdAt = 0;
      },
      // Experience-Specific
      {
        id = "escape_master";
        name = "Escape Master";
        description = "Specialist in escape room experiences";
        category = "Experience";
        iconKey = "🗝️";
        createdAt = 0;
      },
      {
        id = "party_starter";
        name = "Party Starter";
        description = "Exceptional birthday party host";
        category = "Experience";
        iconKey = "🎂";
        createdAt = 0;
      },
      {
        id = "axe_legend";
        name = "Axe Legend";
        description = "Top-rated axe throwing guide";
        category = "Experience";
        iconKey = "🪓";
        createdAt = 0;
      },
      {
        id = "laser_commander";
        name = "Laser Commander";
        description = "Laser tag expert";
        category = "Experience";
        iconKey = "🔫";
        createdAt = 0;
      },
      {
        id = "game_show_star";
        name = "Game Show Star";
        description = "TV Game Show experience specialist";
        category = "Experience";
        iconKey = "📺";
        createdAt = 0;
      },
      // Team & Culture
      {
        id = "team_player";
        name = "Team Player";
        description = "Recognised by peers for collaboration";
        category = "Team";
        iconKey = "🤝";
        createdAt = 0;
      },
      {
        id = "mentorship_badge";
        name = "Mentorship Badge";
        description = "Helped train a new team member";
        category = "Team";
        iconKey = "🎓";
        createdAt = 0;
      },
      {
        id = "extra_mile";
        name = "Going the Extra Mile";
        description = "Above-and-beyond effort recognised by a manager";
        category = "Team";
        iconKey = "🚀";
        createdAt = 0;
      },
      // Milestones
      {
        id = "one_year";
        name = "1 Year Anniversary";
        description = "Celebrating 1 year with the company";
        category = "Milestone";
        iconKey = "🥳";
        createdAt = 0;
      },
      {
        id = "three_year";
        name = "3 Year Anniversary";
        description = "Celebrating 3 years with the company";
        category = "Milestone";
        iconKey = "🎉";
        createdAt = 0;
      },
      {
        id = "five_year";
        name = "5 Year Anniversary";
        description = "Celebrating 5 years with the company";
        category = "Milestone";
        iconKey = "🏅";
        createdAt = 0;
      },
    ];

    // Add seeded badges to map
    for (badge in seedBadges.values()) {
      badgeMap.add(badge.id, badge);
    };

    {
      badgeMap;
      staffBadgeMap;
    };
  };
};
