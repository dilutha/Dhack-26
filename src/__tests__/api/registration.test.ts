/**
 * @jest-environment node
 */
import { POST } from '@/app/api/registration/route';
import { NextRequest } from 'next/server';

// Mock dependencies
let teamsCallCount = 0;
let currentResult: any = null;

const mockBuilder = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  then: jest.fn((onFulfilled) => {
    return Promise.resolve(currentResult).then(onFulfilled);
  }),
};

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: jest.fn((table) => {
      if (table === 'competitions') {
        currentResult = { data: { id: 'competition-id' }, error: null };
      } else if (table === 'teams') {
        teamsCallCount++;
        if (teamsCallCount === 1) {
          currentResult = { data: [], error: null };
        } else {
          currentResult = { data: { team_id: 'DH001' }, error: null };
        }
      } else if (table === 'institutions') {
        currentResult = { data: { id: 'institution-id' }, error: null };
      } else if (table === 'team_members') {
        currentResult = { error: null };
      }
      return mockBuilder;
    }),
  },
}));

jest.mock('@/lib/recaptcha', () => ({
  verifyRecaptchaToken: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => ({ allowed: true })),
}));

jest.mock('@/lib/csrf', () => ({
  CSRFService: {
    validateCSRFToken: jest.fn(() => true),
  },
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(() => Promise.resolve()),
  generateRegistrationConfirmationEmail: jest.fn(() => ({})),
}));

describe('/api/registration', () => {
  let CSRFService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    teamsCallCount = 0;
    currentResult = null;
    CSRFService = require('@/lib/csrf').CSRFService;
    CSRFService.validateCSRFToken.mockResolvedValue(true);
  });

  it('should register a team successfully', async () => {
    const requestBody = {
      competition_category: 'inter_university',
      team_name: 'Test Team',
      institution_name: 'Test University',
      members: [
        {
          full_name: 'John Doe',
          email: 'john@test.com',
          whatsapp_number: '0771234567',
          faculty: 'Engineering',
          degree_program: 'Software Engineering',
          student_id: '12345',
          is_leader: true,
        },
        {
          full_name: 'Jane Smith',
          email: 'jane@test.com',
          whatsapp_number: '0777654321',
          faculty: 'Engineering',
          degree_program: 'Software Engineering',
          student_id: '67890',
          is_leader: false,
        },
        {
          full_name: 'Bob Johnson',
          email: 'bob@test.com',
          whatsapp_number: '0771111111',
          faculty: 'Engineering',
          degree_program: 'Software Engineering',
          student_id: '11111',
          is_leader: false,
        },
      ],
      recaptchaToken: 'valid-token',
      csrfToken: 'valid-csrf-token',
    };

    const request = new NextRequest('http://localhost:3000/api/registration', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'valid-csrf-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.team_id).toBe('DH001');
  });

  it('should reject invalid CSRF token', async () => {
    CSRFService.validateCSRFToken.mockResolvedValue(false);

    const requestBody = {
      competition_category: 'inter_university',
      team_name: 'Test Team',
      institution_name: 'Test University',
      members: [],
      recaptchaToken: 'valid-token',
      csrfToken: 'invalid-csrf-token',
    };

    const request = new NextRequest('http://localhost:3000/api/registration', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'invalid-csrf-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid CSRF token. Please refresh the page and try again.');
  });

  it('should reject invalid team data', async () => {
    const requestBody = {
      competition_category: 'inter_university',
      team_name: '', // Invalid: empty team name
      institution_name: 'Test University',
      members: [], // Invalid: no members
      recaptchaToken: 'valid-token',
      csrfToken: 'valid-csrf-token',
    };

    const request = new NextRequest('http://localhost:3000/api/registration', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'valid-csrf-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });
});
