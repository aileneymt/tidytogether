import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import API from '../shared/services/APIClient.js';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentialsInvalid, setCredentialsInvalid] = useState(false);

  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();

    API.logIn(username, password).then(res => {
      setIsAuthenticated(true);
      navigate('/');
      window.location.reload();
    }).catch(err => {
      // failed login
      setIsAuthenticated(false);
      setCredentialsInvalid(true);
      console.error(`An error occurred while logging in ${err}`);
    });
  };

  const invalidCredentialsMsg = (
    <Typography variant='p' sx={{ color: 'red' }}>Invalid username or password</Typography>
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
          <Typography variant='h5'>Login</Typography>
          <Box component='form' onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              label='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin='normal'
            />
            <TextField
              required
              fullWidth
              label='Password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin='normal'
            />
            {credentialsInvalid ? invalidCredentialsMsg : <></>}
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Login
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
              Don't have an account?{' '}
              <a href='/register' style={{ textDecoration: 'none' }}>
                Sign Up
              </a>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
    
  );
};

export default Login;