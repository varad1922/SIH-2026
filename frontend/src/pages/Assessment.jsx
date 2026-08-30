import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle, XCircle, Loader2, Award, ArrowRight, AlertTriangle, Search, Clock, List, ArrowLeft, RefreshCw, Eye } from 'lucide-react';

const allTests = [
  { id: 1, topic: 'Python Programming', desc: 'Test your Python fundamentals and programming knowledge.', difficulty: 'Intermediate', qCount: 10, duration: '15 Minutes' },
  { id: 2, topic: 'Java Programming', desc: 'Assess your object-oriented programming concepts in Java.', difficulty: 'Advanced', qCount: 10, duration: '20 Minutes' },
  { id: 3, topic: 'JavaScript', desc: 'Evaluate your ES6+ skills and asynchronous JS concepts.', difficulty: 'Intermediate', qCount: 10, duration: '15 Minutes' },
  { id: 4, topic: 'Data Science', desc: 'Test knowledge on data analysis, Pandas, and statistics.', difficulty: 'Advanced', qCount: 15, duration: '25 Minutes' },
  { id: 5, topic: 'Machine Learning', desc: 'Supervised, unsupervised learning and core ML algorithms.', difficulty: 'Expert', qCount: 12, duration: '20 Minutes' },
  { id: 6, topic: 'Artificial Intelligence', desc: 'General AI principles, search algorithms, and logic.', difficulty: 'Advanced', qCount: 10, duration: '15 Minutes' },
  { id: 7, topic: 'Statistics', desc: 'Probability distributions, hypothesis testing, and inference.', difficulty: 'Intermediate', qCount: 10, duration: '15 Minutes' },
  { id: 8, topic: 'Database Management', desc: 'RDBMS concepts, normalization, and ACID properties.', difficulty: 'Intermediate', qCount: 10, duration: '15 Minutes' },
  { id: 9, topic: 'Web Development', desc: 'HTML, CSS, accessibility, and modern web architecture.', difficulty: 'Beginner', qCount: 10, duration: '10 Minutes' },
  { id: 10, topic: 'React', desc: 'Hooks, component lifecycle, and state management.', difficulty: 'Intermediate', qCount: 10, duration: '15 Minutes' },
  { id: 11, topic: 'Node.js', desc: 'Event loop, Express, and backend JS concepts.', difficulty: 'Advanced', qCount: 10, duration: '15 Minutes' },
  { id: 12, topic: 'MongoDB', desc: 'NoSQL document design, aggregations, and indexing.', difficulty: 'Intermediate', qCount: 10, duration: '15 Minutes' },
  { id: 13, topic: 'SQL', desc: 'Complex joins, subqueries, and window functions.', difficulty: 'Intermediate', qCount: 12, duration: '20 Minutes' },
  { id: 14, topic: 'Data Structures and Algorithms', desc: 'Trees, graphs, dynamic programming, and complexity.', difficulty: 'Expert', qCount: 15, duration: '30 Minutes' },
  { id: 15, topic: 'Cloud Computing', desc: 'AWS/Azure basics, serverless, and cloud architecture.', difficulty: 'Intermediate', qCount: 10, duration: '15 Minutes' },
  { id: 16, topic: 'Cybersecurity', desc: 'Network security, cryptography, and risk assessment.', difficulty: 'Advanced', qCount: 10, duration: '15 Minutes' }
];

const Assessment = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'quiz', 'results', 'review'
  
  const quizContainerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  
  const filteredTests = allTests.filter(test => test.topic.toLowerCase().includes(searchTerm.toLowerCase()));

  // Anti-cheat mechanisms
  useEffect(() => {
    if (viewMode !== 'quiz' || !questions || score !== null) return;

    const handleCheat = (reason) => {
      if (isSubmittingRef.current) return; // Prevent duplicate submissions
      isSubmittingRef.current = true;
      setAutoSubmitted(true);
      setAutoSubmitReason(reason);
      submitQuiz(true); // force submit
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        handleCheat("Your assessment was automatically submitted because you left the assessment screen (tab switch detected).");
      }
    };
    
    const handleBlur = () => {
      handleCheat("Your assessment was automatically submitted because you left the assessment screen (window lost focus).");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleCheat("Your assessment was automatically submitted because full-screen mode was exited.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [viewMode, questions, score, answers]);

  const startQuiz = async (topicObj) => {
    setSelectedTopic(topicObj);
    setIsGenerating(true);
    setScore(null);
    setAnswers({});
    setCurrentQ(0);
    setAutoSubmitted(false);
    setAutoSubmitReason('');
    isSubmittingRef.current = false;
    
    try {
      const res = await axios.post('http://localhost:5000/api/quizzes/generate', { topic: topicObj.topic });
      setQuestions(res.data.questions);
      setViewMode('quiz');
      
      // Request Fullscreen
      if (quizContainerRef.current) {
        try {
          await quizContainerRef.current.requestFullscreen();
        } catch (err) {
          console.error("Fullscreen request failed or was blocked by browser", err);
        }
      }
    } catch (error) {
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (option) => {
    setAnswers(prev => ({ ...prev, [currentQ]: option }));
  };

  const submitQuiz = (isAuto = false) => {
    if (!isAuto && isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    if (!isAuto && document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    
    setAnswers(currentAnswers => {
      let s = 0;
      questions.forEach((q, idx) => {
        if (currentAnswers[idx] === q.correctAnswer) s++;
      });
      setScore(s);
      setViewMode('results');
      return currentAnswers;
    });
  };

  const getPerformanceFeedback = (percentage) => {
    if (percentage >= 90) return { msg: "Outstanding Performance", desc: "You have an expert understanding of this topic. We recommend taking advanced practical projects." };
    if (percentage >= 70) return { msg: "Strong Performance", desc: "You have a good understanding of the fundamentals. We recommend continuing with advanced concepts." };
    if (percentage >= 50) return { msg: "Average Performance", desc: "You grasp the basics but need a bit more practice on complex concepts." };
    return { msg: "Needs Improvement", desc: "We recommend reviewing the foundational materials for this topic before retaking the assessment." };
  };

  const percentage = score !== null && questions ? Math.round((score / questions.length) * 100) : 0;
  const feedback = getPerformanceFeedback(percentage);

  return (
    <div className="max-w-7xl mx-auto" ref={quizContainerRef}>
      
      {/* 1. TOPIC SELECTION VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">Skill Assessments</h1>
              <p className="text-text-secondary font-medium">Select a topic to test your knowledge.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary-300" />
              </div>
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-xl leading-5 bg-card-bg text-text-main placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div key={test.id} className="bg-card-bg p-6 rounded-3xl shadow-sm border border-primary-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-text-main mb-2">{test.topic}</h3>
                  <p className="text-text-secondary text-sm mb-6">{test.desc}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="block text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">Difficulty</span>
                      <span className="text-sm font-semibold text-text-main">{test.difficulty}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">Questions</span>
                      <span className="text-sm font-semibold text-text-main flex items-center"><List className="w-4 h-4 mr-1"/> {test.qCount}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">Estimated Time</span>
                      <span className="text-sm font-semibold text-text-main flex items-center"><Clock className="w-4 h-4 mr-1"/> {test.duration}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => startQuiz(test)}
                  disabled={isGenerating && selectedTopic?.id === test.id}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center shadow-md disabled:opacity-70"
                >
                  {isGenerating && selectedTopic?.id === test.id ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Preparing...</>
                  ) : (
                    'Start Assessment'
                  )}
                </button>
              </div>
            ))}
          </div>
          {filteredTests.length === 0 && (
            <div className="text-center py-20">
              <Target className="w-16 h-16 text-primary-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-main mb-2">No assessments found</h3>
              <p className="text-text-secondary">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. ACTIVE QUIZ VIEW */}
      {viewMode === 'quiz' && questions && (
        <div className="bg-card-bg min-h-screen md:min-h-0 md:rounded-3xl shadow-lg border border-primary-100 flex flex-col p-6 md:p-12 h-full justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="max-w-4xl mx-auto w-full">
            
            <div className="mb-8">
              <h2 className="text-xl font-bold text-text-main text-center mb-6">{selectedTopic?.topic} Assessment</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</span>
                <span className="text-sm font-bold text-text-secondary">{Math.round(((currentQ) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-primary-100 rounded-full h-2">
                <div className="bg-accent-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQ) / questions.length) * 100}%` }}></div>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-text-main mb-8 leading-tight">{questions[currentQ].text}</h3>
            
            <div className="space-y-4 mb-10">
              {questions[currentQ].options.map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                    answers[currentQ] === opt 
                      ? 'border-primary-600 bg-primary-50 shadow-md' 
                      : 'border-primary-100 hover:border-primary-300 hover:bg-white bg-card-bg'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[currentQ] === opt ? 'border-primary-600' : 'border-primary-300'}`}>
                      {answers[currentQ] === opt && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                    </div>
                    <span className="text-lg text-text-main font-medium">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-primary-100">
              {currentQ > 0 ? (
                <button onClick={() => setCurrentQ(prev => prev - 1)} className="px-6 py-3 rounded-xl font-bold text-primary-600 hover:bg-primary-50 transition-colors border border-primary-200">
                  Previous
                </button>
              ) : <div></div>}
              
              {currentQ < questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQ(prev => prev + 1)} 
                  disabled={!answers[currentQ]}
                  className="px-8 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button 
                  onClick={() => submitQuiz(false)}
                  disabled={Object.keys(answers).length !== questions.length}
                  className="px-8 py-3 rounded-xl font-bold bg-success-600 text-white hover:bg-success-700 disabled:opacity-50 transition-colors shadow-md shadow-success-600/20"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTS VIEW */}
      {viewMode === 'results' && score !== null && (
        <div className="bg-card-bg p-8 md:p-12 rounded-3xl shadow-sm border border-primary-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {autoSubmitted && (
             <div className="mb-8 p-4 bg-red-50 text-red-800 rounded-2xl font-bold flex items-center justify-center max-w-2xl mx-auto border border-red-200 text-sm md:text-base text-left">
               <AlertTriangle className="w-8 h-8 mr-3 flex-shrink-0 text-red-600" />
               {autoSubmitReason}
             </div>
          )}

          <h2 className="text-xl font-bold text-text-secondary uppercase tracking-widest mb-2">Assessment Complete</h2>
          <h1 className="text-4xl font-black text-text-main mb-10">{selectedTopic?.topic}</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Final Score</p>
                <p className="text-3xl font-black text-primary-600">{score} <span className="text-lg text-text-secondary">/ {questions.length}</span></p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Percentage</p>
                <p className="text-3xl font-black text-accent-600">{percentage}%</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Correct</p>
                <p className="text-3xl font-black text-success-600">{score}</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Incorrect</p>
                <p className="text-3xl font-black text-red-500">{questions.length - score}</p>
             </div>
          </div>

          <div className="max-w-2xl mx-auto bg-primary-50 p-8 rounded-2xl border border-primary-200 mb-10">
             <h3 className="text-xl font-bold text-text-main mb-2">{feedback.msg}</h3>
             <p className="text-text-secondary">{feedback.desc}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             <button 
                onClick={() => setViewMode('review')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-white text-primary-700 border-2 border-primary-200 hover:bg-primary-50 transition-colors flex items-center justify-center"
             >
                <Eye className="w-5 h-5 mr-2" /> Review Answers
             </button>
             <button 
                onClick={() => startQuiz(selectedTopic)}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-accent-500 text-white border-2 border-accent-500 hover:bg-accent-600 hover:border-accent-600 transition-colors flex items-center justify-center shadow-md"
             >
                <RefreshCw className="w-5 h-5 mr-2" /> Retake Assessment
             </button>
             <button 
                onClick={() => { setViewMode('list'); setQuestions(null); setScore(null); }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center shadow-md"
             >
                Back to Assessments
             </button>
          </div>
        </div>
      )}

      {/* 4. REVIEW VIEW */}
      {viewMode === 'review' && questions && (
        <div className="bg-card-bg p-8 md:p-12 rounded-3xl shadow-sm border border-primary-100 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-center mb-8 border-b border-primary-100 pb-6">
              <div>
                 <h2 className="text-2xl font-black text-text-main">Review Answers</h2>
                 <p className="text-text-secondary">{selectedTopic?.topic}</p>
              </div>
              <button 
                onClick={() => setViewMode('results')}
                className="px-6 py-2 rounded-xl font-bold bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Results
              </button>
           </div>

           <div className="space-y-8">
            {questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              const hasAnswered = answers[idx] !== undefined;
              return (
                <div key={idx} className={`p-6 md:p-8 rounded-2xl border ${isCorrect ? 'bg-success-50/30 border-success-200' : 'bg-red-50/30 border-red-200'}`}>
                  <div className="flex items-start space-x-4">
                    {isCorrect ? <CheckCircle className="w-8 h-8 text-success-500 mt-1 flex-shrink-0" /> : <XCircle className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />}
                    <div className="flex-1">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Question {idx + 1}</span>
                      <h3 className="text-lg font-bold text-text-main mb-4 leading-relaxed">{q.text}</h3>
                      
                      <div className="bg-white p-4 rounded-xl border border-primary-100 mb-4 shadow-sm">
                         <p className="text-sm text-text-secondary mb-1">Your answer:</p>
                         <p className={`font-semibold text-lg ${isCorrect ? 'text-success-700' : 'text-red-700 ' + (hasAnswered ? 'line-through opacity-70' : '')}`}>
                            {hasAnswered ? answers[idx] : 'Not Answered'}
                         </p>
                      </div>

                      {!isCorrect && (
                         <div className="bg-success-50 p-4 rounded-xl border border-success-100 mb-4 shadow-sm">
                            <p className="text-sm text-success-800 mb-1 opacity-80">Correct answer:</p>
                            <p className="font-semibold text-lg text-success-700">{q.correctAnswer}</p>
                         </div>
                      )}
                      
                      <div className="mt-4 flex items-start space-x-2 text-sm text-text-main bg-primary-50 p-4 rounded-xl border border-primary-100">
                         <div className="font-bold text-primary-700 min-w-max">Explanation:</div>
                         <div className="text-text-secondary">{q.explanation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 flex justify-center">
             <button 
                onClick={() => setViewMode('results')}
                className="px-8 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Done Reviewing
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
