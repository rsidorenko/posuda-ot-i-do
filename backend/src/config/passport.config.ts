import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleConfig } from './google.config';
import { User } from '../models/User';

passport.use(
  new GoogleStrategy(
    googleConfig,
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // Проверяем, существует ли пользователь
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          // Если пользователь не существует, создаем нового
          user = await User.create({
            email: profile.emails?.[0].value,
            name: profile.displayName,
            googleId: profile.id,
            isVerified: true, // Email от Google уже верифицирован
            role: 'user' // Явно указываем роль
          });
        } else if (!user.googleId) {
          // Если пользователь существует, но не привязан к Google
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error('Google strategy error:', error);
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error);
  }
}); 