import React, { useState } from 'react';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Logging in with ${email}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm hover:shadow-2xl transition absolute md:relative top-0 md:top-auto right-0 md:right-auto">
      <h2 className="text-xl font-bold text-primary mb-4">Access Your Account</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        />
        <button
          type="submit"
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition"
        >
          Sign In
        </button>
        <p className="text-sm text-text-secondary">
          Don't have an account? <span className="text-secondary font-semibold cursor-pointer">Create one</span>
        </p>
      </form>
    </div>
  );
}