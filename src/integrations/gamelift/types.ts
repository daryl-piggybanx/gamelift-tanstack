
export type GameSession = {
    sessionArn: string;
    streamGroupId: string;
    userId: string;
    applicationId: string;
    location: string;
    timestamp: number;
    status: 'active' | 'connecting' | 'terminated';
}