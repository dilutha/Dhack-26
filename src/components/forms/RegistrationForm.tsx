'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ReCAPTCHA from 'react-google-recaptcha';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from '@/components/ui/select';
import {
  BIS_DEPARTMENT,
  COMPETITIONS,
  CompetitionCategory,
  DHACK_2026_CONFIG,
  FMSC_FACULTY,
  USJ,
} from '@/lib/dhack2026';

const categoryOptions = Object.values(COMPETITIONS).map(category => ({
  value: category.id,
  label: category.title,
}));

const memberSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  whatsapp_number: z
    .string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  faculty: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  degree_program: z.string().optional().or(z.literal('')),
  student_id: z.string().optional().or(z.literal('')),
  grade: z.string().optional().or(z.literal('')),
  is_bis: z.boolean().default(false),
  is_leader: z.boolean().default(false),
});

const formSchema = z
  .object({
    competition_category: z.enum([
      'inter_university',
      'inter_school',
      'rebrand',
    ]),
    team_name: z.string().optional().or(z.literal('')),
    institution_name: z.string().min(2, 'Institution name is required'),
    teacher_in_charge: z.string().optional().or(z.literal('')),
    guardian_contact: z.string().optional().or(z.literal('')),
    members: z.array(memberSchema).min(3).max(5),
  })
  .superRefine((data, ctx) => {
    const category = COMPETITIONS[data.competition_category];
    if (data.members.length < category.minMembers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members'],
        message: `${category.title} requires at least ${category.minMembers} members.`,
      });
    }
    if (data.members.length > category.maxMembers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members'],
        message: `${category.title} allows at most ${category.maxMembers} members.`,
      });
    }
    if (category.exactMembers && data.members.length !== category.exactMembers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members'],
        message: `${category.title} requires exactly ${category.exactMembers} members.`,
      });
    }
    if (data.members.filter(member => member.is_leader).length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members'],
        message: 'Exactly one team leader is required.',
      });
    }

    if (
      data.competition_category !== 'inter_school' &&
      !data.team_name?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['team_name'],
        message: 'Unique team name is required.',
      });
    }

    if (data.competition_category === 'inter_school') {
      if (!data.teacher_in_charge) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['teacher_in_charge'],
          message: 'Teacher in charge is required.',
        });
      }
      if (!data.guardian_contact || !/^\d{10}$/.test(data.guardian_contact)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardian_contact'],
          message: 'Parent or guardian contact must be exactly 10 digits.',
        });
      }
      data.members.forEach((member, index) => {
        if (!member.grade) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['members', index, 'grade'],
            message: 'Grade is required for school participants.',
          });
        }
      });
    }

    if (data.competition_category === 'inter_university') {
      data.members.forEach((member, index) => {
        for (const field of ['faculty', 'degree_program', 'student_id'] as const) {
          if (!member[field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['members', index, field],
              message: 'Required for university participants.',
            });
          }
        }
      });
    }

    if (data.competition_category === 'rebrand') {
      if (data.institution_name !== USJ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['institution_name'],
          message: `ReBrand is restricted to ${USJ}.`,
        });
      }
      const bisCount = data.members.filter(member => member.is_bis).length;
      if (bisCount !== 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['members'],
          message: 'ReBrand requires exactly 3 BIS students and 2 other FMSC members.',
        });
      }
      data.members.forEach((member, index) => {
        if (member.faculty !== FMSC_FACULTY) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['members', index, 'faculty'],
            message: `All ReBrand members must belong to ${FMSC_FACULTY}.`,
          });
        }
        if (!member.is_bis && member.department === BIS_DEPARTMENT) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['members', index, 'department'],
            message: 'Non-BIS ReBrand members must be from another FMSC department.',
          });
        }
        for (const field of ['department', 'degree_program', 'student_id'] as const) {
          if (!member[field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['members', index, field],
              message: 'Required for ReBrand participants.',
            });
          }
        }
      });
    }
  });

export type RegistrationFormValues = z.infer<typeof formSchema>;

const emptyMember = (isLeader = false) => ({
  full_name: '',
  email: '',
  whatsapp_number: '',
  faculty: '',
  department: '',
  degree_program: '',
  student_id: '',
  grade: '',
  is_bis: false,
  is_leader: isLeader,
});

const defaultValues: RegistrationFormValues = {
  competition_category: 'inter_university',
  team_name: '',
  institution_name: '',
  teacher_in_charge: '',
  guardian_contact: '',
  members: [emptyMember(true), emptyMember(), emptyMember()],
};

const steps = [
  'Competition Category',
  'Team Details',
  'Team Members',
  'Review',
  'Submit',
];

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const categoryId = watch('competition_category');
  const members = watch('members');
  const selectedCategory = COMPETITIONS[categoryId];
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'members',
  });

  useEffect(() => {
    let mounted = true;
    const loadCsrf = async () => {
      try {
        const res = await fetch('/api/registration', {
          cache: 'no-store',
          credentials: 'include',
        });
        const json = await res.json();
        if (mounted && json?.csrfToken) setCsrfToken(json.csrfToken);
      } catch {}
    };
    loadCsrf();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const updateClosed = (closeAt = DHACK_2026_CONFIG.registrationCloseAt) => {
      if (mounted) {
        setRegistrationClosed(Date.now() >= new Date(closeAt).getTime());
      }
    };

    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' });
        const json = await res.json();
        updateClosed(json?.settings?.registrationCloseAt);
      } catch {
        updateClosed();
      }
    };

    loadConfig();
    const id = setInterval(loadConfig, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const target = COMPETITIONS[categoryId];
    const nextMembers = [...members];
    while (nextMembers.length < target.minMembers) nextMembers.push(emptyMember());
    while (nextMembers.length > target.maxMembers) nextMembers.pop();
    nextMembers[0] = { ...nextMembers[0], is_leader: true };
    for (let index = 1; index < nextMembers.length; index += 1) {
      nextMembers[index] = { ...nextMembers[index], is_leader: false };
    }
    if (categoryId === 'rebrand') {
      setValue('institution_name', USJ);
      nextMembers.forEach((member, index) => {
        member.faculty = FMSC_FACULTY;
        member.is_bis = index < 3 ? true : member.is_bis;
        member.department = member.is_bis ? BIS_DEPARTMENT : member.department;
      });
    } else if (categoryId === 'inter_school') {
      setValue('teacher_in_charge', '');
      setValue('guardian_contact', '');
    }
    replace(nextMembers);
    // The effect intentionally reacts only to category changes; including members
    // would re-run after every replace and make the form jump while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const fieldsForStep = (currentStep: number) => {
    if (currentStep === 0) return ['competition_category'] as const;
    if (currentStep === 1) {
      const base =
        categoryId === 'inter_school'
          ? (['institution_name'] as const)
          : (['team_name', 'institution_name'] as const);
      return categoryId === 'inter_school'
        ? [...base, 'teacher_in_charge', 'guardian_contact']
        : base;
    }
    if (currentStep === 2) return ['members'] as const;
    return undefined;
  };

  const next = async () => {
    const stepFields = fieldsForStep(step);
    const ok = await trigger(stepFields as any);
    if (ok) setStep(current => Math.min(current + 1, steps.length - 1));
  };

  const back = () => setStep(current => Math.max(current - 1, 0));

  const onSubmit = async (values: RegistrationFormValues) => {
    setError(null);
    setSuccess(null);
    if (registrationClosed) {
      setError('Registration Closed');
      return;
    }
    const recaptchaToken = recaptchaSiteKey ? recaptchaRef.current?.getValue() : '';
    if (recaptchaSiteKey && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    const response = await fetch('/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...values,
        team_name:
          values.competition_category === 'inter_school'
            ? values.institution_name
            : values.team_name,
        recaptchaToken,
        csrfToken,
      }),
    });
    const data = await response.json();
    recaptchaRef.current?.reset();

    if (!response.ok) {
      setError(data?.error || data?.message || 'Registration failed.');
      return;
    }

    setSuccess(
      `Registered successfully. Your team ID is ${data?.data?.team_id || data?.team_id}.`
    );
    setStep(4);
  };

  const memberError = useMemo(
    () =>
      typeof errors.members?.message === 'string'
        ? errors.members.message
        : errors.members?.root?.message,
    [errors.members]
  );

  return (
    <Card className='bg-background/80 border-dhack-teal/30 backdrop-blur-sm'>
      <CardContent className='space-y-6 pt-6'>
        {registrationClosed && (
          <div className='rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-center font-semibold text-red-300'>
            Registration Closed
          </div>
        )}
        <ol className='grid grid-cols-2 gap-2 text-xs sm:grid-cols-5'>
          {steps.map((item, index) => (
            <li
              key={item}
              className={`rounded-md border px-2 py-2 text-center ${
                index === step
                  ? 'border-dhack-teal bg-dhack-teal/15 text-dhack-teal'
                  : 'border-dhack-teal/20 text-muted-foreground'
              }`}
            >
              {item}
            </li>
          ))}
        </ol>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {step === 0 && (
            <div className='space-y-4'>
              <Label>Competition category</Label>
              <Controller
                control={control}
                name='competition_category'
                render={({ field }) => (
                  <Select
                    options={categoryOptions}
                    value={field.value}
                    onChange={value => field.onChange(value as CompetitionCategory)}
                  />
                )}
              />
              <div className='grid gap-4 md:grid-cols-3'>
                {Object.values(COMPETITIONS).map(category => (
                  <button
                    key={category.id}
                    type='button'
                    onClick={() => setValue('competition_category', category.id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      category.id === categoryId
                        ? 'border-dhack-teal bg-dhack-teal/10'
                        : 'border-dhack-teal/20 hover:border-dhack-orange/60'
                    }`}
                  >
                    <div className='font-semibold text-foreground'>
                      {category.title}
                    </div>
                    <p className='mt-2 text-sm text-muted-foreground'>
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className='grid gap-4 md:grid-cols-2'>
              {categoryId !== 'inter_school' && (
                <Field
                  control={control}
                  name='team_name'
                  label='Unique team name'
                />
              )}
              <Field
                control={control}
                name='institution_name'
                label={
                  categoryId === 'inter_school'
                    ? 'School name'
                    : categoryId === 'inter_university'
                      ? 'University'
                      : 'University'
                }
                disabled={categoryId === 'rebrand'}
              />
              {categoryId === 'inter_school' && (
                <>
                  <Field
                    control={control}
                    name='teacher_in_charge'
                    label='Teacher in charge'
                  />
                  <Field
                    control={control}
                    name='guardian_contact'
                    label='Parent / guardian contact'
                    digitsOnly
                  />
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className='space-y-4'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h3 className='text-lg font-semibold'>Team members</h3>
                  <p className='text-sm text-muted-foreground'>
                    {selectedCategory.exactMembers
                      ? `Exactly ${selectedCategory.exactMembers} members required.`
                      : `${selectedCategory.minMembers}-${selectedCategory.maxMembers} members allowed.`}
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  disabled={fields.length >= selectedCategory.maxMembers}
                  onClick={() => append(emptyMember())}
                >
                  Add Member
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='rounded-lg border border-dhack-teal/20 p-4'
                >
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='font-semibold'>
                      {index === 0 ? 'Team leader' : `Member ${index + 1}`}
                    </div>
                    {index > 0 && fields.length > selectedCategory.minMembers && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <Field control={control} name={`members.${index}.full_name`} label='Full name' />
                    <Field control={control} name={`members.${index}.email`} label='Email' type='email' />
                    <Field control={control} name={`members.${index}.whatsapp_number`} label='WhatsApp' digitsOnly />
                    {categoryId === 'inter_school' ? (
                      <Field control={control} name={`members.${index}.grade`} label='Grade' />
                    ) : (
                      <>
                        <Field
                          control={control}
                          name={`members.${index}.faculty`}
                          label='Faculty'
                          disabled={categoryId === 'rebrand'}
                        />
                        <Field control={control} name={`members.${index}.department`} label='Department' />
                        <Field control={control} name={`members.${index}.degree_program`} label='Degree program' />
                        <Field
                          control={control}
                          name={`members.${index}.student_id`}
                          label={categoryId === 'rebrand' ? 'CPM NO' : 'Student ID'}
                        />
                      </>
                    )}
                    {categoryId === 'rebrand' && (
                      <label className='flex items-center gap-2 rounded-md border border-dhack-teal/20 px-3 py-2 text-sm'>
                        <Controller
                          control={control}
                          name={`members.${index}.is_bis`}
                          render={({ field }) => (
                            <input
                              type='checkbox'
                              checked={field.value}
                              onChange={event => {
                                field.onChange(event.target.checked);
                                if (event.target.checked) {
                                  setValue(
                                    `members.${index}.department`,
                                    BIS_DEPARTMENT
                                  );
                                }
                              }}
                            />
                          )}
                        />
                        BIS student
                      </label>
                    )}
                  </div>
                </div>
              ))}
              {memberError && <p className='text-sm text-red-400'>{memberError}</p>}
            </div>
          )}

          {step === 3 && (
            <div className='space-y-4 rounded-lg border border-dhack-teal/20 p-4 text-sm'>
              <ReviewRow label='Category' value={selectedCategory.title} />
              <ReviewRow
                label={categoryId === 'inter_school' ? 'School' : 'Team'}
                value={
                  categoryId === 'inter_school'
                    ? watch('institution_name')
                    : watch('team_name')
                }
              />
              {categoryId !== 'inter_school' && (
                <ReviewRow
                  label='Institution'
                  value={watch('institution_name')}
                />
              )}
              <ReviewRow label='Members' value={`${members.length}`} />
            </div>
          )}

          {step === 4 && success && (
            <div className='rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-green-300'>
              {success}
            </div>
          )}

          {error && <div className='text-sm text-red-400'>{error}</div>}
          {Object.keys(errors).length > 0 && step !== 4 && (
            <div className='text-sm text-red-400'>
              Please complete the highlighted required fields before continuing.
            </div>
          )}

          {step === 3 && recaptchaSiteKey && (
            <div className='flex justify-center overflow-hidden py-2'>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                size='normal'
                theme='light'
              />
            </div>
          )}

          <div className='flex gap-3'>
            {step > 0 && step < 4 && (
              <Button type='button' variant='outline' onClick={back}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button type='button' onClick={next} className='ml-auto'>
                Continue
              </Button>
            )}
            {step === 3 && (
              <Button
                type='submit'
                disabled={isSubmitting || registrationClosed}
                className='ml-auto'
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  control,
  name,
  label,
  type = 'text',
  disabled,
  digitsOnly,
}: {
  control: any;
  name: any;
  label: string;
  type?: string;
  disabled?: boolean;
  digitsOnly?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            value={String(field.value ?? '')}
            type={type}
            disabled={disabled}
            onChange={event =>
              field.onChange(
                digitsOnly
                  ? event.target.value.replace(/\D/g, '').slice(0, 10)
                  : event.target.value
              )
            }
            aria-label={label}
          />
        )}
      />
    </div>
  );
}

function TextAreaField({
  control,
  name,
  label,
}: {
  control: any;
  name: any;
  label: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <textarea
            {...field}
            value={String(field.value ?? '')}
            className='min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-dhack-orange/30 focus:outline-none'
            aria-label={label}
          />
        )}
      />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className='grid gap-1 sm:grid-cols-[180px_1fr]'>
      <div className='text-muted-foreground'>{label}</div>
      <div className='text-foreground'>{value || '-'}</div>
    </div>
  );
}
