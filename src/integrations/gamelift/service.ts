import { createServerFn } from "@tanstack/react-start";
import { GameLiftStreamsClient, StartStreamSessionCommand, GetStreamSessionCommand, TerminateStreamSessionCommand } from '@aws-sdk/client-gameliftstreams';
import { z } from 'zod';

const gameliftStreamsClient = new GameLiftStreamsClient({
    region: process.env.GAMELIFT_REGION || 'us-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

export const startStream = createServerFn({ method: 'POST' })
.validator(z.object({
    signalRequest: z.string(),
    userId: z.string().optional(),
    locations: z.array(z.string()).optional(),
    appIdentifier: z.string().optional(),
    sgIdentifier: z.string().optional(),
}))
.handler(async ({ data }) => {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new Error('AWS credentials are not configured');
    }

    const appIdentifier = data.appIdentifier || process.env.GAMELIFT_APP_ID;
    const sgIdentifier = data.sgIdentifier || process.env.GAMELIFT_STREAM_GROUP_ID;

    if (!appIdentifier || !sgIdentifier) {
        throw new Error('GameLift application and stream group identifiers are required');
    }

    const client = gameliftStreamsClient;
    
    const input = {
        Identifier: sgIdentifier,
        ApplicationIdentifier: appIdentifier,
        SignalRequest: data.signalRequest,
        UserId: data.userId || `anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        Protocol: 'WebRTC' as const,
        Locations: data.locations || [process.env.GAMELIFT_REGION || 'us-west-2'],
        ConnectionTimeoutSeconds: 600, // 10 minutes (max allowed)
        // SessionLengthSeconds: 14400, // 4 hour session limit
        // optional for debugging
        Description: `Public stream session started at ${new Date().toISOString().replace(/:/g, '-')}`
    };
    const command = new StartStreamSessionCommand(input);

    try {
        const response = await client.send(command);

        console.log(`Stream session created: ${response.Arn}`)
        // console.log(`Signal response: ${response.SignalResponse}`)
        console.log(`Status: ${response.Status}`)
        console.log(`Stream session ARN: ${response.Arn}`)

        return {
            signalResponse: response.SignalResponse,
            sessionArn: response.Arn,
            status: response.Status,
            streamSessionId: response.StreamGroupId,
            createdAt: new Date().toISOString()
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('GameLift API Error:', error.message)

            if (error.name === 'ResourceNotFoundException') {
                throw new Error(`Application or Stream Group not found`)
            } else if (error.name === 'LimitExceededException') {
                throw new Error('Stream capacity limit reached. Please try again later.')
            } else if (error.name === 'InvalidRequestException') {
                throw new Error('Invalid request. Please check your configuration.')
            }

            throw new Error(`Failed to start stream: ${error.message}`)
        }
        console.error('GameLift API Error:', error)
        throw new Error('Failed to start stream: Unknown error') // fallback
    }
})

export const getStreamStatus = createServerFn({ method: 'GET' })
.validator(z.object({
    sessionArn: z.string(),
}))
.handler(async ({ data }) => {
    const { sessionArn } = data;

    console.log('getStreamStatus called with:', { sessionArn });

    const client = gameliftStreamsClient;

    // Extract stream group ID and session ID from ARN if needed
    // ARN format: arn:aws:gameliftstreams:region:account:streamsession/streamGroupId/sessionId
    let streamGroupId: string;
    let sessionId: string;
    
    if (sessionArn.startsWith('arn:')) {
        const arnParts = sessionArn.split('/');
        streamGroupId = arnParts[1];
        sessionId = arnParts[2];
        console.log('Parsed ARN:', { streamGroupId, sessionId });
    } else {
        // If not an ARN, assume it's just the session ID
        sessionId = sessionArn;
        streamGroupId = process.env.GAMELIFT_STREAM_GROUP_ID!;
        console.log('Using session ID directly:', { sessionId, streamGroupId });
    }

    const command = new GetStreamSessionCommand({
        Identifier: streamGroupId,
        StreamSessionIdentifier: sessionId,
    });
    
    console.log('GetStreamSessionCommand parameters:', {
        Identifier: streamGroupId,
        StreamSessionIdentifier: sessionId
    });
    
    try {
        const response = await client.send(command);
        
        // Add detailed logging of the response
        console.log('=== FULL GetStreamSession Response ===');
        console.log('Status:', response.Status);
        console.log('StatusReason:', response.StatusReason);
        console.log('Location:', response.Location);
        console.log('SignalResponse available:', !!response.SignalResponse);
        console.log('CreatedAt:', response.CreatedAt);
        console.log('ApplicationArn:', response.ApplicationArn);
        console.log('=====================================');
        
        return {
            signalResponse: response.SignalResponse,
            status: response.Status,
            statusReason: response.StatusReason,
            sessionArn: response.Arn,
            createdAt: response.CreatedAt,
            userId: response.UserId,
            location: response.Location,
            applicationIdentifier: response.ApplicationArn,
            streamGroupIdentifier: response.StreamGroupId,
        }
    } catch (error) {
        console.error('GetStreamSession detailed error:', error);
        
        if (error instanceof Error) {
            console.error('GameLift GetStreamSession Error:', error.message)
      
            if (error.name === 'ResourceNotFoundException') {
                throw new Error('Stream session not found. It may have been terminated.');
            } else if (error.name === 'AccessDeniedException') {
                throw new Error('Access denied. Please check your AWS credentials and permissions.');
            }
        }
        console.error('GameLift API Error:', error);
        throw new Error(`Failed to get stream status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
})

export const terminateStream = createServerFn({ method: 'POST' })
.validator(z.object({
    sessionArn: z.string(),
}))
.handler(async ({ data }) => {
    const { sessionArn } = data;

    console.log('terminateStream called with:', { sessionArn });

    const client = gameliftStreamsClient;
    let streamGroupId: string;
    let sessionId: string;
    
    if (sessionArn.startsWith('arn:')) {
        const arnParts = sessionArn.split('/');
        streamGroupId = arnParts[1];
        sessionId = arnParts[2];
        console.log('Parsed ARN:', { streamGroupId, sessionId });
    } else {
        // If not an ARN, assume it's just the session ID
        sessionId = sessionArn;
        streamGroupId = process.env.GAMELIFT_STREAM_GROUP_ID!;
        console.log('Using session ID directly:', { sessionId, streamGroupId });
    }
    const input = {
        Identifier: streamGroupId,
        StreamSessionIdentifier: sessionId,
    }
    const command = new TerminateStreamSessionCommand(input);

    try {
        const response = await client.send(command);
        console.log('TerminateStreamSession response:', response);
        return {
            message: 'Stream terminated successfully'
        }
    } catch (error) {
        console.error('TerminateStreamSession error:', error);
        throw new Error(`Failed to terminate stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
})