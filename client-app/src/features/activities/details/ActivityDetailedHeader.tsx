import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Header, Item, Segment, Image, Label, Rating, RatingProps } from 'semantic-ui-react';
import { Activity } from "../../../app/models/activity";
import { useStore } from '../../../app/stores/store';
import { loadStripe } from '@stripe/stripe-js';

interface Props {
  activity: Activity
}

const ActivityDetailedHeader: React.FC<Props> = observer(({ activity }) => {
  const { activityStore: { rateActivity, loading, cancelActivityToggle, updateAttendeance, purchaseTicket } } = useStore();
  const [userRating, setUserRating] = useState<number | undefined>(activity.averageRating);
  const stripePromise = loadStripe('pk_test_51PLpOJEWVw1xAHG0Zz5XGWA6BDOk4ndH1EVWhDE4HduJHwkc7ERxwhfsDMO50sdK5DO3NQH40e5mFhV4dM1d4z20009Uy9Fkix');
  const [ticketPurchased, setTicketPurchased] = useState<boolean>(false);

  useEffect(() => {
    const checkTicketPurchased = async () => {
      // Check if the user has purchased a ticket for this activity
      const ticketPurchased = await checkUserPurchasedTicket(activity.id);
      setTicketPurchased(ticketPurchased);
    };

    checkTicketPurchased();
  }, [activity.id]);

  const checkUserPurchasedTicket = async (activityId: string) => {
    // Implement logic to check if the user has purchased a ticket
    // This could involve querying the database or some other method
    // For demonstration, I'll assume the check is done through an API call

    try {
      const response = await fetch(`http://localhost:5000/api/activities/tickets/check?activityId=${activityId}`);
      if (!response.ok) {
        throw new Error('Failed to check ticket status');
      }

      const { ticketPurchased } = await response.json();
      return ticketPurchased;
    } catch (error) {
      console.error('Error checking ticket status:', error);
      return false;
    }
  };

  const handleRatingChange = (e: React.MouseEvent<HTMLDivElement>, { rating }: RatingProps) => {
    if (typeof rating === 'number') {
      setUserRating(rating);
      rateActivity(activity.id, rating);
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      console.log("Initiating payment...");

      // Create a checkout session
      const response = await fetch('http://localhost:5000/api/activities/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe session');
      }

      const { sessionId } = await response.json();
      console.log('Payment Successful', sessionId);

      // Call purchaseTicket function
      purchaseTicket(activity.id);

      // Redirect to the Stripe checkout page
      const stripe = await stripePromise;
      if (!stripe) return console.log('Stripe is not loaded');
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error', error);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  return (
    <Segment.Group>
      <Segment basic attached='top' style={{ padding: '0' }}>
        {activity.isCancelled &&
          <Label style={{ position: 'absolute', zIndex: 1000, left: -14, top: 20 }} ribbon color='red' content='Cancelled' />
        }
        {ticketPurchased && // Show header if ticket is purchased
          <Header as='h2' color='green' attached='top'>Ticket Purchased</Header>
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
                {activity.requiresPayment && <p>Ticket Price: ${activity.ticketPrice}</p>}
                <p>
                  Hosted by <strong> <Link to={`/profiles/${activity.Host?.username}`}>{activity.Host?.displayName}</Link> </strong>
                </p>
                <Rating
                  icon='star'
                  defaultRating={userRating || activity.averageRating}
                  maxRating={5}
                  disabled={loading}
                  onRate={handleRatingChange}
                />
                <span style={{ marginLeft: '10px' }}>{activity.averageRating.toFixed(1)}</span>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
      </Segment>
      <Segment clearing attached='bottom'>
        <Button onClick={handlePaymentSubmit} color='green' floated='right'>Purchase Ticket</Button>
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
});

export default ActivityDetailedHeader;
