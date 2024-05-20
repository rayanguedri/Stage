import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Header, Item, Segment, Image, Label, Rating, RatingProps } from 'semantic-ui-react';
import { Activity } from "../../../app/models/activity";
import { useStore } from '../../../app/stores/store';

interface Props {
  activity: Activity
}

export default observer(function ActivityDetailedHeader({ activity }: Props) {
  const { activityStore: { rateActivity, loading, cancelActivityToggle, updateAttendeance } } = useStore();
  const [userRating, setUserRating] = useState<number | undefined>(activity.averageRating);

  const handleRatingChange = (e: React.MouseEvent<HTMLDivElement>, { rating }: RatingProps) => {
    if (typeof rating === 'number') { // Check if rating is a number
      setUserRating(rating);
      rateActivity(activity.id, rating); // Update the rating in the store
    }
  };

  return (
    <Segment.Group>
      <Segment basic attached='top' style={{ padding: '0' }}>
        {activity.isCancelled &&
          <Label style={{ position: 'absolute', zIndex: 1000, left: -14, top: 20 }} ribbon color='red' content='Cancelled' />
        }
        <Image src={`/assets/categoryImages/${activity.category}.jpg`} fluid />
        <Segment basic>
          <Item.Group>
            <Item>
              <Item.Content>
                <Header
                  size='huge'
                  content={activity.title}
                />
                <p>{activity.date?.toLocaleDateString()}</p>
                <p>
                  Hosted by <strong> <Link to={`/profiles/${activity.Host?.username}`}>{activity.Host?.displayName}</Link> </strong>
                </p>
                <Rating
                  icon='star'
                  defaultRating={userRating || activity.averageRating}
                  maxRating={5}
                  disabled={loading}
                  onRate={handleRatingChange} // Handle rating change
                />
                <span style={{ marginLeft: '10px' }}>{activity.averageRating.toFixed(1)}</span>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
      </Segment>
      <Segment clearing attached='bottom'>
        {activity.isHost ? (
          <>
            <Button
              color={activity.isCancelled ? 'green' : 'red'}
              floated='left'
              basic
              content={activity.isCancelled ? 'Re-activate activity' : 'Cancel Activity'}
              onClick={cancelActivityToggle}
              loading={loading}
            />
            <Button as={Link} disabled={activity.isCancelled} to={`/manage/${activity.id}`} color='orange' floated='right'>
              Manage Event
            </Button>
          </>
        ) : activity.isGoing ? (
          <Button loading={loading} onClick={updateAttendeance}>Cancel attendance</Button>
        ) : (
          <Button disabled={activity.isCancelled} loading={loading} onClick={updateAttendeance} color='teal'>Join Activity</Button>
        )}
      </Segment>
    </Segment.Group>
  );
})
