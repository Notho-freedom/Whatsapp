'use client';

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

  const removeOption = index => {
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
        expires_at: expiresAt ? new Date(expiresAt) : null,
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

  const isValid =
    question.trim() && options.filter(opt => opt.trim()).length >= 2;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="rounded-xl p-0 w-[500px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--wa-panel)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4">
          <h3
            className="text-lg font-bold flex items-center"
            style={{ color: 'var(--wa-primary-strong)' }}
          >
            <BarChart3
              size={20}
              className="mr-2"
              style={{ color: 'var(--wa-highlight)' }}
            />
            Créer un sondage
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition hover:bg-neutral-700/30"
            style={{ color: 'var(--wa-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Question */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: 'var(--wa-primary-strong)' }}
            >
              Question du sondage *
            </label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ex: Quel est votre plat préféré ?"
              className="w-full px-4 py-3 rounded-lg focus:outline-none transition focus:ring-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'var(--wa-primary-strong)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          {/* Options */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: 'var(--wa-primary-strong)' }}
            >
              Options de réponse * (minimum 2)
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={e => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2.5 rounded-lg focus:outline-none transition focus:ring-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: 'var(--wa-primary-strong)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 rounded-lg transition"
                      style={{
                        color: '#ff4444',
                        backgroundColor: 'rgba(255,0,0,0.1)',
                      }}
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
                className="mt-3 flex items-center text-sm font-medium transition hover:opacity-80"
                style={{ color: 'var(--wa-highlight)' }}
              >
                <Plus size={16} className="mr-1" />
                Ajouter une option
              </button>
            )}
          </div>

          {/* Paramètres */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={allowMultiple}
                onChange={e => setAllowMultiple(e.target.checked)}
                className="rounded"
                style={{
                  accentColor: 'var(--wa-highlight)',
                }}
              />
              <label
                htmlFor="allowMultiple"
                className="text-sm ml-3"
                style={{ color: 'var(--wa-primary-strong)' }}
              >
                Permettre la sélection de plusieurs options
              </label>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--wa-primary-strong)' }}
              >
                Expire le (optionnel)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition focus:ring-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'var(--wa-primary-strong)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-3 p-6 pt-4 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2.5 font-medium rounded-lg transition hover:bg-neutral-700/30"
            style={{
              color: 'var(--wa-secondary)',
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleCreatePoll}
            disabled={!isValid || isCreating}
            className="px-4 py-2.5 font-semibold rounded-lg flex items-center transition disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: 'var(--wa-highlight)',
              color: '#0d1419',
            }}
          >
            {isCreating ? (
              <>
                <div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"
                  style={{ borderColor: '#0d1419' }}
                ></div>
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
