
import React from 'react';
import { ArrowDownRight, ArrowUpRight, ArrowRight, Target, Edit, Library, Sparkles } from 'lucide-react';

interface OnboardingGuideProps {
  onDismiss: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onDismiss }) => {
  
  const calloutBaseClass = "absolute bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-lg shadow-xl text-sm";
  const calloutArrowClass = "absolute w-3 h-3 bg-white dark:bg-slate-700 transform rotate-45";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 sm:p-6 transition-opacity duration-300"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div 
        className="relative w-full h-full max-w-md mx-auto" // Constrain to app width for positioning
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking content
      >
        {/* Callout 1: Prompt Area */}
        {/* Positioned to point towards where the prompt textarea typically is */}
        <div className={`${calloutBaseClass} top-[15%] left-[5%] sm:left-[10%] w-60 sm:w-72`}
             style={{ transform: 'translateY(-50%)' }}>
          <div className="flex items-start">
            <Edit size={24} className="mr-2 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">1. Enter Your Idea</h3>
              <p>Type a description of the image you want to create. Be descriptive!</p>
            </div>
          </div>
          <div className={`${calloutArrowClass} -right-1.5 top-1/2 -translate-y-1/2`}></div> {/* Arrow pointing right */}
        </div>

        {/* Callout 2: Generate Button */}
        {/* Positioned to point towards where the generate button typically is (below prompt/options) */}
         <div className={`${calloutBaseClass} bottom-[30%] left-[5%] sm:left-[10%] w-60 sm:w-72`}
              style={{ transform: 'translateY(50%)' }}>
          <div className="flex items-start">
            <Sparkles size={24} className="mr-2 text-purple-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">2. Create Magic!</h3>
              <p>Tap the "Generate Image" button to bring your vision to life.</p>
            </div>
          </div>
          <div className={`${calloutArrowClass} -right-1.5 top-1/2 -translate-y-1/2`}></div> {/* Arrow pointing right */}
        </div>


        {/* Callout 3: Library Tab */}
        {/* Positioned to point towards the library tab in the bottom navigation */}
        <div className={`${calloutBaseClass} bottom-[10%] right-[5%] sm:right-[10%] w-52 sm:w-60`}
            style={{ transform: 'translateY(50%)' }}>
          <div className="flex items-start">
             <Library size={24} className="mr-2 text-green-500 flex-shrink-0" />
            <div>
                <h3 className="font-semibold mb-1">3. Your Collection</h3>
                <p>Find all your generated images saved in the Library tab.</p>
            </div>
          </div>
           <div className={`${calloutArrowClass} -left-1.5 top-1/2 -translate-y-1/2`}></div> {/* Arrow pointing left */}
        </div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 sm:px-0">
            <button
            onClick={onDismiss}
            className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-black transition-all duration-150 ease-in-out text-base active:scale-[0.98]"
            aria-label="Start creating images"
            >
            Start Creating!
            </button>
        </div>
      </div>
    </div>
  );
};
