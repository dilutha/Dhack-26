import { POST } from '@/app/api/registration/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() =>
        Promise.resolve({ data: { team_id: 'DH001' }, error: null })
      ),
    })),
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a team successfully', async () => {
    const requestBody = {
      bis: 'other',
      team_name: 'Test Team',
      university: 'Test University',
      members: [
        {
          full_name: 'John Doe',
          name_with_initials: 'J. Doe',
          nic: '123456789V',
          university_reg_no: '12345',
          faculty: 'Engineering',
          academic_year: 2,
          email: 'john@test.com',
          whatsapp_number: '0771234567',
          linkedin_profile: 'https://linkedin.com/in/john',
          is_leader: true,
        },
        {
          full_name: 'Jane Smith',
          name_with_initials: 'J. Smith',
          nic: '987654321V',
          university_reg_no: '67890',
          faculty: 'Engineering',
          academic_year: 2,
          email: 'jane@test.com',
          whatsapp_number: '0777654321',
          linkedin_profile: 'https://linkedin.com/in/jane',
          is_leader: false,
        },
        {
          full_name: 'Bob Johnson',
          name_with_initials: 'B. Johnson',
          nic: '456789123V',
          university_reg_no: '11111',
          faculty: 'Engineering',
          academic_year: 2,
          email: 'bob@test.com',
          whatsapp_number: '0771111111',
          linkedin_profile: 'https://linkedin.com/in/bob',
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
    const { CSRFService } = require('@/lib/csrf');
    CSRFService.validateCSRFToken.mockReturnValue(false);

    const requestBody = {
      bis: 'other',
      team_name: 'Test Team',
      university: 'Test University',
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
    expect(data.error).toBe('Invalid CSRF token');
  });

  it('should reject invalid team data', async () => {
    const requestBody = {
      bis: 'other',
      team_name: '', // Invalid: empty team name
      university: 'Test University',
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
