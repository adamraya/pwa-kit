import React, {useRef, useState} from 'react'
import PropTypes from 'prop-types'
import {
    Alert,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertIcon,
    Box,
    Button,
    Container,
    Stack,
    Text
} from '@chakra-ui/react'
import {useHistory} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {FormattedMessage} from 'react-intl'
import {useCheckout} from '../util/checkout-context'
import useLoginFields from '../../../components/forms/useLoginFields'
import {Section, SectionEdit, SectionSummary} from './section'
import Field from '../../../components/field'

const ContactInfo = () => {
    const history = useHistory()

    const {
        customer,
        basket,
        isGuestCheckout,
        setIsGuestCheckout,
        step,
        login,
        setCheckoutStep,
        goToNextStep
    } = useCheckout()

    const form = useForm({
        defaultValues: {email: customer?.email || basket.customerInfo?.email || '', password: ''}
    })

    const fields = useLoginFields(form)

    const [error, setError] = useState(null)
    const [signOutConfirmDialogIsOpen, setSignOutConfirmDialogIsOpen] = useState(false)

    const submitForm = async (data) => {
        setError(null)
        try {
            await login(data)
            goToNextStep()
        } catch (error) {
            setError(error.message)
        }
    }

    const toggleGuestCheckout = () => {
        if (error) {
            setError(null)
        }
        setIsGuestCheckout(!isGuestCheckout)
    }

    return (
        <Section
            id="step-0"
            title="Contact Info"
            editing={step === 0}
            onEdit={() => {
                if (!isGuestCheckout) {
                    setSignOutConfirmDialogIsOpen(true)
                } else {
                    setCheckoutStep(0)
                }
            }}
            editLabel={
                !isGuestCheckout ? <FormattedMessage defaultMessage="Sign Out" /> : undefined
            }
        >
            <SectionEdit>
                <Container variant="form">
                    <form onSubmit={form.handleSubmit(submitForm)}>
                        <Stack spacing={6}>
                            {error && (
                                <Alert status="error">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            )}

                            <Stack spacing={5}>
                                <Field {...fields.email} />
                                {!isGuestCheckout && (
                                    <Stack>
                                        <Field {...fields.password} />
                                        <Box>
                                            <Button variant="link" size="sm">
                                                <FormattedMessage defaultMessage="Forgot password?" />
                                            </Button>
                                        </Box>
                                    </Stack>
                                )}
                            </Stack>

                            <Stack spacing={3}>
                                <Button type="submit" isLoading={form.formState.isSubmitting}>
                                    {isGuestCheckout ? 'Checkout as guest' : 'Log in'}
                                </Button>
                                <Button variant="outline" onClick={toggleGuestCheckout}>
                                    {isGuestCheckout ? (
                                        <FormattedMessage defaultMessage="Already have an account? Log in" />
                                    ) : (
                                        <FormattedMessage defaultMessage="Checkout as guest" />
                                    )}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Container>
            </SectionEdit>
            <SectionSummary>
                <Text>{basket?.customerInfo?.email || customer?.email}</Text>

                <SignOutConfirmationDialog
                    isOpen={signOutConfirmDialogIsOpen}
                    onClose={() => setSignOutConfirmDialogIsOpen(false)}
                    onConfirm={async () => {
                        await customer.logout()
                        await basket.getOrCreateBasket()
                        history.replace('/')
                        setSignOutConfirmDialogIsOpen(false)
                    }}
                />
            </SectionSummary>
        </Section>
    )
}

const SignOutConfirmationDialog = ({isOpen, onConfirm, onClose}) => {
    const cancelRef = useRef()

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        <FormattedMessage defaultMessage="Sign Out" />
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <FormattedMessage
                            defaultMessage="Are you sure you want to sign out? You will need to sign back in to proceed
                        with your current order."
                        />
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} variant="outline" onClick={onClose}>
                            <FormattedMessage defaultMessage="Cancel" />
                        </Button>
                        <Button colorScheme="red" onClick={onConfirm} ml={3}>
                            <FormattedMessage defaultMessage="Sign Out" />
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}

SignOutConfirmationDialog.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func
}

export default ContactInfo
