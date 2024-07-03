import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Header, Segment, Form as SemanticForm, Checkbox, Grid } from "semantic-ui-react";
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import { v4 as uuid } from 'uuid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ActivityFormValues } from '../../../app/models/activity';
import MyDateInput from '../../../app/common/form/MyDateInput';
import MySelectInput from '../../../app/common/form/MySelectInput';
import MyTextAreaInput from '../../../app/common/form/MyTextArea';
import MyTextInput from '../../../app/common/form/MyTextInput';
import { categoryOptions } from '../../../app/common/options/categoryOptions';
import LocationPicker from '../../../app/util/LocationPicker';
import '../../../app/layout/styles.css'; 

export default observer(function ActivityForm() {
    const { activityStore } = useStore();
    const { createActivity, updateActivity, loadActivity, deleteActivity, loadingInitial } = activityStore;
    const { id } = useParams();
    const navigate = useNavigate();

    const [activityState, setActivityState] = useState<ActivityFormValues>(new ActivityFormValues());
    const [requiresPayment, setRequiresPayment] = useState(false);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const validationSchema = Yup.object({
        title: Yup.string().required('The event title is required'),
        category: Yup.string().required('The event category is required'),
        description: Yup.string().required(),
        date: Yup.string().required('Date is required').nullable(),
        venue: Yup.string().required(),
        city: Yup.string().required('City is required'),
        latitude: Yup.number().nullable(),
        longitude: Yup.number().nullable(),
        requiresPayment: Yup.boolean(),
        ticketPrice: Yup.number().when('requiresPayment', {
            is: true,
            then: (schema) => schema.required('Ticket price is required').min(0, 'Ticket price must be positive'),
            otherwise: (schema) => schema.notRequired()
        }).nullable(),
        ticketQuantityAvailable: Yup.number().when('requiresPayment', {
            is: true,
            then: (schema) => schema.required('Ticket quantity is required').min(1, 'Ticket quantity must be at least 1'),
            otherwise: (schema) => schema.notRequired()
        }).nullable()
    });

    useEffect(() => {
        if (id) {
            loadActivity(id).then(activity => {
                if (activity) {
                    setActivityState(new ActivityFormValues(activity));
                    setRequiresPayment(activity.requiresPayment);
                    setLatitude(activity.latitude);
                    setLongitude(activity.longitude);
                }
            });
        }
    }, [id, loadActivity]);

    function handleFormSubmit(activity: ActivityFormValues) {
        const updatedActivity = {
            ...activity,
            requiresPayment,
            latitude: latitude ?? 0,
            longitude: longitude ?? 0,
        };

        if (!activity.id) {
            const newActivity = {
                ...updatedActivity,
                id: uuid()
            };
            createActivity(newActivity).then(() => navigate(`/activities/${newActivity.id}`));
        } else {
            updateActivity(updatedActivity).then(() => navigate(`/activities/${activity.id}`));
        }
    }

    function handleDeleteActivity() {
        if (id) {
            deleteActivity(id).then(() => navigate('/activities'));
        }
    }

    if (loadingInitial) return <LoadingComponent content='Loading activity...' />;

    return (
        <Segment clearing>
            <Header content='Activity Details' sub color='teal' />
            <Formik
                enableReinitialize
                validationSchema={validationSchema}
                initialValues={activityState}
                onSubmit={values => handleFormSubmit(values)}>
                {({ handleSubmit, isValid, isSubmitting, dirty, values }) => {
                    const isSubmitDisabled = requiresPayment && (!values.ticketPrice || !values.ticketQuantityAvailable);

                    return (
                        <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                            <Grid>
                                <Grid.Column width={10}>
                                    <SemanticForm.Field>
                                        <label>Title</label>
                                        <MyTextInput name='title' placeholder='Title' />
                                    </SemanticForm.Field>
                                    <SemanticForm.Field>
                                        <label>Description</label>
                                        <MyTextAreaInput rows={3} name='description' placeholder='Description' />
                                    </SemanticForm.Field>
                                    <SemanticForm.Field>
                                        <label>Category</label>
                                        <MySelectInput options={categoryOptions} name='category' placeholder='Category' />
                                    </SemanticForm.Field>
                                    <SemanticForm.Field>
                                        <label>Date</label>
                                        <MyDateInput 
                                            name='date' 
                                            placeholderText='Date' 
                                            showTimeSelect 
                                            timeCaption='time' 
                                            dateFormat='MMMM d, yyyy h:mm aa' 
                                        />
                                    </SemanticForm.Field>
                                    <SemanticForm.Field>
                                        <Checkbox
                                            label='Requires Payment'
                                            checked={requiresPayment}
                                            onChange={(_e, { checked }) => setRequiresPayment(!!checked)}
                                        />
                                    </SemanticForm.Field>
                                    {requiresPayment && (
                                        <>
                                            <SemanticForm.Field>
                                                <label>Ticket Price</label>
                                                <MyTextInput name='ticketPrice' placeholder='Ticket Price' type='number' />
                                            </SemanticForm.Field>
                                            <SemanticForm.Field>
                                                <label>Ticket Quantity Available</label>
                                                <MyTextInput name='ticketQuantityAvailable' placeholder='Ticket Quantity Available' type='number' />
                                            </SemanticForm.Field>
                                        </>
                                    )}
                                </Grid.Column>
                                <Grid.Column width={6}>
                                    <Header content='Location Details' sub color='teal' />
                                    <SemanticForm.Field>
                                        <label>Venue</label>
                                        <MyTextInput name='venue' placeholder='Venue' />
                                    </SemanticForm.Field>
                                    <SemanticForm.Field>
                                        <label>City</label>
                                        <MyTextInput name='city' placeholder='City' />
                                    </SemanticForm.Field>
                                    <SemanticForm.Field>
                                        <label>Location</label>
                                        <LocationPicker
                                            onLocationSelect={(lat, lng) => {
                                                setLatitude(lat);
                                                setLongitude(lng);
                                            }}
                                        />
                                    </SemanticForm.Field>
                                </Grid.Column>
                            </Grid>

                            <Button 
                                disabled={isSubmitting || !dirty || !isValid || isSubmitDisabled} 
                                loading={isSubmitting} 
                                floated='right' 
                                positive 
                                type='submit' 
                                content='Submit' 
                            />
                            <Button as={Link} to='/activities' floated='right' type='button' content='Cancel' />

                            {id && (
                                <Button
                                    floated='left'
                                    type='button'
                                    color='red'
                                    content='Delete'
                                    onClick={handleDeleteActivity}
                                />
                            )}
                        </Form>
                    );
                }}
            </Formik>
        </Segment>
    );
});
