import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import API from '../shared/services/APIClient.js';

const Register = ({ setIsAuthenticated, setUser, setLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    } else {
      setPasswordsMatch(true);
    }

    const reqBody = { username, password, first_name, last_name }

    API.register(reqBody).then(() => {
      return API.logIn(reqBody.username, reqBody.password);
      
      
    }).then(response => {
      setIsAuthenticated(true);
      setUser(response?.user);
      setLoading(false);
      console.log("New user logged in");

      // Navigate to home page after login
      navigate('/');
    }).catch(err => {
      // failed login
      console.error(`An error occurred while creating an account: ${err}`);
      const usernameTakenPattern = /.*This username is already taken.*/;
      if (usernameTakenPattern.test(err.message)) {
        setUsernameAvailable(false);
      }
      setPasswordsMatch(password === confirmPassword);
    });
  };

  const passwordsNoMatchMsg = (
    <Typography variant='p' sx={{ color: 'red' }}>Your passwords do not match</Typography>
  )

  const usernameTakenMsg = (
    <Typography variant='p' sx={{ color: 'red' }}>This username is already taken</Typography>
  )

  return (
    <>
      <Container component='main' maxWidth='xs'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Typography variant='h5'>Register</Typography>
          <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
              required
              fullWidth
              label='First name'
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              margin='normal'
            />
            <TextField
              required
              fullWidth
              label='Last name'
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              margin='normal'
            />
            <TextField
              required
              fullWidth
              label='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin='normal'
            />
            {usernameAvailable ? <></> : usernameTakenMsg}
            <TextField
              required
              fullWidth
              label='Password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin='normal'
            />
            {passwordsMatch ? <></> : passwordsNoMatchMsg}
            <TextField
              required
              fullWidth
              label='Confirm Password'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin='normal'
            />
            {passwordsMatch ? <></> : passwordsNoMatchMsg}
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Create Account
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
              mt: 2,
            }}
          >
            <Typography variant='body2'>
              Already have an account?{' '}
              <a href='/login' style={{ textDecoration: 'none' }}>
                Log in
              </a>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
    
  );
};

export default Register;