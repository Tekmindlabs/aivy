import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

const ipRequests = new Map<string, { count: number; timestamp: number }>();

export function rateLimiter(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  const requestData = ipRequests.get(ip);

  if (!requestData) {
    ipRequests.set(ip, { count: 1, timestamp: now });
    return null;
  }

  if (now - requestData.timestamp > RATE_LIMIT_WINDOW) {
    ipRequests.set(ip, { count: 1, timestamp: now });
    return null;
  }

  if (requestData.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  ipRequests.set(ip, {
    count: requestData.count + 1,
    timestamp: requestData.timestamp
  });
  return null;
}