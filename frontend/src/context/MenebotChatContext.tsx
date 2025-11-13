import React, { createContext, useContext, useState, useCallback } from 'react';

interface MenebotChatContextType {
  isChatOpen: boolean;
  requestClose: (sectionId?: string) => void;
  setChatOpen: (open: boolean) => void;
  pendingSection: string | null;
  clearPendingSection: () => void;
}

const MenebotChatContext = createContext<MenebotChatContextType | undefined>(undefined);

export const useMenebotChat = () => {
  const ctx = useContext(MenebotChatContext);
  if (!ctx) throw new Error('useMenebotChat must be used within MenebotChatProvider');
  return ctx;
};

export const MenebotChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatOpen, setChatOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  const requestClose = useCallback((sectionId?: string) => {
    setPendingSection(sectionId || null);
  }, []);

  const clearPendingSection = useCallback(() => setPendingSection(null), []);

  return (
    <MenebotChatContext.Provider value={{ isChatOpen, setChatOpen, requestClose, pendingSection, clearPendingSection }}>
      {children}
    </MenebotChatContext.Provider>
  );
};
