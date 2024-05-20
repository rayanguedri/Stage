import { Profile } from "./profile";

export interface IActivity {
  id: string;
  title: string;
  date: Date | null;
  description: string;
  category: string;
  city: string;
  venue: string;
  hostUsername: string;
  isCancelled: boolean;
  isGoing: boolean;
  isHost: boolean;
  Host?: Profile;
  attendees: Profile[];
  ratings: Rating[];
}

export class Activity implements IActivity {
  constructor(init: ActivityFormValues) {
    this.id = init.id!;
    this.title = init.title;
    this.category = init.category;
    this.description = init.description;
    this.date = init.date;
    this.city = init.city;
    this.venue = init.venue;
    this.ratings = [];
  }

  id: string;
  title: string;
  date: Date | null;
  description: string;
  category: string;
  city: string;
  venue: string;
  hostUsername: string = '';
  isCancelled: boolean = false;
  isGoing: boolean = false;
  isHost: boolean = false;
  Host?: Profile;
  attendees: Profile[] = [];
  ratings: Rating[] = [];

  get averageRating(): number {
    if (!this.ratings || this.ratings.length === 0) {
      return 0;
    }
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.value, 0);
    return totalRating / this.ratings.length;
  }

  addRating(rating: Rating) {
    this.ratings.push(rating);
  }
}

export class ActivityFormValues {
  id?: string = undefined;
  title: string = '';
  category: string = '';
  description: string = '';
  date: Date | null = null;
  city: string = '';
  venue: string = '';

  constructor(activity?: ActivityFormValues) {
    if (activity) {
      this.id = activity.id;
      this.title = activity.title;
      this.category = activity.category;
      this.description = activity.description;
      this.date = activity.date;
      this.city = activity.city;
      this.venue = activity.venue;
    }
  }
}

export interface Rating {
  id: string;
  userId: string;
  activityId: string;
  value: number;
}
