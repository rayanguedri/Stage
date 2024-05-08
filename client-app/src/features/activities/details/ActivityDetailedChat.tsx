import { Formik, Form, Field, FieldProps } from 'formik';
import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Segment, Header, Comment, Loader, Button, Icon } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
import * as Yup from 'yup';
import { formatDistanceToNow } from 'date-fns';

interface Props {
    activityId: string;
}

export default observer(function ActivityDetailedChat({ activityId }: Props) {
    const { commentStore } = useStore();
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

    useEffect(() => {
        if (activityId) {
            commentStore.createHubConnection(activityId);
        }
        return () => {
            commentStore.clearComments();
        };
    }, [commentStore, activityId]);

    const handleEditComment = async (commentId: number, body: string) => {
        await commentStore.editComment(commentId, body);
        setEditingCommentId(null); // Reset the editing state after submission
    };

    return (
        <>
            <Segment
                textAlign="center"
                attached="top"
                inverted
                color="teal"
                style={{ border: 'none' }}
            >
                <Header>Chat about this event</Header>
            </Segment>
            <Segment attached clearing>
                <Formik
                    onSubmit={(values, { resetForm }) =>
                        commentStore.addComment(values).then(() => resetForm())
                    }
                    initialValues={{ body: '' }}
                    validationSchema={Yup.object({
                        body: Yup.string().required(),
                    })}
                >
                    {({ isSubmitting, isValid, handleSubmit }) => (
                        <Form className="ui form">
                            <Field name="body">
                                {(props: FieldProps) => (
                                    <div style={{ position: 'relative' }}>
                                        <Loader active={isSubmitting} />
                                        <textarea
                                            placeholder="Enter your comment (Enter to submit, SHIFT + Enter for new line)"
                                            rows={2}
                                            {...props.field}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.shiftKey) {
                                                    return;
                                                }
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    isValid && handleSubmit();
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </Field>
                        </Form>
                    )}
                </Formik>
                <Comment.Group>
                    {commentStore.comments.map((comment) => (
                        <Comment key={comment.id}>
                            <Comment.Avatar src={comment.image || '/assets/user.png'} />
                            <Comment.Content>
                                <Comment.Author as={Link} to={`/profiles/${comment.username}`}>
                                    {comment.displayName}
                                </Comment.Author>
                                <Comment.Metadata>
                                    <div>{formatDistanceToNow(comment.createdAt)} ago</div>
                                </Comment.Metadata>
                                {editingCommentId === comment.id ? (
                                    // Form for editing the comment
                                    <Formik
                                        initialValues={{ body: comment.body }}
                                        validationSchema={Yup.object({
                                            body: Yup.string().required(),
                                        })}
                                        onSubmit={(values, { resetForm }) => {
                                            handleEditComment(comment.id, values.body);
                                            resetForm();
                                        }}
                                    >
                                        {({ isValid, isSubmitting, handleSubmit }) => (
                                            <Form className="ui form">
                                                <Field name="body">
                                                    {(props: FieldProps) => (
                                                        <div>
                                                            <Loader active={isSubmitting} />
                                                            <textarea
                                                                rows={2}
                                                                {...props.field}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        isValid && handleSubmit();
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </Field>
                                                <Button
                                                    type="submit"
                                                    content="Save"
                                                    color="green"
                                                    loading={isSubmitting}
                                                    disabled={!isValid}
                                                />
                                                <Button
                                                    type="button"
                                                    content="Cancel"
                                                    color="red"
                                                    onClick={() => setEditingCommentId(null)}
                                                />
                                            </Form>
                                        )}
                                    </Formik>
                                ) : (
                                    // Display the comment text
                                    <>
                                        <Comment.Text style={{ whiteSpace: 'pre-wrap' }}>
                                            {comment.body}
                                        </Comment.Text>
                                        <Comment.Actions>
                                            <Button
                                                color="blue"
                                                onClick={() => setEditingCommentId(comment.id)}
                                            >
                                                <Icon name="edit" /> Edit
                                            </Button>
                                            <Button
                                                color="red"
                                                onClick={() => commentStore.deleteComment(comment.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Comment.Actions>
                                    </>
                                )}
                            </Comment.Content>
                        </Comment>
                    ))}
                </Comment.Group>
            </Segment>
        </>
    );
});
