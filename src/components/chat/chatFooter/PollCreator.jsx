"use client";

import React, { useState } from 'react';
import { BarChart3, Plus, X, Trash2 } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';

const PollCreator = ({ isOpen, onClose, conversationId, userId }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { createPoll } = useAttachments(conversationId, userId);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    if (!question.trim() || options.filter(opt => opt.trim()).length < 2) {
      return;
    }

    setIsCreating(true);
    try {
      const pollData = {
        question: question.trim(),
        options: options.filter(opt => opt.trim()),
        allow_multiple: allowMultiple,
        expires_at: expiresAt ? new Date(expiresAt) : null
      };

      const result = await createPoll(pollData);
      console.log('Sondage créé:', result);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur création sondage:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setAllowMultiple(false);
    setExpiresAt('');
  };

  const isValid = question.trim() && options.filter(opt => opt.trim()).length >= 2;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <BarChart3 size={20} className="mr-2 text-blue-500" />
            Créer un sondage
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Question */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question du sondage *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Quel est votre plat préféré ?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Options */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options de réponse * (minimum 2)
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              onClick={addOption}
              className="mt-2 flex items-center text-blue-500 hover:text-blue-700 text-sm"
            >
              <Plus size={16} className="mr-1" />
              Ajouter une option
            </button>
          )}
        </div>

        {/* Paramètres */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowMultiple"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="allowMultiple" className="text-sm text-gray-700">
              Permettre la sélection de plusieurs options
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expire le (optionnel)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleCreatePoll}
            disabled={!isValid || isCreating}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              <>
                <BarChart3 size={16} className="mr-2" />
                Créer le sondage
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollCreator;
