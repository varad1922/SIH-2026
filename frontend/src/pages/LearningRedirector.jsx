import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

const LearningRedirector = () => {
  const { learningPathId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const findRedirectTarget = async () => {
      try {
        const response = await api.get(`/learning-path/${learningPathId}`);
        const path = response.data.path;
        
        if (!path || !path.modules || path.modules.length === 0) {
          navigate('/learning');
          return;
        }

        // Find the first module that is not completely finished
        let targetModule = path.modules.find(m => m.status === 'In Progress' || m.status === 'Not Started');
        
        // If all are completed/reviewed or locked, default to the first module
        if (!targetModule) {
          targetModule = path.modules[0];
        }

        // Fetch deep details of this specific module to find the lesson
        const modRes = await api.get(`/learning-path/${learningPathId}/modules/${targetModule.id}`);
        const modData = modRes.data.module;
        const progressData = modRes.data.progress;

        let targetLessonId = 'l1'; // Default
        
        if (modData && modData.lessons && modData.lessons.length > 0) {
          if (progressData?.currentLessonId) {
            targetLessonId = progressData.currentLessonId;
          } else {
            const completedSet = new Set(progressData?.completedLessons || []);
            const firstUncompleted = modData.lessons.find(l => !completedSet.has(l.id));
            targetLessonId = firstUncompleted ? firstUncompleted.id : modData.lessons[0].id;
          }
        }

        // Perform the redirect to the strict workspace URL
        navigate(`/learning-path/${learningPathId}/module/${targetModule.id}/lesson/${targetLessonId}`, { replace: true });
        
      } catch (err) {
        console.error('Error in LearningRedirector:', err);
        navigate('/learning');
      }
    };

    findRedirectTarget();
  }, [learningPathId, navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-border-main border-t-secondary-600 rounded-full animate-spin"></div>
      <p className="text-text-secondary font-bold animate-pulse">Setting up your learning workspace...</p>
    </div>
  );
};

export default LearningRedirector;
