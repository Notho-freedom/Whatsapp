'use client';

import { useCallback, useMemo, useState } from 'react';
import { FaPollH } from 'react-icons/fa';
import { useAppContext } from '@/context';
import pollService from '@/utils/pollService';
import { showError, showSuccess } from '@/utils';

export default function PollItem({
  poll,
  pollId,
  chatId,
  messageId,
  isMobile = false,
}) {
  const { currentUserId, selectedChat, updateMessage } = useAppContext();

  const [votingOptionId, setVotingOptionId] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const data = useMemo(() => poll || {}, [poll]);
  const resolvedPollId = data.id || pollId;
  const question = data.question || 'Sondage';
  const options = Array.isArray(data.options) ? data.options : [];
  const totalVotes =
    typeof data.total_votes === 'number' ? data.total_votes : null;
  const allowMultiple = !!data.allow_multiple;
  const optionVotes =
    data.option_votes && typeof data.option_votes === 'object'
      ? data.option_votes
      : {};

  const subtitle = useMemo(() => {
    const parts = [];
    if (allowMultiple) parts.push('Choix multiples');
    if (totalVotes != null)
      parts.push(`${totalVotes} vote${totalVotes > 1 ? 's' : ''}`);
    return parts.join(' • ');
  }, [allowMultiple, totalVotes]);

  const handleVote = useCallback(
    async optionId => {
      if (!resolvedPollId) {
        showError('Erreur', 'Sondage introuvable');
        return;
      }
      if (!currentUserId) {
        showError('Erreur', 'Utilisateur non connecté');
        return;
      }
      if (votingOptionId) return;

      try {
        setVotingOptionId(optionId);
        setSelectedOptionId(optionId);

        await pollService.voteForOption(
          resolvedPollId,
          optionId,
          currentUserId
        );

        // Rafraîchir le sondage + stats (les stats peuvent ne pas être stockées dans le doc)
        const [updatedDoc, stats] = await Promise.all([
          pollService.getPollById(resolvedPollId).catch(() => null),
          pollService.getPollStats(resolvedPollId).catch(() => ({
            total_votes: null,
            option_votes: {},
          })),
        ]);

        const updated = updatedDoc
          ? { ...updatedDoc, ...stats }
          : { ...data, id: resolvedPollId, ...stats };
        const targetChatId = chatId || selectedChat?.id;
        if (targetChatId && messageId && updated) {
          updateMessage(targetChatId, messageId, { poll: updated });
        }

        showSuccess('Sondage', 'Vote enregistré');
      } catch (e) {
        console.error('Erreur vote sondage:', e);
        showError(
          'Erreur',
          e?.message || 'Impossible de voter pour ce sondage'
        );
      } finally {
        setVotingOptionId(null);
      }
    },
    [
      resolvedPollId,
      currentUserId,
      votingOptionId,
      data,
      chatId,
      selectedChat,
      messageId,
      updateMessage,
    ]
  );

  return (
    <div
      className={`w-[320px] overflow-hidden rounded-lg ${
        isMobile ? 'max-w-[260px]' : ''
      }`}
    >
      <div
        className="px-4 py-3"
        style={{ backgroundColor: 'var(--wa-panel-header)' }}
        role="group"
        aria-label="Sondage"
      >
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-[2px]">
            <FaPollH size={18} style={{ color: 'var(--wa-highlight)' }} />
          </div>
          <div className="min-w-0">
            <div
              className="text-[14px] font-semibold leading-snug"
              style={{ color: 'var(--wa-primary-strong)' }}
            >
              {question}
            </div>
            {subtitle && (
              <div
                className="text-[11px] mt-0.5"
                style={{ color: 'var(--wa-secondary)' }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 bg-neutral-900/20">
        {!poll && resolvedPollId ? (
          <div className="text-[13px]" style={{ color: 'var(--wa-secondary)' }}>
            Chargement du sondage…
          </div>
        ) : options.length ? (
          <div className="flex flex-col gap-1.5">
            {options.map((opt, idx) => {
              const optionId = String(idx);
              const voteCount =
                optionVotes?.[optionId] ?? optionVotes?.[String(opt)] ?? 0;
              const isSelected = selectedOptionId === optionId;
              const isVoting = votingOptionId === optionId;

              return (
                <button
                  key={`${idx}-${String(opt)}`}
                  type="button"
                  className="px-3 py-2 rounded-md text-[13px] text-left flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(6, 207, 156, 0.18)'
                      : 'rgba(255,255,255,0.06)',
                    color: 'var(--wa-primary-strong)',
                    border: isSelected
                      ? '1px solid rgba(6, 207, 156, 0.55)'
                      : '1px solid transparent',
                    opacity: votingOptionId && !isVoting ? 0.75 : 1,
                    cursor: votingOptionId ? 'not-allowed' : 'pointer',
                  }}
                  disabled={!!votingOptionId}
                  onClick={() => handleVote(optionId)}
                  aria-disabled={!!votingOptionId}
                  aria-label={`Voter pour: ${String(opt)}`}
                >
                  <span className="min-w-0 truncate">{opt}</span>
                  <span
                    className="text-[12px]"
                    style={{ color: 'var(--wa-secondary)' }}
                  >
                    {isVoting ? '…' : voteCount}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-[13px]" style={{ color: 'var(--wa-secondary)' }}>
            Aucune option
          </div>
        )}
      </div>
    </div>
  );
}
