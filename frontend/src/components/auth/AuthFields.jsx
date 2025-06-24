import React from 'react';

const AuthFields = ({ formData, onChange, showEmail = false }) => (
  <>
    <div>
      <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
        Username
      </label>
      <input
        id="username"
        name="username"
        type="text"
        required
        value={formData.username}
        onChange={onChange}
        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
        placeholder="Enter your username"
        autoComplete="username"
      />
    </div>
    {showEmail && (
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={onChange}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
          placeholder="Enter your email"
          autoComplete="email"
        />
      </div>
    )}
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        value={formData.password}
        onChange={onChange}
        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
        placeholder="Enter your password"
        autoComplete={showEmail ? "new-password" : "current-password"}
      />
    </div>
  </>
);

export default AuthFields;
