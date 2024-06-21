import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Header, Item, Segment, Image, Label, Rating, RatingProps } from 'semantic-ui-react';
import { Activity } from "../../../app/models/activity";
import { useStore } from '../../../app/stores/store';
import { loadStripe } from '@stripe/stripe-js';

interface Props {
  activity: Activity;
}

const ActivityDetailedHeader: React.FC<Props> = observer(({ activity }) => {
  const { activityStore: { rateActivity, loading, cancelActivityToggle, updateAttendeance, purchaseTicket } } = useStore();
  const [userRating, setUserRating] = useState<number | undefined>(activity.averageRating);
  const [ticketPurchased, setTicketPurchased] = useState<boolean>(false);
  const stripePromise = loadStripe('pk_test_51PLpOJEWVw1xAHG0Zz5XGWA6BDOk4ndH1EVWhDE4HduJHwkc7ERxwhfsDMO50sdK5DO3NQH40e5mFhV4dM1d4z20009Uy9Fkix');

  useEffect(() => {
    const checkTicketPurchase = async () => {
      console.log("Checking ticket purchase status...");
      try {
        const token = localStorage.getItem('jwt'); // Adjust key if your token is stored differently
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch(`http://localhost:5000/api/activities/${activity.id}/has-purchased`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to check ticket purchase status: ${response.statusText}`);
        }

        const hasPurchased = await response.json();
        setTicketPurchased(hasPurchased);
        console.log(`Ticket purchased for activity ${activity.id}:`, hasPurchased);
      } catch (error) {
        console.error('Error checking ticket purchase status:', error);
      }
    };

    checkTicketPurchase();
  }, [activity.id]);

  const handleRatingChange = (_e: React.MouseEvent<HTMLDivElement>, { rating }: RatingProps) => {
    if (typeof rating === 'number') {
      setUserRating(rating);
      rateActivity(activity.id, rating);
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      console.log("Initiating payment...");

      const response = await fetch('http://localhost:5000/api/activities/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe session');
      }

      const { sessionId } = await response.json();
      console.log('Payment Successful', sessionId);

      purchaseTicket(activity.id);

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
        {ticketPurchased && 
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

                {activity.requiresPayment ? (
                  <>
                    <p>Price: {activity.ticketPrice}€</p>
                    <p>{activity.ticketQuantitySold} tickets sold out of {activity.ticketQuantityAvailable}</p>
                  </>
                ) : (
                  <p>Free</p>
                )}
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
        <Button
          onClick={handlePaymentSubmit}
          color='green'
          floated='right'
          disabled={ticketPurchased || activity.isCancelled}
        >
          {ticketPurchased ? 'Ticket Purchased' : 'Purchase Ticket'}
        </Button>
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
