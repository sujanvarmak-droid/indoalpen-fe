import { z } from 'zod';
import type { FlowConfig } from '../../packages/submission-flow/types/config';

export const publishJourneyConfig: FlowConfig = {
  id: 'author-submission-journey',
  title: 'Submit Your Manuscript',
  steps: [
    {
      id: 'article-type',
      title: 'Article Type',
      type: 'form',
      description: 'Select the type of article you are submitting.',
      fields: [
        {
          id: 'articleType',
          type: 'select',
          label: 'Article Type',
          required: true,
          options: [
            { value: 'GRA-RE', label: 'Graduate Research' },
            { value: 'ENG-INN-RES', label: 'Engineering Innovation & Research' },
            { value: 'TRA-BIO-ENG', label: 'Translational Biomedical Engineering' },
            { value: 'HEA-IMP-RES', label: 'Hearing Implant Research' },
            { value: 'DEN-IMP-RES', label: 'Dental Implant Research' },
            { value: 'MAN-STU', label: 'Management Studies' },
            { value: 'SCI-FOR-KIDS', label: 'Science for Kids' },
          ],
          validation: z.string({ required_error: 'Please select an article type' }),
        },
      ],
    },
    {
      id: 'author-guidelines',
      title: 'Author Guidelines',
      type: 'form',
      description: 'Please read and confirm you have reviewed the author guidelines before proceeding.',
      fields: [
        {
          id: 'guidelinesLink',
          type: 'link',
          label: 'Author Guidelines',
          linkHref: 'https://journal.medpublish.com/author-guidelines',
          hint: 'Open and read the guidelines before confirming below.',
          required: false,
        },
        {
          id: 'guidelinesAgreed',
          type: 'radio',
          label: 'I confirm I have read and understood the Author Guidelines',
          required: true,
          options: [{ value: 'yes', label: 'Yes, I agree to comply with the Author Guidelines' }],
          validation: z.literal('yes', {
            errorMap: () => ({ message: 'You must confirm you have read the Author Guidelines' }),
          }),
        },
      ],
    },
    {
      id: 'authors',
      title: 'Authors',
      type: 'form',
      description: 'Add all authors of this manuscript. At least one corresponding author is required.',
      fields: [
        {
          id: 'authorList',
          type: 'repeatable',
          label: 'Author List',
          required: true,
          repeatable: {
            minItems: 1,
            maxItems: 30,
            addLabel: '+ Add Author',
            fields: [
              {
                id: 'email',
                type: 'text',
                label: 'Email Address',
                placeholder: 'author@institution.com',
                required: true,
                validation: z.string().email('Enter a valid email address'),
              },
              {
                id: 'firstName',
                type: 'text',
                label: 'First Name',
                placeholder: 'Jane',
                required: true,
                validation: z.string().min(1, 'First name is required'),
              },
              {
                id: 'lastName',
                type: 'text',
                label: 'Last Name',
                placeholder: 'Smith',
                required: true,
                validation: z.string().min(1, 'Last name is required'),
              },
              {
                id: 'affiliation',
                type: 'text',
                label: 'Affiliation / Institution',
                placeholder: 'University of Medicine, New Delhi',
                required: true,
                validation: z.string().min(2, 'Affiliation is required'),
              },
              {
                id: 'role',
                type: 'select',
                label: 'Author Role',
                required: true,
                options: [
                  { value: 'corresponding', label: 'Corresponding Author' },
                  { value: 'submitting', label: 'Submitting Author / Secretary' },
                  { value: 'co-author', label: 'Co-author' },
                ],
                validation: z.string({ required_error: 'Select a role for this author' }),
              },
            ],
          },
          validation: z
            .array(
              z.object({
                email: z.string().email('Valid email required'),
                firstName: z.string().min(1, 'First name required'),
                lastName: z.string().min(1, 'Last name required'),
                affiliation: z.string().min(2, 'Affiliation required'),
                role: z.enum(['corresponding', 'submitting', 'co-author'], {
                  errorMap: () => ({ message: 'Select a role' }),
                }),
              })
            )
            .min(1, 'At least one author is required')
            .refine((authors) => authors.some((a) => a.role === 'corresponding'), {
              message: 'At least one Corresponding Author is required',
            }),
          defaultValue: [{ email: '', firstName: '', lastName: '', affiliation: '', role: '' }],
        },
      ],
    },
    {
      id: 'manuscript-details',
      title: 'Manuscript Details',
      type: 'form',
      description: 'Provide the core metadata for your manuscript.',
      fields: [
        {
          id: 'manuscriptTitle',
          type: 'text',
          label: 'Manuscript Title',
          placeholder: 'Full title of your manuscript',
          required: true,
          validation: z.string().min(10, 'Title must be at least 10 characters').max(500, 'Title must not exceed 500 characters'),
        },
        {
          id: 'runningTitle',
          type: 'text',
          label: 'Running Title',
          placeholder: 'Short title (max 60 characters) for page headers',
          required: true,
          hint: 'A shortened version of the title used in page headers. Max 60 characters.',
          validation: z.string().min(3, 'Running title is required').max(60, 'Running title must not exceed 60 characters'),
        },
        {
          id: 'abstract',
          type: 'textarea',
          label: 'Abstract',
          placeholder: 'Provide a structured abstract (max 300 words)',
          required: true,
          hint: 'Maximum 300 words.',
          validation: z
            .string()
            .min(50, 'Abstract must be at least 50 words')
            .refine((val) => val.trim().split(/\s+/).length <= 300, { message: 'Abstract must not exceed 300 words' }),
        },
        {
          id: 'keywords',
          type: 'tags',
          label: 'Keywords',
          placeholder: 'Type a keyword and press Enter',
          required: true,
          hint: 'Add 3-10 keywords that best describe your manuscript.',
          validation: z.array(z.string().min(1)).min(3, 'Add at least 3 keywords').max(10, 'Maximum 10 keywords allowed'),
          defaultValue: [],
        },
        {
          id: 'fundingSource',
          type: 'textarea',
          label: 'Funding Source',
          placeholder: 'e.g. This study was funded by... (leave blank if not applicable)',
          required: false,
          hint: 'Optional. Declare funding sources for this research.',
          validation: z.string().max(500, 'Max 500 characters').optional(),
        },
        {
          id: 'apcAgreed',
          type: 'radio',
          label: 'Article Processing Charge (APC) Agreement',
          required: true,
          hint: 'By proceeding, you agree to pay the applicable APC upon acceptance.',
          options: [{ value: 'yes', label: 'I agree to the Article Processing Charge (APC) terms' }],
          validation: z.literal('yes', {
            errorMap: () => ({ message: 'You must agree to the APC terms to proceed' }),
          }),
        },
      ],
    },
    {
      id: 'files',
      title: 'File Upload',
      type: 'upload',
      description: 'Upload your manuscript file and any accompanying figures or videos.',
      uploadFields: [
        {
          id: 'manuscript',
          label: 'Manuscript File',
          mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          maxMb: 20,
          maxFiles: 1,
          required: true,
          hint: 'DOC or DOCX only. Max 20 MB. Do not include author names (blind review).',
        },
        {
          id: 'figures',
          label: 'Figures',
          mimeTypes: ['image/tiff', 'image/png', 'image/jpeg'],
          maxMb: 50,
          maxFiles: 20,
          required: false,
          hint: 'TIFF or PNG preferred. Min 300 DPI for print. Optional.',
        },
        {
          id: 'video',
          label: 'Supplementary Video',
          mimeTypes: ['application/zip', 'application/x-zip-compressed'],
          maxMb: 200,
          maxFiles: 1,
          required: false,
          hint: 'ZIP archive containing video files. Max 200 MB. Optional.',
        },
      ],
    },
    {
      id: 'reviewer-suggestion',
      title: 'Suggest Reviewers',
      type: 'form',
      description: 'Optionally suggest peer reviewers for your manuscript. All suggestions are advisory only.',
      fields: [
        {
          id: 'suggestedReviewers',
          type: 'repeatable',
          label: 'Suggested Reviewers',
          required: false,
          repeatable: {
            minItems: 0,
            maxItems: 5,
            addLabel: '+ Suggest a Reviewer',
            fields: [
              {
                id: 'reviewerName',
                type: 'text',
                label: 'Reviewer Full Name',
                placeholder: 'Dr. John Doe',
                required: false,
                validation: z.string().optional(),
              },
              {
                id: 'reviewerEmail',
                type: 'text',
                label: 'Reviewer Email',
                placeholder: 'reviewer@university.edu',
                required: false,
                validation: z.string().email('Enter a valid email').optional().or(z.literal('')),
              },
              {
                id: 'reviewerAffiliation',
                type: 'text',
                label: 'Reviewer Affiliation',
                placeholder: 'Department, Institution, Country',
                required: false,
                validation: z.string().optional(),
              },
            ],
          },
          validation: z
            .array(
              z.object({
                reviewerName: z.string().optional(),
                reviewerEmail: z.string().email().optional().or(z.literal('')),
                reviewerAffiliation: z.string().optional(),
              })
            )
            .optional(),
          defaultValue: [],
        },
      ],
    },
    {
      id: 'additional-info',
      title: 'Additional Information',
      type: 'form',
      description: 'Provide a cover letter and complete the mandatory declaration.',
      fields: [
        {
          id: 'coverLetter',
          type: 'textarea',
          label: 'Cover Letter',
          placeholder: 'Dear Editor-in-Chief, I am pleased to submit our manuscript...',
          required: true,
          hint: 'Address the Editor-in-Chief. Explain the significance of your research and why it is suitable for this journal.',
          validation: z.string().min(100, 'Cover letter must be at least 100 characters').max(5000, 'Cover letter must not exceed 5000 characters'),
        },
        {
          id: 'declaration',
          type: 'radio',
          label: 'Author Declaration',
          required: true,
          hint: 'By selecting Yes, all authors confirm that: the work is original and not under review elsewhere; all authors have approved this submission; and there are no undisclosed conflicts of interest.',
          options: [
            {
              value: 'yes',
              label: 'I confirm all authors have approved this submission and declare no undisclosed conflicts of interest',
            },
          ],
          validation: z.literal('yes', {
            errorMap: () => ({ message: 'The author declaration is mandatory' }),
          }),
        },
      ],
    },
    {
      id: 'review',
      title: 'Review & Submit',
      type: 'review',
    },
  ],
  submit: {
    payloadMap: {
      'article-type.articleType': 'articleType',
      'author-guidelines.guidelinesAgreed': 'guidelinesAgreed',
      'authors.authorList': 'authors',
      'manuscript-details.manuscriptTitle': 'title',
      'manuscript-details.runningTitle': 'runningTitle',
      'manuscript-details.abstract': 'abstract',
      'manuscript-details.keywords': 'keywords',
      'manuscript-details.fundingSource': 'fundingSource',
      'manuscript-details.apcAgreed': 'apcAgreed',
      'files.manuscript': 'manuscriptUrl',
      'files.figures': 'figureUrls',
      'files.video': 'videoUrl',
      'reviewer-suggestion.suggestedReviewers': 'suggestedReviewers',
      'additional-info.coverLetter': 'coverLetter',
      'additional-info.declaration': 'declaration',
    },
  },
};
