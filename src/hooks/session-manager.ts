import { useCallback, useRef, useState } from "react";
import { GameSession } from "~/integrations/gamelift/types";

export const useSessionManager = () => {
    const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
    const [streamConnected, setStreamConnected] = useState(false);

    const lastLoggedSession = useRef<string | null>(null);
    const currentSessionId = currentSession?.sessionArn?.slice(-8) || 'null';
    
    if (lastLoggedSession.current !== currentSessionId) {
        console.log('🔧 SessionManager session changed:', currentSessionId);
        lastLoggedSession.current = currentSessionId;
    }

    const saveSession = useCallback((session: GameSession) => {
        try {
            sessionStorage.setItem('gameSessionData', JSON.stringify(session));
            setCurrentSession(session);
            console.log('📁 Session saved:', session.sessionArn);
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }, []);

    const clearSession = useCallback(() => {
        try {
            sessionStorage.removeItem('gameSessionData');
            setCurrentSession(null);
            setStreamConnected(false);
            console.log('🗑️ Session cleared');
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }, []);

    const loadSession = useCallback((): GameSession | null => {
        try {
            const sessionData = sessionStorage.getItem('gameSessionData');
            if (!sessionData) return null;

            const parsed = JSON.parse(sessionData) as GameSession;
            const now = Date.now();
            const sessionAge = now - parsed.timestamp;
            const maxAge = 3600000; // 1 hour

            if (sessionAge > maxAge) {
                console.log('⏰ Session expired, clearing...');
                clearSession();
                return null;
            }

            console.log('📂 Session loaded:', parsed.sessionArn);
            return parsed;
        } catch (error) {
            console.error('Failed to load session:', error);
            clearSession();
            return null;
        }
    }, [clearSession]);

    return {
        currentSession,
        setCurrentSession,
        streamConnected,
        setStreamConnected,
        saveSession,
        clearSession,
        loadSession,
    }
}