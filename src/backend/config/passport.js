import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/index.js';

const configurePassport = () => {
    // Serialize user for session (or token payload)
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    // GOOGLE STRATEGY
    console.log('🔍 Passport Config Check:');
    console.log('GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET present:', !!process.env.GOOGLE_CLIENT_SECRET);

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: '/api/auth/google/callback',
                    passReqToCallback: true
                },
                async (req, accessToken, refreshToken, profile, done) => {
                    try {
                        console.log('Google Profile:', profile);
                        const email = profile.emails[0].value;
                        const googleId = profile.id;
                        const firstName = profile.name.givenName;
                        const lastName = profile.name.familyName;

                        // Check if user exists by googleId
                        let user = await User.findOne({ where: { googleId } });

                        if (user) {
                            return done(null, user);
                        }

                        // Check if user exists by email
                        user = await User.findOne({ where: { email } });

                        if (user) {
                            // Context: User exists with email but not linked to Google
                            // Update user with googleId
                            await user.update({ googleId });
                            return done(null, user);
                        }

                        // Create new user
                        user = await User.create({
                            name: `${firstName} ${lastName}`,
                            email,
                            role: 'user',
                            googleId
                        });

                        return done(null, user);
                    } catch (err) {
                        console.error('Google Auth Error:', err);
                        return done(err, null);
                    }
                }
            )
        );
    } else {
        console.warn('⚠️ Google Client ID/Secret not found. Google Auth disabled.');
    }

    // FACEBOOK STRATEGY
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        passport.use(
            new FacebookStrategy(
                {
                    clientID: process.env.FACEBOOK_APP_ID,
                    clientSecret: process.env.FACEBOOK_APP_SECRET,
                    callbackURL: '/api/auth/facebook/callback',
                    profileFields: ['id', 'emails', 'name', 'photos'],
                    passReqToCallback: true
                },
                async (req, accessToken, refreshToken, profile, done) => {
                    try {
                        console.log('Facebook Profile:', profile);
                        const email = profile.emails ? profile.emails[0].value : null; // Facebook might not return email
                        const facebookId = profile.id;
                        const firstName = profile.name.givenName;
                        const lastName = profile.name.familyName;

                        // Check by facebookId
                        let user = await User.findOne({ where: { facebookId } });
                        if (user) return done(null, user);

                        // Check by email if exists
                        if (email) {
                            user = await User.findOne({ where: { email } });
                            if (user) {
                                await user.update({ facebookId });
                                return done(null, user);
                            }
                        }

                        // Create user
                        // Note: If no email from FB, we might need a placeholder or handle error. 
                        // For now assuming email exists or generating logic.
                        // If email missing, creating account might fail if email is null in DB (schema says allowNull: false).
                        if (!email) {
                            return done(new Error('Facebook account does not provide email'), null);
                        }

                        user = await User.create({
                            name: `${firstName} ${lastName}`,
                            email,
                            role: 'user',
                            facebookId
                        });

                        return done(null, user);

                    } catch (err) {
                        console.error('Facebook Auth Error:', err);
                        return done(err, null);
                    }
                }
            )
        );
    } else {
        console.warn('⚠️ Facebook App ID/Secret not found. Facebook Auth disabled.');
    }
};

export default configurePassport;
