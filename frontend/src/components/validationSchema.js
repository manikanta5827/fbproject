import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup
    .string()
    .min(2,'Name min 2 characters')
    .max(20, 'Name cannot exceed 20 characters')
    .required('Name is required'),
  password: yup
    .string()
    .matches(/^[A-Z]/, 'Password must start with an uppercase letter')
    .matches(
      /(?=.*[a-z])/,
      'Password must contain at least one lowercase letter'
    )
    .matches(
      /(?=.*[A-Z])/,
      'Password must contain at least one uppercase letter'
    )
    .matches(/(?=.*\d)/, 'Password must contain at least one number')
    .matches(
      /(?=.*[@$!%*?&])/,
      'Password must contain at least one special character'
    )
    .min(6, 'Password must be at least 4 characters')
    .max(12, 'Password cannot exceed 12 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default schema;
