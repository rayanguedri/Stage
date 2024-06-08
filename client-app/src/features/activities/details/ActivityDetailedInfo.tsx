import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Segment, Grid, Icon, Button } from 'semantic-ui-react'
import { Activity } from "../../../app/models/activity";
/* import { useStore } from '../../../app/stores/store';
 */import { loadStripe } from '@stripe/stripe-js';

/* import stripePromise from '../../../app/util/stripeInstance';
 */interface Props {
    activity: Activity
}


const ActivityDetailedInfo: React.FC<Props> = ({ activity }) => {
/*     const { activityStore } = useStore();
 */
/* const {handlepayment} = activityStore;
 */
const stripePromise = loadStripe('pk_test_51PLpOJEWVw1xAHG0Zz5XGWA6BDOk4ndH1EVWhDE4HduJHwkc7ERxwhfsDMO50sdK5DO3NQH40e5mFhV4dM1d4z20009Uy9Fkix');

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

        // Redirect to the Stripe checkout page
        const stripe = await stripePromise;
        if(!stripe) return console.log('Stripe is not loaded');
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
            <Segment attached='top'>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={15}>
                        <p>{activity.description}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
            <Segment attached>
                <Grid verticalAlign='middle'>
                    <Grid.Column width={1}>
                        <Icon name='calendar' size='large' color='teal' />
                    </Grid.Column>
                    <Grid.Column width={15}>
                        <span>
                            {format(activity.date!, 'dd MMM yyyy h:mm aa')}
                        </span>
                    </Grid.Column>
                </Grid>
            </Segment>
            <Segment attached>
                <Grid verticalAlign='middle'>
                    <Grid.Column width={1}>
                        <Icon name='marker' size='large' color='teal' />
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <span>{activity.venue}, {activity.city}</span>
                    </Grid.Column>
                </Grid>
            </Segment>
            
                <Button onClick={handlePaymentSubmit} color='teal' content='Pay Now' />
        </Segment.Group>
    )
}

export default observer(ActivityDetailedInfo);
