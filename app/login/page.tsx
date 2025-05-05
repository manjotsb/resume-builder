'use client'
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/navigation"
import {FaFacebook, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showMagicLinkModal, setShowMagicLinkModal] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const router = useRouter()

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setMagicLinkSent(false);
    setSuccessMessage(null);
  }, [activeTab]);

  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      
      setSuccessMessage('Login successful!');
      
      // Add a small delay before redirecting to show the success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500);
    } catch (error: any) {
      setError(error.message)
      console.log("Login error:", error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setShowSuccessMessage(false);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      if (error) throw error
      
      setSuccessMessage('Account created successfully!');
      setShowSuccessMessage(true);
      
      // Add a small delay before redirecting to show the success message
      setTimeout(() => {
        setActiveTab('login');
        setShowSuccessMessage(false);
        setSuccessMessage(null);
      }, 1500);
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const handleSSO = async (provider: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMagicLinkSent(false);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error
      setMagicLinkSent(true);
      setSuccessMessage('Magic link sent! Check your email.');
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowMagicLinkModal(false);
        setMagicLinkEmail('');
      }, 2000);
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-7xl bg-white rounded-2xl shadow-xl relative overflow-hidden">
        {/* Left side - SignUp */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 mx-auto my-auto">
          <AnimatePresence>
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 0 }}
              animate={{ 
                opacity: 1, 
                x: activeTab === 'signup' ? 40 : 0,
                transition: { duration: 0.3 }
              }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSignup}
              className="space-y-6 mx-16"
            >
            <h1 className="text-center text-4xl font-bold tracking-wider">Create Account</h1>
            {/* Social Login */}
            <div className="mt-8 mb-4">
              <div className="mb-6 flex justify-center space-x-5">
                <button
                  onClick={() => handleSSO('google')}
                  className="inline-flex justify-center p-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <FcGoogle className="h-6 w-6 text-black" />
                </button>
                <button
                  onClick={() => handleSSO('facebook')}
                  className="group justify-center p-4 border border-gray-300 rounded-md shadow-sm bg-[#1877F2] text-sm font-medium text-gray-500 hover:bg-white disabled:opacity-50"
                  disabled={isLoading}
                >
                  <FaFacebook className="h-5 w-5 text-white group-hover:text-[#1877F2]" />
                </button>
                <button
                  onClick={() => handleSSO('apple')}
                  className="justify-center p-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <FaApple className="h-6 w-6 text-black" />
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 disabled:opacity-50"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash size={20}/> : <FaEye size={20}/>}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              {error && (
                <div className="text-red-600 text-center">
                  {error}
                </div>
              )}
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Right side - Login */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="max-w-md mt-10 mx-auto">
            <AnimatePresence mode="wait">
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: activeTab === 'login' ? -40 : 0,
                  transition: { duration: 0.3 }
                }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-6 mx-16"
              >
                <h1 className="text-center text-4xl font-bold tracking-wider">Sign In</h1>
                {/* Social Login */}
                <div className="mb-8">
                  <div className="mb-6 flex justify-center space-x-5">
                    <button
                      onClick={() => handleSSO('google')}
                      className="inline-flex justify-center p-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <FcGoogle className="h-6 w-6 text-black" />
                    </button>
                    <button
                    onClick={() => handleSSO('facebook')}
                    className="group justify-center p-4 border border-gray-300 rounded-md shadow-sm bg-[#1877F2] text-sm font-medium text-gray-500 hover:bg-white disabled:opacity-50"
                    disabled={isLoading}>
                      <FaFacebook className="h-5 w-5 text-white group-hover:text-[#1877F2]" />
                    </button>
                    <button
                      onClick={() => handleSSO('apple')}
                      className="justify-center p-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <FaApple className="h-6 w-6 text-black" />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 disabled:opacity-50"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      tabIndex={-1}
                      disabled={isLoading}
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMagicLinkModal(true);
                    setMagicLinkEmail('');
                    setError(null);
                  }}
                  className="w-full text-blue-600 py-2 font-medium hover:text-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Sign in with Magic Link
                </button>
                {error && (
                  <div className="text-red-600 text-center">
                    {error}
                  </div>
                )}
              </motion.form>
            </AnimatePresence>
          </div>
        </div>

        {/* Animated Overlay */}
        <motion.div
          className="absolute top-0 w-1/2 h-full bg-blue-600 flex items-center justify-center"
          initial={{ x: 0 }}
          animate={{ x: activeTab === 'signup' ? '100%' : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="text-center text-white p-8">
            {/* <div className="flex justify-between items-center">
              <Image src={'/llama_logo.png'} width={50} height={50} alt="Company logo" className="rounded-md" />
            </div> */}
            <h2 className="text-3xl tracking-wide font-bold mb-3">
              {activeTab === 'login' ? 'New Here?' : 'Already have an account?'}
            </h2>
            <p className="text-xl mb-8">
              {activeTab === 'login' 
                ? 'Create an account to start building your professional resume'
                : 'Sign in to access your account and manage your resumes'}
            </p>
            <button
              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {activeTab === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </motion.div>

        {/* Success Message Overlay */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-green-400 text-white font-semibold border border-green-700 tracking-wide px-6 py-3 rounded-lg shadow-lg">
                {successMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Magic Link Modal */}
        <AnimatePresence>
          {showMagicLinkModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">Sign in with Magic Link</h2>
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      value={magicLinkEmail}
                      onChange={e => setMagicLinkEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMagicLinkModal(false);
                        setMagicLinkEmail('');
                        setError(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Magic Link'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}