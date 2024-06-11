import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Container, Header, Segment, Image } from "semantic-ui-react";
import { useStore } from '../../app/stores/store';
import LoginForm from '../users/LoginForm';
import RegsiterForm from '../users/RegsiterForm';
import ForgotPasswordForm from '../users/ForgotPasswordForm'; // Import the ForgotPasswordForm component

export default observer(function HomePage() {
    const { userStore, modalStore } = useStore();
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);

    const handleForgotPasswordClick = () => {
        setShowForgotPasswordForm(true);
    };

    return (
        <Segment inverted textAlign='center' vertical className='masthead'>
            <Container text>
                <Header as='h1' inverted>
                    <Image size='massive' src='/assets/logo.png' alt='logo' style={{ marginBottom: 12 }} />
                    Reactivities
                </Header>
                {userStore.isLoggedIn ? (
                    <>
                        <Header as='h2' inverted content={`Welcome back ${userStore.user?.displayName}`} />
                        <Button as={Link} to='/activities' size='huge' inverted>
                            Go to activities!
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => modalStore.openModal(<LoginForm />)} size='huge' inverted>
                            Login!
                        </Button>
                        <Button onClick={() => modalStore.openModal(<RegsiterForm />)} size='huge' inverted>
                            Register
                        </Button>
                        <Button onClick={handleForgotPasswordClick} size='huge' inverted>
                            Forgot Password?
                        </Button>
                        {showForgotPasswordForm && <ForgotPasswordForm />} {/* Conditionally render ForgotPasswordForm */}
                    </>
                )}
            </Container>
        </Segment>
    );
});
