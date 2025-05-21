import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import StarRating from '.../components/StarRating.jsx';
import { 
FiCalendar,
  FiHelpCircle,
  FiCheckCircle,
  FiArrowRight,
  FiStar,
  FiMail,
} from 'react-icons/fi';
import { PageLoader } from '../components/Loaders/script.js';
import Footer from './StudentPages/Components/Footer.jsx';
import InteractiveCalendar from '../components/InteractiveCalender.jsx';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const MenteePage = () => {
  const { 
    user, 
    loadUser, 
    logout, 
    submitFeedback,
    initializeAuth,
    initialAuthCheckComplete
  } = useAuthStore();

  const [feedback, setFeedback] = useState({
    rating: 0,
    message: '',
    suggestions: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Initialize auth and load user data
  useEffect(() => {
    if (!initialAuthCheckComplete) {
      initializeAuth();
    } else if (!user) {
      loadUser();
    } else {
      setProfileData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        profilePic: user.profilePic || ''
      });
      if (user.feedback) {
        setFeedback({
          rating: user.feedback.rating || 0,
          message: user.feedback.message || '',
          suggestions: user.feedback.suggestions || ''
        });
      }
    }
  }, [user, loadUser, initializeAuth, initialAuthCheckComplete]);

  const navigate = useNavigate();



  // Events data
  const events = [
    {
      id: 1,
      title: "JEE Advanced Strategy Webinar",
      date: "2023-11-15",
      time: "18:00",
      type: "online",
      description: "Learn advanced strategies from top rankers for JEE Advanced preparation",
      registrationLink: "#"
    },
    {
      id: 2,
      title: "Campus Tour: IIT Bombay",
      date: "2023-11-20",
      time: "10:00",
      type: "offline",
      description: "Guided tour of IIT Bombay campus with current students",
      registrationLink: "#"
    },
    {
      id: 3,
      title: "Stress Management Workshop",
      date: "2023-11-25",
      time: "15:00",
      type: "online",
      description: "Techniques to manage exam stress and anxiety",
      registrationLink: "#"
    }
  ];



  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };


  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.rating) {
      toast.error('Please provide a rating');
      return;
    }
  
    if (feedback.message.trim().length < 10) {
      toast.error('Please provide more detailed feedback (at least 10 characters)');
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      await submitFeedback(feedback);
      toast.success('Feedback submitted successfully!');
      setSubmitted(true);
      setFeedback(prev => ({ ...prev, message: '', suggestions: '' }));
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEventRegister = (eventId) => {
    toast.success(`Registered for event! We'll send you details soon.`);
    setSelectedEvent(null);
  };

  if (!user || !initialAuthCheckComplete) return <PageLoader />;


  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
    >
        {/* Navbar */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        {/* Dashboard Grid */}
        {/* Counseling Plans Section */}
        {/* YouTube Videos Section */}

        {/* Event Calendar & Workshops Section */}
        <motion.section
          id="events-section"
          variants={fadeIn}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8"
        >
          <div className="p-6">
            <h2 className="md:text-lg text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiCalendar className="mr-2 text-orange-500" />
              Events & Workshops
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="font-medium md:text-base text-sm text-gray-800 dark:text-gray-200 mb-3">Upcoming Events</h3>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg md:p-4 p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium md:text-base text-sm text-gray-900 dark:text-white">{event.title}</h4>
                          <div className="flex items-center mt-1 md:text-sm text-xs text-gray-600 dark:text-gray-400">
                            <FiCalendar className="mr-1.5" />
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            <span className="mx-1.5">•</span>
                            <span>{event.time}</span>
                            <span className="mx-1.5">•</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              event.type === 'online' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {event.type === 'online' ? 'Online' : 'In-Person'}
                            </span>
                          </div>
                        </div>
                        <button className="text-orange-500 hover:text-orange-600">
                          <FiArrowRight />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium md:text-base text-sm text-gray-800 dark:text-gray-200 mb-3">Personal Calendar</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-full">
                  <div className="md:col-span-2">
                    <InteractiveCalendar 
                      events={events} 
                      onDateSelect={setSelectedEvent} 
                    />
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => navigate('/tools/study-planner')}
                      className="w-full py-2 px-4 md:text-sm text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                    >
                      Open Study Planner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Health & Wellness Section */}
    
        {/* Tools Section */}


        {/* Important Links Section */}


        {/* Feedback & Suggestions Section */}
        <motion.section
          id="feedback-section"
          variants={fadeIn}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8"
        >
          <div className="p-6">
            <h2 className="md:text-lg text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiMail className="mr-2 text-orange-500" />
              Feedback & Suggestions
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Rate Your Experience</h3>
                
                {submitted ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                    <div className="flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-green-800 dark:text-green-200">
                        Thank you for your feedback! We appreciate your input.
                      </p>
                    </div>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-2 md:text-sm text-xs text-green-600 dark:text-green-400 hover:underline"
                    >
                      Submit another feedback
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="mb-4">
                      <StarRating 
                        rating={feedback.rating}
                        onRatingChange={(rating) => setFeedback(prev => ({ ...prev, rating }))}
                        hoverRating={hoverRating}
                        onHoverChange={setHoverRating}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="feedback-message" className="block md:text-sm text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Feedback
                      </label>
                      <textarea
                        id="feedback-message"
                        name="message"
                        value={feedback.message}
                        onChange={handleFeedbackChange}
                        rows="3"
                        className="w-full md:px-4 px-2 py-1 md:py-2 border md:text-sm text-xs border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="What do you like about our platform?"
                        required
                        minLength="10"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="feedback-suggestions" className="block md:text-sm text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Suggestions for Improvement
                      </label>
                      <textarea
                        id="feedback-suggestions"
                        name="suggestions"
                        value={feedback.suggestions}
                        onChange={handleFeedbackChange}
                        rows="3"
                        className="w-full md:px-4 px-2 py-1 md:py-2 border md:text-base text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="What features would you like to see?"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-orange-600 rounded-md md:text-sm text-xs font-medium text-white hover:bg-orange-700 transition-colors ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={!feedback.rating || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                )}
              </div>
              
              <div>
                <h3 className="font-medium md:text-base text-sm text-gray-800 dark:text-gray-200 mb-3">
                  Your Feedback History
                </h3>
                
                {user.feedback ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`h-4 w-4 ${user.feedback.rating >= star 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300 dark:text-gray-500'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(user.feedback.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {user.feedback.message && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        "{user.feedback.message}"
                      </p>
                    )}
                    
                    {user.feedback.suggestions && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Suggestion:</span> {user.feedback.suggestions}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg md:p-4 p-2 text-center">
                    <FiHelpCircle className="mx-auto md:h-8 h-5 w-5 md:w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="md:text-sm text-xs text-gray-600 dark:text-gray-400">
                      You haven't submitted any feedback yet. Your feedback helps us improve!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Help Section */}
      </main>

      {/* Footer */}
      <Footer theme={darkMode ? 'dark' : 'light'} />
    </motion.div>
  );
};


export default MenteePage;