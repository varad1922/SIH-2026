import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  RotateCcw,
  Award,
} from 'lucide-react';

const STORAGE_KEY = 'skill-intel-learning-progress';

const MODULES = [
  {
    id: 'module-1',
    number: 1,
    title: 'AI and Data Fundamentals',
    duration: '45 min',
    description:
      'Build a strong foundation in artificial intelligence, data concepts, and their practical applications.',
    lessons: [
      {
        title: 'Introduction to Artificial Intelligence',
        content:
          'Artificial Intelligence enables computer systems to perform tasks that normally require human intelligence. It can support learning, reasoning, pattern recognition, automation, and decision-making.',
      },
      {
        title: 'Understanding Data',
        content:
          'Data is the foundation of modern digital systems. Information can be collected, processed, analysed, and transformed into meaningful insights that support better decisions.',
      },
      {
        title: 'AI in Practical Applications',
        content:
          'AI and data technologies can improve efficiency, automate repetitive processes, identify patterns, and support structured decision-making.',
      },
    ],
  },
  {
    id: 'module-2',
    number: 2,
    title: 'Practical Application Exercise',
    duration: '1.5 hrs',
    description:
      'Apply AI and data concepts through practical examples and structured exercises.',
    lessons: [
      {
        title: 'Identifying the Problem',
        content:
          'Start by clearly understanding the problem. Define what needs improvement and identify the expected outcome before selecting a technical solution.',
      },
      {
        title: 'Selecting Relevant Data',
        content:
          'Choose information that is relevant, reliable, and useful for solving the identified problem.',
      },
      {
        title: 'Applying the Solution',
        content:
          'Use structured reasoning to apply the concepts learned and evaluate whether the selected approach solves the problem effectively.',
      },
    ],
  },
  {
    id: 'module-3',
    number: 3,
    title: 'Applied AI and Decision Making',
    duration: '2 hrs',
    description:
      'Learn how AI and data can support structured and responsible decision-making.',
    lessons: [
      {
        title: 'Data-Driven Decisions',
        content:
          'Strong decisions combine domain knowledge with relevant evidence, data analysis, and careful evaluation.',
      },
      {
        title: 'Evaluating AI Results',
        content:
          'AI-generated recommendations should always be evaluated for relevance, accuracy, fairness, and possible limitations.',
      },
      {
        title: 'Applied Decision Scenario',
        content:
          'Use the concepts from the complete learning path to evaluate a practical situation and select an appropriate solution.',
      },
    ],
  },
];

const Learning = () => {
  const [progress, setProgress] = useState({});
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const modules = useMemo(() => {
    return MODULES.map((module) => ({
      ...module,
      progressData: progress[module.id] || {
        started: false,
        completed: false,
        lessonIndex: 0,
      },
    }));
  }, [progress]);

  const activeModule = modules.find(
    (module) => module.id === activeModuleId
  );

  const getStatus = (module) => {
    if (module.progressData.completed) return 'Completed';
    if (module.progressData.started) return 'In Progress';
    return 'Not Started';
  };

  const openModule = (module) => {
    const lessonIndex = module.progressData.lessonIndex || 0;

    setActiveModuleId(module.id);
    setActiveLessonIndex(lessonIndex);

    setProgress((previous) => ({
      ...previous,
      [module.id]: {
        ...previous[module.id],
        started: true,
        completed: previous[module.id]?.completed || false,
        lessonIndex,
      },
    }));
  };

  const changeLesson = (index) => {
    if (!activeModule) return;

    setActiveLessonIndex(index);

    setProgress((previous) => ({
      ...previous,
      [activeModule.id]: {
        ...previous[activeModule.id],
        started: true,
        completed: previous[activeModule.id]?.completed || false,
        lessonIndex: index,
      },
    }));
  };

  const markModuleComplete = () => {
    if (!activeModule) return;

    setProgress((previous) => ({
      ...previous,
      [activeModule.id]: {
        started: true,
        completed: true,
        lessonIndex: activeModule.lessons.length - 1,
      },
    }));
  };

  const markAsUnreviewed = () => {
    if (!activeModule) return;

    setProgress((previous) => ({
      ...previous,
      [activeModule.id]: {
        started: false,
        completed: false,
        lessonIndex: 0,
      },
    }));

    setActiveLessonIndex(0);
  };

  if (activeModule) {
    const currentLesson =
      activeModule.lessons[activeLessonIndex];

    const isCompleted =
      activeModule.progressData.completed;

    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <button
          onClick={() => setActiveModuleId(null)}
          className="inline-flex items-center gap-2 mb-8 text-text-secondary hover:text-secondary-700 font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to My Learning
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* LESSON LIST */}
          <aside className="bg-card-bg border border-border-main rounded-2xl p-5 h-fit">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-secondary-600 mb-2">
              Module {activeModule.number}
            </p>

            <h2 className="text-xl font-bold text-text-main mb-6">
              {activeModule.title}
            </h2>

            <div className="space-y-2">
              {activeModule.lessons.map((lesson, index) => (
                <button
                  key={lesson.title}
                  onClick={() => changeLesson(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    activeLessonIndex === index
                      ? 'bg-secondary-600 text-white'
                      : 'text-text-main hover:bg-secondary-50'
                  }`}
                >
                  <p className="text-xs font-bold opacity-70 mb-1">
                    LESSON {index + 1}
                  </p>

                  <p className="text-sm font-bold">
                    {lesson.title}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="bg-card-bg border border-border-main rounded-2xl p-6 lg:p-10">

            <div className="flex flex-wrap justify-between gap-5 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-secondary-600 mb-3">
                  MODULE {activeModule.number} · LESSON{' '}
                  {activeLessonIndex + 1}
                </p>

                <h1 className="text-3xl lg:text-4xl font-black text-text-main">
                  {currentLesson.title}
                </h1>
              </div>

              {isCompleted && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success-50 text-success-700 font-bold h-fit">
                  <CheckCircle2 className="w-5 h-5" />
                  Completed
                </div>
              )}
            </div>

            <div className="max-w-3xl">
              <p className="text-lg leading-8 text-text-secondary">
                {currentLesson.content}
              </p>

              <div className="mt-10 bg-secondary-50 border border-secondary-100 rounded-2xl p-6">
                <h3 className="font-bold text-text-main mb-2">
                  Key Learning Point
                </h3>

                <p className="text-text-secondary">
                  Understand this concept before moving to the next lesson.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mt-12 pt-6 border-t border-border-main">

              <div>
                {activeLessonIndex > 0 && (
                  <button
                    onClick={() =>
                      changeLesson(activeLessonIndex - 1)
                    }
                    className="px-5 py-3 rounded-xl border border-border-main font-bold text-text-main hover:bg-gray-50"
                  >
                    Previous Lesson
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">

                {activeLessonIndex <
                  activeModule.lessons.length - 1 && (
                  <button
                    onClick={() =>
                      changeLesson(activeLessonIndex + 1)
                    }
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary-600 text-white font-bold hover:bg-secondary-700"
                  >
                    Next Lesson
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {activeLessonIndex ===
                  activeModule.lessons.length - 1 &&
                  !isCompleted && (
                    <button
                      onClick={markModuleComplete}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-success-600 text-white font-bold hover:bg-success-700"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Mark Module as Complete
                    </button>
                  )}

                {isCompleted && (
                  <button
                    onClick={markAsUnreviewed}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-secondary-300 text-secondary-700 font-bold hover:bg-secondary-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Mark as Unreviewed
                  </button>
                )}

              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-secondary-600 mb-3">
          Current Learning Path
        </p>

        <h1 className="text-3xl lg:text-4xl font-black text-text-main">
          Foundations of Study
        </h1>

        <p className="text-text-secondary text-lg mt-3">
          Build your skills through structured modules and practical learning.
        </p>
      </div>

      <div className="space-y-5">

        {modules.map((module) => {
          const status = getStatus(module);
          const completed = status === 'Completed';
          const inProgress = status === 'In Progress';

          return (
            <div
              key={module.id}
              className="bg-card-bg border border-border-main rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    completed
                      ? 'bg-success-50 text-success-600'
                      : inProgress
                      ? 'bg-secondary-50 text-secondary-600'
                      : 'bg-gray-100 text-text-secondary'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <BookOpen className="w-8 h-8" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] font-bold text-text-secondary mb-2">
                    Module {module.number}
                  </p>

                  <h2 className="text-xl font-bold text-text-main">
                    {module.title}
                  </h2>

                  <p className="text-text-secondary mt-2">
                    {module.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-5 mt-4">

                    <span className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock className="w-4 h-4" />
                      {module.duration}
                    </span>

                    {completed && (
                      <span className="flex items-center gap-2 text-sm font-bold text-success-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}

                    {inProgress && (
                      <span className="text-sm font-bold text-secondary-600">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openModule(module)}
                  className={`min-w-[180px] px-6 py-3.5 rounded-xl font-bold transition-all inline-flex items-center justify-center gap-2 ${
                    completed
                      ? 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                      : 'bg-secondary-600 text-white hover:bg-secondary-700'
                  }`}
                >
                  {completed ? (
                    <>
                      Review Material
                      <Award className="w-5 h-5" />
                    </>
                  ) : inProgress ? (
                    <>
                      Continue Module
                      <PlayCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Start Module
                      <PlayCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Learning;