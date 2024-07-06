// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.

import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Link as ChakraLink,
  Heading,
} from '@chakra-ui/react'
import {
  Field,
  FieldAttributes,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
} from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { Helmet } from 'react-helmet-async'
import AccountAPI from '@/client/idp/account'
import Logo from '@/components/common/logo'
import LayoutFull from '@/components/layout/layout-full'

type FormValues = {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
}

const SignUpPage = () => {
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false)
  const formSchema = Yup.object().shape({
    fullName: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Email is not valid')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
      .required('Confirm your password'),
  })

  const handleSubmit = useCallback(
    async (
      { fullName, email, password }: FormValues,
      { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
      try {
        await AccountAPI.create({
          fullName,
          email,
          password,
        })
        setIsConfirmationVisible(true)
      } finally {
        setSubmitting(false)
      }
    },
    [],
  )

  return (
    <LayoutFull>
      <>
        <Helmet>
          <title>Sign Up to Voltaserve</title>
        </Helmet>
        {isConfirmationVisible ? (
          <div
            className={cx(
              'flex',
              'flex-col',
              'items-center',
              'gap-2.5',
              'w-full',
            )}
          >
            <div className={cx('flex', 'flex-col', 'items-center', 'gap-1.5')}>
              <div className={cx('w-[64px]')}>
                <Logo isGlossy={true} />
              </div>
              <Heading className={cx('text-heading')}>
                Thanks! We just sent you a confirmation email
              </Heading>
              <span className={cx('text-center')}>
                Just open your inbox, find the email, and click on the
                confirmation link.
              </span>
            </div>
          </div>
        ) : null}
        {!isConfirmationVisible ? (
          <div
            className={cx(
              'flex',
              'flex-col',
              'items-center',
              'gap-2.5',
              'w-full',
            )}
          >
            <div className={cx('w-[64px]')}>
              <Logo isGlossy={true} />
            </div>
            <Heading className={cx('text-heading')}>
              Sign Up to Voltaserve
            </Heading>
            <Formik
              initialValues={{
                fullName: '',
                email: '',
                password: '',
                passwordConfirmation: '',
              }}
              validationSchema={formSchema}
              validateOnBlur={false}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className={cx('w-full')}>
                  <div
                    className={cx(
                      'flex',
                      'flex-col',
                      'items-center',
                      'gap-1.5',
                    )}
                  >
                    <Field name="fullName">
                      {({ field }: FieldAttributes<FieldProps>) => (
                        <FormControl
                          isInvalid={
                            errors.fullName && touched.fullName ? true : false
                          }
                        >
                          <Input
                            {...field}
                            id="fullName"
                            placeholder="Full name"
                            disabled={isSubmitting}
                          />
                          <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="email">
                      {({ field }: FieldAttributes<FieldProps>) => (
                        <FormControl
                          isInvalid={
                            errors.email && touched.email ? true : false
                          }
                        >
                          <Input
                            {...field}
                            id="email"
                            placeholder="Email"
                            disabled={isSubmitting}
                          />
                          <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="password">
                      {({ field }: FieldAttributes<FieldProps>) => (
                        <FormControl
                          isInvalid={
                            errors.password && touched.password ? true : false
                          }
                        >
                          <Input
                            {...field}
                            id="password"
                            placeholder="Password"
                            type="password"
                            disabled={isSubmitting}
                          />
                          <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="passwordConfirmation">
                      {({ field }: FieldAttributes<FieldProps>) => (
                        <FormControl
                          isInvalid={
                            errors.passwordConfirmation &&
                            touched.passwordConfirmation
                              ? true
                              : false
                          }
                        >
                          <Input
                            {...field}
                            id="passwordConfirmation"
                            placeholder="Confirm password"
                            type="password"
                            disabled={isSubmitting}
                          />
                          <FormErrorMessage>
                            {errors.passwordConfirmation}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Button
                      className={cx('w-full')}
                      variant="solid"
                      colorScheme="blue"
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      Sign Up
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
            <div className={cx('flex', 'flex-row', 'items-center', 'gap-0.5')}>
              <span>Already a member?</span>
              <ChakraLink as={Link} to="/sign-in">
                Sign In
              </ChakraLink>
            </div>
          </div>
        ) : null}
      </>
    </LayoutFull>
  )
}

export default SignUpPage
