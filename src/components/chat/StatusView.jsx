'use client';

import { FaLock, FaWhatsapp, FaImage, FaFileAlt } from 'react-icons/fa';
import { useAppContext } from '@/context/AppContext';

export default function StatusView({ selectedStatus }) {
  const { users } = useAppContext();
  
  // Trouver l'utilisateur correspondant au statut sélectionné
  const selectedUser = users.find(user => user.id === selectedStatus?.id);

  return (
    <section className="flex-1 bg-whatsapp-chat-bg flex flex-col">
      {/* Background pattern */}
      <div className="absolute inset-0 wa-chat-background pointer-events-none" aria-hidden="true" />
      
      {selectedStatus ? (
        // Affichage du statut sélectionné
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="text-center">
            <img
              src={selectedStatus.avatar}
              alt={`${selectedStatus.name} status`}
              className="w-32 h-32 rounded-lg mx-auto mb-4 object-cover"
            />
            <p className="text-lg text-white mb-2 font-segoe">
              {selectedStatus.name}
            </p>
            <p className="text-sm text-neutral-400 mb-4">
              {selectedStatus.time}
            </p>
            
            {/* Informations supplémentaires sur l'utilisateur */}
            {selectedUser && (
              <div className="bg-neutral-800/50 rounded-lg p-4 max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                  {selectedStatus.statusType === 'image' ? (
                    <FaImage className="text-[#1DAA61]" size={16} />
                  ) : (
                    <FaFileAlt className="text-[#1DAA61]" size={16} />
                  )}
                  <span className="text-sm text-neutral-300">
                    {selectedStatus.statusType === 'image' ? 'Photo Status' : 'Text Status'}
                  </span>
                </div>
                
                <p className="text-sm text-neutral-300 mb-3">
                  {selectedStatus.statusContent}
                </p>
                
                {/* Informations de l'utilisateur */}
                <div className="text-xs text-neutral-400 space-y-1">
                  <p>Phone: {selectedUser.phone}</p>
                  <p>Status: {selectedUser.status}</p>
                  {selectedUser.lastMessage && (
                    <p>Last message: {selectedUser.lastMessage.text}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Vue par défaut - exactement comme ChatBody
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWhatsapp size={100} className="text-neutral-600" />
            </div>
            <h3 className="text-lg text-white mb-2 font-segoe">
              WhatsApp for Windows
            </h3>
            <p className="text-sm max-w-md text-neutral-400">
              Send and receive messages without keeping your phone online.
              <br />
              Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
            </p>
            
            {/* Informations sur les statuts disponibles */}
            {users && users.length > 0 && (
              <div className="mt-6 bg-neutral-800/50 rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-sm text-neutral-300 mb-2">
                  {users.length} contacts available for status updates
                </p>
                <p className="text-xs text-neutral-400">
                  Click on a contact in the left panel to view their status
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Footer avec message de sécurité - exactement comme ChatBody */}
      <div className="pb-12 flex items-center justify-center gap-2 relative z-10">
        <FaLock size={10} className="text-neutral-500" />
        <p className="text-sm text-neutral-500">
          {selectedStatus ? 'Status updates are end-to-end encrypted.' : 'End-to-end encrypted.'}
        </p>
      </div>
    </section>
  );
}
