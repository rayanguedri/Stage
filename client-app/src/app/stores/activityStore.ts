import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Activity, ActivityFormValues } from "../models/activity";
import agent from "../api/agent";
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { store } from "./store";
import { Profile } from "../models/profile";
import { Pagination, PagingParams } from "../models/pagination";
import { Statistics } from "../models/statistics"; 
import  LocationStore  from "./locationStore";



export default class ActivityStore {
    activityRegistry = new Map<string, Activity>();
    selectedActivity?: Activity = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;
    statistics: Statistics | null = null;
    pagination: Pagination | null = null;
    pagingParams = new PagingParams();
    predicate = new Map().set('all', true); // tfiltri bel date
    searchQuery: string = '';
    locationStore: LocationStore; 
   

    constructor(locationStore: LocationStore) {
        this.locationStore = locationStore;
        makeAutoObservable(this)
        
        reaction(
            () => this.locationStore.userLocation,
            () => {
                if (this.locationStore.userLocation) {
                    this.sortActivitiesByProximity();
                }
            }
        );

        reaction(
            () => Array.from(this.predicate.keys()),
            () => {
                this.pagingParams = new PagingParams();
                this.activityRegistry.clear();
                this.loadActivities();
            }
        );
    }



    sortActivitiesByProximity = () => {
        const { userLocation } = this.locationStore;
        if (!userLocation) return;

        const { latitude: userLat, longitude: userLng } = userLocation;
        const activities = Array.from(this.activityRegistry.values());

        activities.sort((a, b) => {
            const distanceA = this.calculateDistance(userLat, userLng, a.latitude!, a.longitude!);
            const distanceB = this.calculateDistance(userLat, userLng, b.latitude!, b.longitude!);
            return distanceA - distanceB;
        });

        this.activityRegistry = new Map(activities.map((activity) => [activity.id, activity]));
    };


    private calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    private deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };



    

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPredicate = (predicate: string, value: string | Date) => {
        const resetPredicate = () => {
            this.predicate.forEach((_value, key) => {
                if (key !== 'startDate' && key !== 'sortByProximity') this.predicate.delete(key);
            });
        }
    
        switch (predicate) {
            case 'all':
                resetPredicate();
                this.predicate.set('all', true);
                break;
            case 'isGoing':
                resetPredicate();
                this.predicate.set('isGoing', true);
                break;
            case 'isHost':
                resetPredicate();
                this.predicate.set('isHost', true);
                break;
            case 'startDate':
                this.predicate.delete('startDate');
                this.predicate.set('startDate', value);
                break;
            case 'sortByProximity':
                resetPredicate();
                this.predicate.set('sortByProximity', value);
                break;
        }
        this.loadActivities();
    }

    setSearchQuery = (query: string) => {
        this.searchQuery = query;
        this.pagingParams = new PagingParams();
        this.activityRegistry.clear();
        this.loadActivities();
    }

    clearSearchQuery = () => {
        this.searchQuery = '';
    }
    get axiosParams() {
        const params = new URLSearchParams();
        params.append('pageNumber', this.pagingParams.pageNumber.toString());
        params.append('pageSize', this.pagingParams.pageSize.toString());
        
        this.predicate.forEach((value, key) => {
            if (key === 'startDate') {
                params.append(key, (value as Date).toISOString());
            } else if (key === 'sortByProximity') {
                return;
            } else {
                params.append(key, value.toString());
            }
        });

        if (this.searchQuery) {
            params.append('searchTerm', this.searchQuery);
        }
        
        return params;
    }

    searchActivities = async () => {
        this.setLoadingInitial(true);
        try {
            const result = await agent.Activities.list(this.axiosParams);
            runInAction(() => {
                this.activityRegistry.clear();
                result.data.forEach(activity => {
                    this.setActivity(activity);
                });
                this.setPagination(result.pagination);
                this.setLoadingInitial(false);
            });
        } catch (error) {
            console.log('Error searching activities:', error);
            this.setLoadingInitial(false);
        }
    }
    get groupedActivities() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMM yyyy');
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as { [key: string]: Activity[] })
        );
    }

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b) =>
            a.date!.getTime() - b.date!.getTime());
    }

    loadActivities = async () => {
        this.setLoadingInitial(true);
        try {
            const result = await agent.Activities.list(this.axiosParams);
            runInAction(() => {
                result.data.forEach((activity) => {
                    this.setActivity(activity);
                });
                this.setPagination(result.pagination);
                if (this.predicate.get('sortByProximity') === 'true' && this.locationStore.userLocation) {
                    this.sortActivitiesByProximity();
                }
            });
        } catch (error) {
            console.error('Error loading activities', error);
        } finally {
            runInAction(() => {
                this.setLoadingInitial(false);
            });
        }
    };
    

    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }

    loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.selectedActivity = activity;
            return activity;
        }
        else {
            this.setLoadingInitial(true);
            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
                runInAction(() => this.selectedActivity = activity);
                this.setLoadingInitial(false);
                return activity;
            } catch (error) {
                console.log(error);
                this.setLoadingInitial(false);
            }
        }
    }

    private setActivity = (activity: Activity) => {
        const user = store.userStore.user;
        if (user) {
            activity.isGoing = activity.attendees!.some(
                a => a.username === user.username
            );
            activity.isHost = activity.hostUsername === user.username;
            activity.Host = activity.attendees?.find(x => x.username === activity.hostUsername);
        }
        activity.date = new Date(activity.date!);
        this.activityRegistry.set(activity.id, activity);
    }

    private getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    createActivity = async (activity: ActivityFormValues) => {
        const user = store.userStore.user;
        const attendee = new Profile(user!);

        activity.id = uuid();
        try {
            await agent.Activities.create(activity);
            const newActivity = new Activity(activity);
            newActivity.hostUsername = user!.username;
            newActivity.attendees = [attendee];
            this.setActivity(newActivity);
            runInAction(() => {
                this.selectedActivity = newActivity;

            })
        } catch (error) {
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    updateActivity = async (activity: ActivityFormValues) => {

        try {
            await agent.Activities.update(activity)
            runInAction(() => {
                if (activity.id) {
                    const updatedActivity = { ...this.getActivity(activity.id), ...activity };
                    this.activityRegistry.set(activity.id, updatedActivity as Activity);
                    this.selectedActivity = updatedActivity as Activity;
                }
            })
        } catch (error) {
            console.log(error);

        }
    }

    deleteActivity = async (id: string) => {
        this.loading = true;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
                this.loading = false;
            })
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    updateAttendeance = async () => {
        const user = store.userStore.user;
        this.loading = true;
        try {
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(() => {
                if (this.selectedActivity?.isGoing) {
                    this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(a => a.username !== user?.username);
                    this.selectedActivity.isGoing = false;
                } else {
                    const attendee = new Profile(user!);
                    this.selectedActivity?.attendees?.push(attendee);
                    this.selectedActivity!.isGoing = true;
                }
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            })
        } catch (error) {
            console.log(error);
        } finally {
            runInAction(() => this.loading = false);
        }
    }

    cancelActivityToggle = async () => {
        this.loading = true;
        try {
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(() => {
                this.selectedActivity!.isCancelled = !this.selectedActivity!.isCancelled;
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            })
        } catch (error) {
            console.log(error);
        } finally {
            runInAction(() => this.loading = false);
        }
    }
    

    clearSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    updateAttendeeFollowing = (username: string) => {
        this.activityRegistry.forEach(activity => {
            activity.attendees.forEach((attendee: Profile) => {
                if (attendee.username === username) {
                    attendee.following ? attendee.followersCount-- : attendee.followersCount++;
                    attendee.following = !attendee.following;
                }
            })
        })
    }

    rateActivity = async (activityId: string, ratingValue: number) => {
        try {
            const user = store.userStore.user;
            if (!user) {
                console.error('User not found.');
                return;
            }

            await agent.Activities.rate(activityId, ratingValue);
            runInAction(() => {
                const activity = this.getActivity(activityId);
                if (activity) {
                    // Ensure the ratings array exists and initialize if necessary
                    if (!activity.ratings) {
                        activity.ratings = [];
                    }
                    // Push the new rating to the ratings array
                    activity.ratings.push({ id: uuid(), userId: user.username, activityId, value: ratingValue });
                } else {
                    console.error(`Activity with ID ${activityId} not found.`);
                }
            });
        } catch (error) {
            console.log('Error rating activity: ', error);
        }
    }

    checkIfUserPurchasedTicket = async (activityId: string) => {
        try {
            const user = store.userStore.user;
            if (!user) {
                return;
            }

            const hasPurchased = await agent.Activities.checkIfUserHasPurchasedTicket(activityId);
            if (hasPurchased) {
                runInAction(() => {
                    const activity = this.getActivity(activityId);
                    if (activity) {
                        activity.userHasPurchased = true;
                    }
                });
            }
        } catch (error) {
            console.error(`Error checking if user purchased ticket for activity ${activityId}:`, error);
        }
    }
    

    purchaseTicket = async (activityId: string) => {
        try {
            await agent.Activities.purchaseTicket(activityId);
            runInAction(() => {
                const activity = this.getActivity(activityId);
                if (activity) {
                    activity.ticketQuantitySold += 1; // Assuming ticket quantity sold increases by 1 on each purchase
                    activity.ticketQuantityAvailable -= 1; // Assuming ticket quantity available decreases by 1 on each purchase
                }
            });
        } catch (error) {
            console.error('Error purchasing ticket:', error);
        }
    }

    handlepayment = async() => {

       try {
        await agent.Activities.makePayment()
        runInAction(() => {
            console.log("payment is good ")
            
           /*  const activity = this.getActivity();
            if (activity) {
                activity.ticketQuantitySold += 1; // Assuming ticket quantity sold increases by 1 on each purchase
                activity.ticketQuantityAvailable -= 1; // Assuming ticket quantity available decreases by 1 on each purchase
            } */
        });
        } catch (error) {
            console.error('Error initiating payment:', error);
        }
    }

    loadStatistics = async () => {
        try {
            const statistics = await agent.StatisticsAPI.getStatistics();
            runInAction(() => {
                this.statistics = statistics;
            });
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };
}
