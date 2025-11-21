import React from 'react';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';

const FormNavigation = ({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onSubmit, 
  isValid,
  isSubmitting 
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-200">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </button>
        )}
      </div>
      <div>
        {isLastStep ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            disabled={!isValid}
          >
            Suivant
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FormNavigation;