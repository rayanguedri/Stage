import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Segment, Header, Button, Icon } from 'semantic-ui-react';
import agent from '../../app/api/agent';
import useQuery from '../../app/util/hooks';

const EmailSentPage = () => {
    const navigate = useNavigate();
    const email = useQuery().get('email') as string;

    const handleResendConfirmationEmail = () => {
        agent.Account.resendEmailConfirm(email)
            .then(() => {
                toast.success('Verification email resent. Please check your email');
                // Redirect to home page after successfully resending the email
                navigate('/');
            })
            .catch(error => console.error(error));
    };

    return (
        <Segment placeholder textAlign='center'>
            <Header icon color='green'>
                <Icon name='mail' />
                Email Sent!
            </Header>
            <p>A confirmation email has been sent. Please check your email inbox to verify your account.</p>
            <p>If you haven't received the email, please check your spam folder.</p>
            {email && (
                <>
                    <p>Didn't receive the email? Click the button below to resend.</p>
                    <Button primary onClick={handleResendConfirmationEmail} content='Resend Email' size='huge' />
                </>
            )}
            <p>Go back to <Link to="/">home</Link>.</p>
        </Segment>
    );
};

export default EmailSentPage;
