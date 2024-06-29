import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Header } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';
import ValidationError from "../errors/ValidationError";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

export default observer(function ForgotPasswordForm() {
    const { userStore } = useStore();
    const navigate = useNavigate(); // Get the navigate function from React Router
    
    return (
        <Formik
            initialValues={{ email: '', error: null }}
            onSubmit={async (values, { setErrors }) => {
                try {
                    await userStore.forgotPassword(values.email);
                    // If the forgot password request is successful, navigate to EmailSentPage
                    navigate('/email-sent');
                } catch (error) {
                    // If there's an error, handle it accordingly
                    setErrors({ error: (error as Error).message });
                }
            }}
            validationSchema={Yup.object({
                email: Yup.string().required().email(),
            })}
        >
            {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                <Form className='ui form error' onSubmit={handleSubmit} autoComplete='off'>
                    <Header as='h2' content='Forgot Password' color="teal" textAlign="center" />
                    <MyTextInput placeholder="Email" name='email' />
                    <ErrorMessage name='error' render={() => 
                        <ValidationError errors={errors.error as unknown as string[]} />} />
                    <Button
                        disabled={!isValid || !dirty || isSubmitting} 
                        loading={isSubmitting} 
                        positive content='Send Reset Link' 
                        type="submit" fluid 
                    />
                </Form>
            )}
        </Formik>
    );
});
