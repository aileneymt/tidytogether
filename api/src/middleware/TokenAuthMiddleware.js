const jwt = require('jsonwebtoken');
const TOKEN_COOKIE_NAME = "TidyTogetherToken";
const API_SECRET = process.env.API_SECRET_KEY;

function getFilteredUser(user) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    role: user.role,
    hh_id: user.hh_id
  }
}

exports.TokenMiddleware = (req, res, next) => {
  // We will look for the token in two places:
  // 1. A cookie in case of a browser
  // 2. The Authorization header in case of a different client

  let token = null;
  // possible token isn't getting sent thru cookies (if not a browser)
  if (req.cookies[TOKEN_COOKIE_NAME]) { //We do have a cookie with a token
    token = req.cookies[TOKEN_COOKIE_NAME]; //Get token from cookie
  }
  else { //No cookie, so let's check Authorization header
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith("Bearer ")) {
      //Format should be "Bearer token" but we only need the token
      token = authHeader.split(" ")[1].trim();
    }
  }

  if (token === null) {
    return res.status(401).json({ error: 'Not Authenticated' });
  }
  try {
    const payload = jwt.verify(token, API_SECRET);
    req.user = payload.user;
    next();
  } catch (error) {
    exports.removeToken(req, res); // get rid of bad token
    return res.status(401).json({ error: 'Not Authenticated' });
  }
}


exports.generateToken = (req, res, user) => {
  console.log('at generate token');
  console.log(user)
  const filteredUser = getFilteredUser(user);
  console.log('got filtered user');
  let payload = {
    user: filteredUser,
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  }
  const token = jwt.sign(payload, API_SECRET);
  console.log('about to set cookie')
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 60 * 1000, // cookie expires in 15 minutes
  });
  console.log('set cookie')

};


exports.removeToken = (req, res) => {
  res.cookie(TOKEN_COOKIE_NAME, "", {
    secure: true,
    httpOnly: true,
    expire: new Date(-1000)

  })

};