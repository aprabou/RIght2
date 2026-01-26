import React from 'react';
import { JobCategory } from '../types/enums';

interface CategorySelectorProps {
  selectedRoles: string[];
  onToggleCategory: (category: string) => void;
}

interface CategoryOption {
  id: string;
  label: string;
  category: string;
}

const categoryOptions: CategoryOption[] = [
  { id: 'software', label: 'Software Engineering', category: JobCategory.SOFTWARE },
  { id: 'aiml', label: 'AI/ML/Data Science', category: JobCategory.AI_ML },
  { id: 'hardware', label: 'Hardware', category: JobCategory.HARDWARE },
  { id: 'pm', label: 'Product Management', category: JobCategory.PM },
  { id: 'design', label: 'Design', category: JobCategory.DESIGN },
  { id: 'quant', label: 'Quantitative', category: JobCategory.QUANT },
];

/**
 * Component for selecting job categories
 */
export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedRoles,
  onToggleCategory,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Select Job Categories:
      </h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Job categories">
        {categoryOptions.map((option) => {
          const isSelected = selectedRoles.includes(option.category);
          
          return (
            <button
              key={option.id}
              onClick={() => onToggleCategory(option.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${option.label}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
