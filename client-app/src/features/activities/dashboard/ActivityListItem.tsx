import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Item, Button, Icon, Segment, Label, Grid, List, Image, Popup } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import { Profile } from "../../../app/models/profile";
import ProfileCard from "../../profiles/ProfileCard";

interface Props {
    activity: Activity;
}

export function ActivityListItem({ activity }: Props) {
    return (
        <Segment.Group>
            
            <Segment>
                {/* Display cancelled label if activity is cancelled */}
                {activity.isCancelled && (
                    <Label attached="top" color="red" content="Cancelled" style={{ textAlign: "center" }} />
                )}
                <Item.Group>
                    <Item>
                        
                        <Item.Image style={{ marginBottom: 3 }} size='tiny' circular src={activity.Host?.image || '/assets/user.png'} />
                        <Item.Content>
                            <Item.Header as='a'>{activity.title}</Item.Header>
                            
                            <Item.Description>Hosted by <Link to={`/profiles/${activity.hostUsername}`}>{activity.Host?.displayName}</Link></Item.Description>
                            
                            {activity.isHost && (
                                <Item.Description>
                                    <Label basic color="orange">
                                        You are hosting this activity
                                    </Label>
                                </Item.Description>
                            )}
                           
                            {activity.isGoing && !activity.isHost && (
                                <Item.Description>
                                    <Label basic color="green">
                                        You are going to this activity
                                    </Label>
                                </Item.Description>
                            )}
                        </Item.Content>
                    </Item>
                </Item.Group>
            </Segment>

            
            <Segment>
                <Grid columns={2} stackable>
                    <Grid.Column>
                        
                        <span>
                            <Icon name='clock' /> {format(activity.date!, 'dd MMM yyyy h:mm aa')}
                            <Icon name='marker' /> {activity.venue}
                        </span>
                    </Grid.Column>
                    <Grid.Column textAlign="right">
                        
                        {activity.requiresPayment ? (
                            <Item.Description textAlign="right">
                                <Label color="blue">
                                    <Icon name='euro sign' /> Price: {activity.ticketPrice}€
                                </Label>
                                <p>{activity.ticketQuantitySold} tickets sold out of {activity.ticketQuantityAvailable}</p>
                            </Item.Description>
                        ) : (
                            <Item.Description>
                                <Label color="blue">
                                    Free
                                </Label>
                            </Item.Description>
                        )}
                    </Grid.Column>
                </Grid>
            </Segment>

            
            <Segment clearing>
                <span>{activity.description}</span>
                
                <Button
                    as={Link}
                    to={`/activities/${activity.id}`}
                    color='teal'
                    floated='right'
                    content='View'
                />
            </Segment>

            
            <Segment secondary>
                <List horizontal>
                    {activity.attendees?.map((attendee: Profile) => (
                        <Popup
                            key={attendee.username}
                            hoverable
                            trigger={
                                <List.Item as={Link} to={`/profiles/${attendee.username}`}>
                                    <Image
                                        size='mini'
                                        circular
                                        src={attendee.image || "/assets/user.png"}
                                        bordered
                                        style={attendee.following ? { borderColor: 'orange', borderWidth: 3 } : undefined}
                                    />
                                </List.Item>
                            }
                        >
                            <Popup.Content>
                                <ProfileCard profile={attendee} />
                            </Popup.Content>
                        </Popup>
                    ))}
                </List>
            </Segment>
        </Segment.Group>
    );
}
