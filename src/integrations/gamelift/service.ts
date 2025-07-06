import { createServerFn } from "@tanstack/react-start";
import { GameLiftStreamsClient, StartStreamSessionCommand, GetStreamSessionCommand, TerminateStreamSessionCommand } from '@aws-sdk/client-gameliftstreams';
import { z } from 'zod';

const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
const GAMELIFT_REGION = import.meta.env.VITE_GAMELIFT_REGION

const STREAM_GROUP_ID = import.meta.env.VITE_GAMELIFT_STREAM_GROUP_ID
const APP_ID = import.meta.env.VITE_GAMELIFT_APP_ID

const gameliftStreamsClient = new GameLiftStreamsClient({
    region: GAMELIFT_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    }
});

export const startStream = createServerFn({ method: 'POST' })
.validator(z.object({
    StreamGroupId: z.string().optional(),
    ApplicationIdentifier: z.string().optional(),
    UserId: z.string(),
    SignalRequest: z.string(),
    AdditionalLaunchArgs: z.array(z.string()).optional(),
    AdditionalEnvironmentVariables: z.record(z.string()).optional(),
    Locations: z.array(z.string()).optional()
}))
.handler(async ({ data }) => {
    console.log('=== CreateStreamSession Debug Info ===');
    console.log('Request data:', JSON.stringify(data, null, 2));
    console.log('Environment variables:');
    console.log('- GAMELIFT_STREAM_GROUP_ID:', STREAM_GROUP_ID);
    console.log('- GAMELIFT_APP_ID:', APP_ID);
    console.log('=====================================');

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        throw new Error('AWS credentials are not configured');
    }

    if (!STREAM_GROUP_ID || !APP_ID) {
        throw new Error('GameLift stream group and application identifiers are required');
    }

    if (!data.SignalRequest) {
        throw new Error('Signal request is required');
    }

    const appIdentifier = data.ApplicationIdentifier || APP_ID;
    const streamGroupIdentifierr = data.StreamGroupId || STREAM_GROUP_ID;

    if (!appIdentifier || !streamGroupIdentifierr) {
        throw new Error('GameLift application and stream group identifiers are required');
    }

    const client = gameliftStreamsClient;
    
    const input = {
        Identifier: streamGroupIdentifierr,
        ApplicationIdentifier: appIdentifier,
        AdditionalLaunchArgs: data.AdditionalLaunchArgs || [],
        AdditionalEnvironmentVariables: data.AdditionalEnvironmentVariables || {},
        UserId: data.UserId,
        Protocol: 'WebRTC' as const,
        SignalRequest: data.SignalRequest,
        Locations: data.Locations || [GAMELIFT_REGION || 'us-west-2'],
        ConnectionTimeoutSeconds: 600, // 10 minutes (max allowed)
        SessionLengthSeconds: 14400, // 4 hour session limit
        Description: `Public stream session started at ${new Date().toISOString().replace(/:/g, '-')}` // optional for debugging
    };
    const command = new StartStreamSessionCommand(input);

    try {
        const response = await client.send(command);

        console.log(`CreateStreamSession success: Arn=${response.Arn}`);
        console.log(`Signal response available: ${!!response.SignalResponse}`);
        console.log(`Status: ${response.Status}`);

        return {
            sessionArn: response.Arn!,
            streamGroupId: streamGroupIdentifierr,
            signalResponse: response.SignalResponse,
            status: response.Status,
            createdAt: new Date().toISOString(),
            userId: data.UserId,
            applicationIdentifier: appIdentifier,
            location: response.Location
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
    streamGroupId: z.string(),
}))
.handler(async ({ data }) => {
    const { sessionArn, streamGroupId } = data;

    console.log('getStreamStatus called with:', { sessionArn });

    const client = gameliftStreamsClient;

    const command = new GetStreamSessionCommand({
        Identifier: streamGroupId,
        StreamSessionIdentifier: sessionArn
    });
    
    console.log('GetStreamSessionCommand parameters:', {
        Identifier: streamGroupId,
        StreamSessionIdentifier: sessionArn
    });
    
    try {
        const response = await client.send(command);
        
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
                throw new Error('Access denied.');
            }
        }
        console.error('GameLift API Error:', error);
        throw new Error(`Failed to get stream status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
})

export const terminateStream = createServerFn({ method: 'POST' })
.validator(z.object({
    sessionArn: z.string(),
    streamGroupId: z.string(),
}))
.handler(async ({ data }) => {
    const { sessionArn, streamGroupId } = data;

    console.log('terminateStream called with:', { sessionArn });

    const client = gameliftStreamsClient;

    const input = {
        Identifier: streamGroupId,
        StreamSessionIdentifier: sessionArn
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
        if (error instanceof Error) {
            if (error.name === 'ResourceNotFoundException') {
                throw new Error('Stream session not found. It may have already been terminated.');
            } else if (error.name === 'InvalidRequestException') {
                throw new Error('Invalid request. The session may already be in a terminating state.');
            }
            
            throw new Error(`Failed to terminate stream: ${error.message}`);
        }
        
        throw new Error('Failed to terminate stream: Unknown error');
    }
})

export const healthCheck = createServerFn({ method: 'GET' })
.handler(async () => {
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        gameLiftRegion: GAMELIFT_REGION,
    }
})

export const getDebugInfo = createServerFn({ method: 'GET' })
.handler(async () => {
    return {
        timestamp: new Date().toISOString(),
        environment: {
            AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY,
            GAMELIFT_REGION,
            STREAM_GROUP_ID,
            APP_ID,
        }
    }
})