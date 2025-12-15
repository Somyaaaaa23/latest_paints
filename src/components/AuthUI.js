// Authentication UI Component
import React, { useState } from 'react';
import { LogIn, LogOut, User, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export const AuthUI = ({ auth, user, onAuthChange }) => {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Signed in:', result.user.uid);
            setEmail('');
            setPassword('');
            if (onAuthChange) onAuthChange(result.user);
        } catch (err) {
            console.error('❌ Sign in error:', err);
            setError(err.message || 'Sign in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ Signed up:', result.user.uid);
            setEmail('');
            setPassword('');
            if (onAuthChange) onAuthChange(result.user);
        } catch (err) {
            console.error('❌ Sign up error:', err);
            setError(err.message || 'Sign up failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('✅ Signed out');
            if (onAuthChange) onAuthChange(null);
        } catch (err) {
            console.error('❌ Sign out error:', err);
            setError(err.message || 'Sign out failed');
        }
    };

    // If user is authenticated, show profile
    if (user && user.uid !== 'guest') {
        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                {user.email || 'Anonymous User'}
                            </p>
                            <p className="text-xs text-gray-500">User ID: {user.uid.substring(0, 8)}...</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        );
    }

    // If Firebase auth is missing, show configuration prompt
    if (!auth) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-xl mx-auto">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Authentication Not Configured</h3>
                <p className="text-sm text-yellow-700 mb-3">
                    Firebase credentials are missing. To enable Sign In/Sign Up on production:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    <li>Set environment variables on Vercel for your project:</li>
                </ul>
                <pre className="bg-yellow-100 text-yellow-900 text-xs p-3 rounded mt-2 overflow-auto">
                    REACT_APP_FIREBASE_API_KEY=...
                    REACT_APP_FIREBASE_AUTH_DOMAIN=...
                    REACT_APP_FIREBASE_PROJECT_ID=...
                    REACT_APP_FIREBASE_STORAGE_BUCKET=...
                    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
                    REACT_APP_FIREBASE_APP_ID=...
                </pre>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1 mt-3">
                    <li>In Firebase Console → Authentication → Settings → Authorized domains, add your domain: <code>latest-paints.vercel.app</code></li>
                    <li>Redeploy after adding env vars so the build includes them.</li>
                </ul>
                <p className="text-xs text-yellow-700 mt-3">Tip: In development, put these in a <code>.env</code> file prefixed with <code>REACT_APP_</code>.</p>
            </div>
        );
    }

    // Show sign in/up form when auth is available
    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="text-center mb-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    {mode === 'signin'
                        ? 'Sign in to sync your learning preferences across devices'
                        : 'Create an account to start learning your preferences'}
                </p>
            </div>

            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-1" />
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {mode === 'signup' && (
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin');
                        setError('');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                    {mode === 'signin'
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Sign in'}
                </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                    Running in {user?.uid === 'guest' ? 'guest mode' : 'offline mode'} - Limited features
                </p>
            </div>
        </div>
    );
};

// Compact auth status indicator for header
export const AuthStatusBadge = ({ user, onClick }) => {
    if (!user) {
        return (
            <button
                onClick={onClick}
                className="flex items-center space-x-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
            >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
            </button>
        );
    }

    if (user.uid === 'guest') {
        return (
            <button
                onClick={onClick}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
            >
                <User className="w-4 h-4" />
                <span>Guest Mode</span>
            </button>
        );
    }

    return (
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
            <User className="w-4 h-4" />
            <span>{user.email?.split('@')[0] || 'User'}</span>
        </div>
    );
};
