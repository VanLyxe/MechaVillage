import { Router } from 'express';
import passport from 'passport';

export const authRoutes = Router();

// Redirect to Discord OAuth
authRoutes.get('/discord', passport.authenticate('discord'));

// Discord OAuth callback
authRoutes.get('/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/game'); // Redirect to game client
  }
);

// Logout
authRoutes.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// Get current user
authRoutes.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});