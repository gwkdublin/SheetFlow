import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { loginWithGoogle, logout } from '../lib/firebase';

interface AuthProps {
  user: any;
}

export const Auth: React.FC<AuthProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-2 group">
          <div className="flex items-center gap-3 bg-slate-50 pl-1 pr-3 py-1 rounded-full border border-slate-200">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-7 h-7 rounded-full border border-slate-200"
              />
            ) : (
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user.displayName || user.email?.split('@')[0]}
            </span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={loginWithGoogle}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:border-slate-300 shadow-sm transition-colors flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign in
        </button>
      )}
    </div>
  );
};
