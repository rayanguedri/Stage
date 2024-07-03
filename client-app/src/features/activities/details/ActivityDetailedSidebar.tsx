import { useState } from 'react';
import { Segment, List, Label, Item, Image, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Activity } from '../../../app/models/activity';

interface Props {
    activity: Activity;
}

export default observer(function ActivityDetailedSidebar({ activity: { attendees, Host } }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!attendees) return null;

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredAttendees = attendees.filter(attendee =>
        attendee.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Segment
                textAlign='center'
                style={{ border: 'none' }}
                attached='top'
                secondary
                inverted
                color='teal'
            >
                {attendees.length} {attendees.length === 1 ? 'Person' : 'People'} Going
            </Segment>
            <Segment attached>
                <Input
                    icon='search'
                    placeholder='Search attendees...'
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ marginBottom: '1em' }}
                    fluid
                />
                <List relaxed divided>
                    {filteredAttendees.map(attendee => (
                        <Item style={{ position: 'relative' }} key={attendee.username}>
                            {attendee.username === Host?.username && (
                                <Label
                                    style={{ position: 'absolute' }}
                                    color='orange'
                                    ribbon='right'
                                >
                                    Host
                                </Label>
                            )}
                            <Image size='tiny' src={attendee.image || '/assets/user.png'} />
                            <Item.Content verticalAlign='middle'>
                                <Item.Header as='h3'>
                                    <Link to={`/profiles/${attendee.username}`}>
                                        {attendee.displayName}
                                    </Link>
                                </Item.Header>
                                {attendee.following && (
                                    <Item.Extra style={{ color: 'orange' }}>
                                        Following
                                    </Item.Extra>
                                )}
                            </Item.Content>
                        </Item>
                    ))}
                </List>
            </Segment>
        </>
    );
});
