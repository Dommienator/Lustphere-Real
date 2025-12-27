import React from 'react';
import { Upload } from 'lucide-react';

export const AuthModal = ({ 
  show, 
  onClose, 
  authMode, 
  setAuthMode,
  form, 
  setForm,
  onSignup,
  onLogin,
  handlePictureUpload 
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setForm({ ...form, role: 'client' })} className={`flex-1 py-2 rounded-lg font-semibold ${form.role === 'client' ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white' : 'bg-gray-200'}`}>
            Client 👤
          </button>
          <button onClick={() => setForm({ ...form, role: 'model' })} className={`flex-1 py-2 rounded-lg font-semibold ${form.role === 'model' ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white' : 'bg-gray-200'}`}>
            Model 💎
          </button>
        </div>

        <form onSubmit={authMode === 'login' ? onLogin : onSignup} className="space-y-4">
          {authMode === 'signup' && (
            <>
              {form.role === 'model' && (
                <>
                  <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                  
                  <input type="text" placeholder="Nickname *" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                  
                  <input type="number" placeholder="Age (18+) *" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} min="18" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                  
                  <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center hover:border-pink-500 transition">
                    <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" id="pic" />
                    <label htmlFor="pic" className="cursor-pointer">
                      {form.picturePreview ? (
                        <img src={form.picturePreview} alt="Preview" className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-4 border-pink-300" />
                      ) : (
                        <Upload className="w-10 h-10 mx-auto text-pink-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-600">{form.picturePreview ? 'Change Photo' : 'Upload Photo *'}</p>
                    </label>
                  </div>
                  
                  <input type="text" placeholder="Location (City, Country) *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                  
                  <input type="text" placeholder="Tagline (optional)" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  
                  <input type="password" placeholder="Password (8+ chars, 1 uppercase, 1 number, 1 special) *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                  
                  <input type="password" placeholder="Enter password again *" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                </>
              )}
              {form.role === 'client' && (
                <>
                  <input type="text" placeholder="Nickname *" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                  
                  <input type="password" placeholder="Password (8+ chars, 1 uppercase, 1 number, 1 special) *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                  
                  <input type="password" placeholder="Enter password again *" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
                </>
              )}
            </>
          )}
          
          <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
          
          {authMode === 'login' && (
            <input type="password" placeholder="Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
          )}
          
          <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.agreedToTerms} onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })} className="mt-1" required />
            <span>I confirm I am 18 years or older and agree to the <span className="text-purple-600 font-semibold">Terms of Service</span> and <span className="text-purple-600 font-semibold">Privacy Policy</span></span>
          </label>
          
          <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold">
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full mt-4 text-purple-600 font-semibold hover:text-purple-700">
          {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};