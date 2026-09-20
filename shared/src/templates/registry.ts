import { TemplateDefinition } from '../types';
import { MARGIN_PRESETS } from '../constants';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'professional-business',
    name: 'Professional Business',
    category: 'Business',
    description: 'Corporate executive layout with distinguished serif headers, clean divider accents, and formal header/footer.',
    thumbnail: '/templates/professional-business.svg',
    badge: 'Popular',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'normal',
      margins: MARGIN_PRESETS.normal,
      colors: {
        primary: '#1E293B',
        secondary: '#FFA259',
        accent: '#FFCB56',
        background: '#FFFFFF',
        text: '#1E293B',
        surface: '#F8FAFC',
      },
      typography: {
        headingFont: 'Merriweather, Georgia, serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 11,
        lineHeight: 1.6,
      },
      header: {
        enabled: true,
        companyName: 'APEX ENTERPRISE GROUP',
        documentTitle: 'EXECUTIVE BRIEFING',
        align: 'split',
        borderBottom: true,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_OF_TOTAL',
        website: 'www.apexenterprisegroup.com',
        email: 'briefings@apexgroup.com',
        align: 'split',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'Strategic Corporate Overview',
      pages: [
        {
          contentHtml: `
            <h1 style="color: #1E293B; border-bottom: 2px solid #FFA259; padding-bottom: 8px;">Executive Strategic Briefing</h1>
            <p style="font-size: 1.1em; color: #475569; font-weight: 500;">Fiscal Year Growth Targets, Capital Allocation, and Operational Priorities</p>
            <hr />
            <h2>1. Executive Summary</h2>
            <p>During the preceding quarter, our organization achieved record enterprise growth, driven by key investments in digital infrastructure and sustainable supply chain operations. Total annualized revenue expanded by <strong>34.8%</strong> year-over-year.</p>
            
            <h2>2. Key Operational Highlights</h2>
            <ul>
              <li><strong>Market Expansion:</strong> Successfully penetrated 3 major European tier-1 metropolitan markets.</li>
              <li><strong>Operational Margin Improvement:</strong> Reduced overhead expenditure by 14% via intelligent automated workflows.</li>
              <li><strong>Customer Retention:</strong> Attained a peak Net Promoter Score (NPS) of 78 points across enterprise accounts.</li>
            </ul>

            <h2>3. Capital Deployment Strategy</h2>
            <p>We are allocating capital across three primary strategic pillars over the next 24 months:</p>
            <ol>
              <li>R&D automation and intelligent document intelligence platform.</li>
              <li>Talent acquisition in specialized engineering and client success.</li>
              <li>Global data compliance, security auditing, and SOC2 Type II certifications.</li>
            </ol>

            <blockquote style="border-left: 4px solid #FFA259; padding-left: 12px; margin: 16px 0; color: #334155; font-style: italic;">
              "Excellence is not an accident; it is the inevitable outcome of sustained discipline, rigorous architecture, and relentless customer dedication."
            </blockquote>
          `,
        },
      ],
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'Minimal',
    description: 'Ultra-clean Swiss design with crisp sans-serif typography, generous breathing room, and minimalist aesthetic.',
    thumbnail: '/templates/modern-minimal.svg',
    badge: 'Clean',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'wide',
      margins: MARGIN_PRESETS.wide,
      colors: {
        primary: '#0F172A',
        secondary: '#64748B',
        accent: '#FFA259',
        background: '#FFFFFF',
        text: '#0F172A',
        surface: '#FFFFFF',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 10.5,
        lineHeight: 1.7,
      },
      header: {
        enabled: true,
        documentTitle: 'STUDIO REPORT',
        align: 'left',
        borderBottom: false,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_ONLY',
        customText: 'DocuCraft Studio Edition',
        align: 'split',
        borderTop: false,
      },
    },
    sampleContent: {
      title: 'Minimalist Project Architecture',
      pages: [
        {
          contentHtml: `
            <h1 style="font-size: 2.4em; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 4px;">Form & Function</h1>
            <p style="color: #64748B; font-size: 1.05em; margin-top: 0;">An architectural manifesto on purposeful minimalism</p>
            <br />
            <h2>Philosophy</h2>
            <p>Simplicity is not the lack of clutter, that's simply a consequence of simplicity. Simplicity somehow essentially describes the purpose and place of an object and product.</p>
            
            <h2>Core Guidelines</h2>
            <ul>
              <li>Remove every visual element that does not provide clarity or purpose.</li>
              <li>Let typography and whitespace define hierarchy and structural rhythm.</li>
              <li>Preserve authentic material qualities and digital predictability.</li>
            </ul>

            <h2>System Principles</h2>
            <p>Every decision in this system must withstand scrutiny: does it assist the reader in absorbing knowledge, or does it distract them with unnecessary decoration?</p>
          `,
        },
      ],
    },
  },
  {
    id: 'academic',
    name: 'Academic Research Paper',
    category: 'Academic',
    description: 'Rigorous scholarly formatting with formal serif type, structured abstract box, numbered sections, and citations.',
    thumbnail: '/templates/academic.svg',
    defaultSettings: {
      pageSize: 'Letter',
      orientation: 'portrait',
      marginPreset: 'normal',
      margins: MARGIN_PRESETS.normal,
      colors: {
        primary: '#111827',
        secondary: '#374151',
        accent: '#4B5563',
        background: '#FFFFFF',
        text: '#111827',
        surface: '#F9FAFB',
      },
      typography: {
        headingFont: 'Merriweather, Georgia, serif',
        bodyFont: 'Merriweather, Georgia, serif',
        baseFontSize: 10,
        lineHeight: 1.8,
      },
      header: {
        enabled: true,
        companyName: 'JOURNAL OF COMPUTATIONAL METHODOLOGIES',
        documentTitle: 'Vol. 14, Issue 3',
        align: 'split',
        borderBottom: true,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_OF_TOTAL',
        customText: 'Peer Reviewed Publication',
        align: 'split',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'A Comparative Study of Document Generation Architectures',
      pages: [
        {
          contentHtml: `
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-size: 1.8em; margin-bottom: 8px;">Analysis of Deterministic Paged Media Rendering</h1>
              <p style="font-size: 0.95em; color: #374151;">Dr. Elena Vance, Department of Computer Systems Engineering<br />Institute of Advanced Computational Studies</p>
            </div>

            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
              <h3 style="margin-top: 0; font-size: 1em; text-transform: uppercase; letter-spacing: 0.05em;">Abstract</h3>
              <p style="font-size: 0.9em; margin-bottom: 0;">This paper investigates deterministic approaches for translating dynamic rich-text AST structures into high-fidelity PDF documents. We demonstrate that combining declarative CSS Paged Media standards with headless vector engines eliminates font metrics divergence and layout degradation across heterogeneous environments.</p>
            </div>

            <h2>1. Introduction</h2>
            <p>The translation of unbounded hypertext into bounded, printable page surfaces presents unique algorithmic challenges. Traditional solutions frequently suffer from awkward page breaks, orphaned headings, and degraded typographical kerning.</p>

            <h2>2. Methodology</h2>
            <p>We evaluated three distinct rendering paradigms across a corpus of 10,000 synthetic multi-page manuscripts:</p>
            <ol>
              <li>Client-side canvas rasterization with JPEG embedding.</li>
              <li>Direct binary PDF stream compilation via postscript primitives.</li>
              <li>Declarative CSS Paged Media with vector-preserving headless engines.</li>
            </ol>
          `,
        },
      ],
    },
  },
  {
    id: 'business-proposal',
    name: 'Business Proposal',
    category: 'Business',
    description: 'High-converting client proposal template with Warm Orange accent banners, scope of work cards, and signature blocks.',
    thumbnail: '/templates/business-proposal.svg',
    badge: 'High Impact',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'normal',
      margins: MARGIN_PRESETS.normal,
      colors: {
        primary: '#1E1E24',
        secondary: '#FFA259',
        accent: '#FFCB56',
        background: '#FFFFFF',
        text: '#1E1E24',
        surface: '#FFFDF7',
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 11,
        lineHeight: 1.6,
      },
      header: {
        enabled: true,
        companyName: 'DOCUCRAFT SOLUTIONS',
        documentTitle: 'CLIENT PROJECT PROPOSAL',
        align: 'split',
        borderBottom: true,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_OF_TOTAL',
        customText: 'Confidential & Proprietary',
        website: 'proposals.docucraft.io',
        align: 'split',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'Enterprise Transformation Proposal',
      pages: [
        {
          contentHtml: `
            <div style="background: linear-gradient(135deg, #FFEDB9, #FFCB56); padding: 20px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #FFA259;">
              <h1 style="margin: 0 0 6px 0; color: #1E1E24; font-size: 2em;">Client Services Proposal</h1>
              <p style="margin: 0; color: #4A3E1B; font-weight: 500;">Prepared for: Acme Global Enterprises | Date: October 2026</p>
            </div>

            <h2>1. Project Objective</h2>
            <p>We propose a comprehensive 8-week modernization program to streamline document workflows, implement automated PDF generation, and eliminate administrative friction across 12 distributed regional hubs.</p>

            <h2>2. Scope of Deliverables</h2>
            <ul>
              <li><strong>Milestone 1:</strong> Architecture assessment and template library design (Weeks 1-2).</li>
              <li><strong>Milestone 2:</strong> Secure backend API development & authentication integration (Weeks 3-5).</li>
              <li><strong>Milestone 3:</strong> End-user acceptance testing and production deployment (Weeks 6-8).</li>
            </ul>

            <h2>3. Investment & Authorization</h2>
            <p>All work is performed under our fixed-scope guarantee. Upon mutual signature below, project commencement initiates within five business days.</p>
            
            <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 18px; border-top: 2px dashed #E2E8F0;">
              <div style="width: 45%;">
                <p style="margin-bottom: 30px; font-weight: 600;">Authorized By (DocuCraft Solutions):</p>
                <div style="border-bottom: 1px solid #1E1E24; width: 100%; margin-bottom: 4px;"></div>
                <p style="font-size: 0.85em; color: #64748B; margin: 0;">Marcus Vance, VP Client Solutions</p>
              </div>
              <div style="width: 45%;">
                <p style="margin-bottom: 30px; font-weight: 600;">Accepted By (Acme Global Enterprises):</p>
                <div style="border-bottom: 1px solid #1E1E24; width: 100%; margin-bottom: 4px;"></div>
                <p style="font-size: 0.85em; color: #64748B; margin: 0;">Name & Date</p>
              </div>
            </div>
          `,
        },
      ],
    },
  },
  {
    id: 'marketing-flyer',
    name: 'Marketing Flyer',
    category: 'Marketing',
    description: 'Vibrant promotional flyer with Coral and Gold callouts, product feature badges, and high-conversion layout.',
    thumbnail: '/templates/marketing-flyer.svg',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'narrow',
      margins: MARGIN_PRESETS.narrow,
      colors: {
        primary: '#1E1E24',
        secondary: '#FFA259',
        accent: '#FF7E7E',
        background: '#FFFFFF',
        text: '#1E1E24',
        surface: '#FFF8F0',
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 11.5,
        lineHeight: 1.5,
      },
      header: {
        enabled: false,
        align: 'center',
        borderBottom: false,
      },
      footer: {
        enabled: true,
        showPageNumbers: false,
        pageNumberFormat: 'PAGE_ONLY',
        customText: 'Visit us online: www.docucraft.io | Special introductory pricing',
        align: 'center',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'Next-Gen Document Studio Launch',
      pages: [
        {
          contentHtml: `
            <div style="text-align: center; background: #1E1E24; color: #FFFFFF; padding: 28px 20px; border-radius: 12px; margin-bottom: 24px;">
              <span style="background: #FF7E7E; color: #FFFFFF; padding: 4px 12px; border-radius: 9999px; font-size: 0.8em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Special Release</span>
              <h1 style="color: #FFCB56; font-size: 2.6em; margin: 12px 0 6px 0; font-weight: 800;">Turn Text Into Gold</h1>
              <p style="color: #E2E8F0; font-size: 1.15em; max-width: 500px; margin: 0 auto;">Build magazine-quality, printable PDFs in seconds with zero design headaches.</p>
            </div>

            <h2>Why Choose DocuCraft?</h2>
            <p>Say goodbye to clunky word processors and complex desktop publishing tools. Paste your notes, choose a template, and watch your ideas turn into polished deliverables instantly.</p>

            <div style="background: #FFF8F0; border: 1px solid #FFA259; border-radius: 8px; padding: 16px; margin: 18px 0;">
              <h3 style="margin-top: 0; color: #1E1E24;">✨ Key Advantages</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>100% Vector PDF Output:</strong> Razor sharp on every screen and physical print.</li>
                <li><strong>Dynamic Header & Footer Support:</strong> Automated page numbering and custom company branding.</li>
                <li><strong>Full Rich-Text Power:</strong> Real TipTap editor with tables, images, and live preview.</li>
              </ul>
            </div>

            <h2>Claim Your Access Today</h2>
            <p>Start your free workspace now. No credit card required. Upgrade anytime as your team grows.</p>
          `,
        },
      ],
    },
  },
  {
    id: 'event-pamphlet',
    name: 'Event Pamphlet & Agenda',
    category: 'Marketing',
    description: 'Structured event schedule and conference guide with time slots, keynote speaker highlights, and venue details.',
    thumbnail: '/templates/event-pamphlet.svg',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'normal',
      margins: MARGIN_PRESETS.normal,
      colors: {
        primary: '#1E293B',
        secondary: '#FFA259',
        accent: '#FFCB56',
        background: '#FFFFFF',
        text: '#1E293B',
        surface: '#F8FAFC',
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 11,
        lineHeight: 1.6,
      },
      header: {
        enabled: true,
        companyName: 'GLOBAL INNOVATION SUMMIT 2026',
        documentTitle: 'OFFICIAL PROGRAM GUIDE',
        align: 'split',
        borderBottom: true,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_OF_TOTAL',
        customText: 'Conference Venue: Grand Metropole Hall',
        website: 'summit2026.org',
        align: 'split',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'Global Innovation Summit Agenda',
      pages: [
        {
          contentHtml: `
            <h1 style="color: #1E293B; margin-bottom: 4px;">Conference Schedule & Keynotes</h1>
            <p style="color: #64748B; font-weight: 500;">Grand Metropole Convention Center | October 24-25, 2026</p>
            <hr />

            <h2>Day 1: Morning Sessions</h2>
            <ul>
              <li><strong>08:30 AM - 09:30 AM:</strong> Attendee Registration, Networking Breakfast & Badge Pick-Up.</li>
              <li><strong>09:30 AM - 10:30 AM:</strong> Opening Keynote: <em>The Future of Algorithmic Typography</em> — Main Auditorium.</li>
              <li><strong>10:45 AM - 12:00 PM:</strong> Panel Discussion: Scaling Microservices with Deterministic Infrastructure.</li>
            </ul>

            <h2>Day 1: Afternoon Workshops</h2>
            <ul>
              <li><strong>01:30 PM - 03:00 PM:</strong> Hands-on Lab: Server-Side Headless PDF Pipeline Optimization.</li>
              <li><strong>03:15 PM - 04:30 PM:</strong> Security Deep Dive: Multi-tenant Data Protection and Zero-Trust Auth.</li>
              <li><strong>05:00 PM - 07:00 PM:</strong> Evening Networking Reception & Innovation Awards Showcase.</li>
            </ul>

            <div style="background: #FFEDB9; border-left: 4px solid #FFA259; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
              <strong>Attendee Note:</strong> High-speed Wi-Fi is available across all halls. Network name: <code>Summit2026-Guest</code> (Password: <code>InnovateFast</code>).
            </div>
          `,
        },
      ],
    },
  },
  {
    id: 'resume',
    name: 'Executive Resume / CV',
    category: 'Resume',
    description: 'Distinguished professional resume with contact info bar, chronological work history, and skills matrix.',
    thumbnail: '/templates/resume.svg',
    badge: 'Career',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'narrow',
      margins: MARGIN_PRESETS.narrow,
      colors: {
        primary: '#0F172A',
        secondary: '#FFA259',
        accent: '#FFCB56',
        background: '#FFFFFF',
        text: '#0F172A',
        surface: '#F8FAFC',
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 10,
        lineHeight: 1.5,
      },
      header: {
        enabled: false,
        align: 'left',
        borderBottom: false,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_OF_TOTAL',
        customText: 'Curriculum Vitae',
        align: 'split',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'Alexander Wright - Senior Principal Architect',
      pages: [
        {
          contentHtml: `
            <div style="border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 16px;">
              <h1 style="font-size: 2.2em; margin: 0; color: #0F172A;">Alexander Wright</h1>
              <p style="font-size: 1.1em; color: #FFA259; font-weight: 600; margin: 4px 0 8px 0;">Senior Principal Software Architect</p>
              <p style="font-size: 0.88em; color: #475569; margin: 0;">
                San Francisco, CA • alexander.wright@email.com • (555) 019-2834 • linkedin.com/in/alexwright • github.com/alexwright
              </p>
            </div>

            <h2 style="font-size: 1.2em; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">Professional Summary</h2>
            <p>Accomplished Principal Architect with 12+ years of experience engineering high-throughput distributed systems, modern web platforms, and document generation pipelines. Proven track record leading cross-functional teams of 30+ engineers and reducing system latency by 65%.</p>

            <h2 style="font-size: 1.2em; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">Work Experience</h2>
            <p style="margin-bottom: 2px;"><strong>Principal Systems Architect</strong> | CloudScale Technologies (2021 - Present)</p>
            <ul>
              <li>Architected enterprise document microservices processing 45M monthly PDF exports with 99.995% uptime SLA.</li>
              <li>Mentored 18 staff and senior engineers across distributed US and European development squads.</li>
            </ul>

            <p style="margin-bottom: 2px;"><strong>Lead Full-Stack Engineer</strong> | Horizon SaaS Systems (2017 - 2021)</p>
            <ul>
              <li>Spearheaded transition from legacy monolith to Next.js and event-driven backend microservices.</li>
              <li>Implemented automated SOC2 compliance monitoring and role-based access control (RBAC).</li>
            </ul>

            <h2 style="font-size: 1.2em; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">Core Competencies</h2>
            <p><strong>Languages & Frameworks:</strong> TypeScript, Node.js, Next.js, React, Python, PostgreSQL, Prisma, GraphQL.<br />
            <strong>Infrastructure:</strong> Docker, Kubernetes, AWS, Headless Chrome Pipelines, CI/CD, Micro-frontends.</p>
          `,
        },
      ],
    },
  },
  {
    id: 'certificate',
    name: 'Award / Certificate',
    category: 'Certificate',
    description: 'Formal award certificate with ornate borders, gold badge accents, recipient recognition, and signature areas.',
    thumbnail: '/templates/certificate.svg',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'landscape',
      marginPreset: 'wide',
      margins: MARGIN_PRESETS.wide,
      colors: {
        primary: '#1E1E24',
        secondary: '#FFA259',
        accent: '#FFCB56',
        background: '#FFFDF7',
        text: '#1E1E24',
        surface: '#FFFFFF',
      },
      typography: {
        headingFont: '"Playfair Display", Georgia, serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 12,
        lineHeight: 1.6,
      },
      header: {
        enabled: false,
        align: 'center',
        borderBottom: false,
      },
      footer: {
        enabled: true,
        showPageNumbers: false,
        pageNumberFormat: 'NUMBER_ONLY',
        customText: 'Verified Credential ID: DC-9842-CERT',
        align: 'center',
        borderTop: false,
      },
    },
    sampleContent: {
      title: 'Certificate of Excellence',
      pages: [
        {
          contentHtml: `
            <div style="border: 4px double #FFA259; padding: 36px 24px; text-align: center; border-radius: 8px; background: #FFFFFF;">
              <p style="font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.25em; color: #8C6D1F; margin-bottom: 6px;">DocuCraft Academy of Professional Arts</p>
              <h1 style="font-size: 2.8em; color: #1E1E24; margin: 4px 0 12px 0;">Certificate of Achievement</h1>
              <p style="font-size: 1.1em; color: #64748B; margin-bottom: 18px;">This credential is systematically awarded to</p>
              
              <h2 style="font-size: 2.2em; color: #FFA259; border-bottom: 2px solid #FFCB56; display: inline-block; padding: 0 40px 6px 40px; margin: 0 auto 18px auto;">Jordan Hayes</h2>
              
              <p style="font-size: 1.05em; color: #334155; max-width: 600px; margin: 0 auto 36px auto;">
                In formal recognition of outstanding performance, exemplary architectural craftsmanship, and successful mastery of Enterprise Document Engineering.
              </p>

              <div style="display: flex; justify-content: space-around; max-width: 700px; margin: 30px auto 0 auto;">
                <div style="width: 200px;">
                  <div style="border-bottom: 1px solid #1E1E24; margin-bottom: 6px;"></div>
                  <p style="font-size: 0.85em; color: #64748B; margin: 0;">Program Director</p>
                </div>
                <div style="width: 200px;">
                  <div style="border-bottom: 1px solid #1E1E24; margin-bottom: 6px;"></div>
                  <p style="font-size: 0.85em; color: #64748B; margin: 0;">Academic Dean</p>
                </div>
              </div>
            </div>
          `,
        },
      ],
    },
  },
  {
    id: 'company-report',
    name: 'Company Annual Report',
    category: 'Report',
    description: 'Comprehensive annual financial and operational review with data callouts, structured tables, and corporate styling.',
    thumbnail: '/templates/company-report.svg',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'normal',
      margins: MARGIN_PRESETS.normal,
      colors: {
        primary: '#1E293B',
        secondary: '#FFA259',
        accent: '#FFCB56',
        background: '#FFFFFF',
        text: '#1E293B',
        surface: '#F8FAFC',
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 11,
        lineHeight: 1.6,
      },
      header: {
        enabled: true,
        companyName: 'GLOBAL HOLDINGS CORP',
        documentTitle: 'ANNUAL PERFORMANCE REPORT',
        align: 'split',
        borderBottom: true,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_OF_TOTAL',
        customText: 'Audited Financial Statements',
        website: 'investors.globalholdings.com',
        align: 'split',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'Annual Performance Report',
      pages: [
        {
          contentHtml: `
            <div style="border-left: 6px solid #FFCB56; padding-left: 16px; margin-bottom: 24px;">
              <h1 style="margin: 0; font-size: 2.2em; color: #1E293B;">2026 Annual Report</h1>
              <p style="margin: 4px 0 0 0; color: #64748B; font-weight: 500;">A Comprehensive Review of Financial Position and Strategic Growth</p>
            </div>

            <h2>Financial Highlights Summary</h2>
            <p>Our consolidated revenue for fiscal year 2026 totaled <strong>$124.6 Million</strong>, representing an organic expansion of 28.4% across our primary software and document automation divisions.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.95em;">
              <thead>
                <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1; text-align: left;">
                  <th style="padding: 10px;">Division</th>
                  <th style="padding: 10px;">FY25 ($M)</th>
                  <th style="padding: 10px;">FY26 ($M)</th>
                  <th style="padding: 10px;">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px;">Enterprise Cloud Solutions</td>
                  <td style="padding: 10px;">$54.2M</td>
                  <td style="padding: 10px;">$73.8M</td>
                  <td style="padding: 10px; color: #059669; font-weight: 600;">+36.1%</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px;">Digital Document Automation</td>
                  <td style="padding: 10px;">$28.5M</td>
                  <td style="padding: 10px;">$38.4M</td>
                  <td style="padding: 10px; color: #059669; font-weight: 600;">+34.7%</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px;">Professional Advisory Services</td>
                  <td style="padding: 10px;">$14.3M</td>
                  <td style="padding: 10px;">$12.4M</td>
                  <td style="padding: 10px; color: #DC2626; font-weight: 600;">-13.2%</td>
                </tr>
              </tbody>
            </table>

            <h2>Outlook for FY2027</h2>
            <p>Management projects sustained acceleration supported by expanded product capabilities, geographic distribution partnerships, and deepened enterprise contract renewals.</p>
          `,
        },
      ],
    },
  },
  {
    id: 'creative',
    name: 'Creative Portfolio / Showcase',
    category: 'Creative',
    description: 'Bold expressive typography with warm color blocking, pull quotes, and showcase layout for creatives and agencies.',
    thumbnail: '/templates/creative.svg',
    badge: 'Artistic',
    defaultSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginPreset: 'normal',
      margins: MARGIN_PRESETS.normal,
      colors: {
        primary: '#1E1E24',
        secondary: '#FF7E7E',
        accent: '#FFCB56',
        background: '#FFFFFF',
        text: '#1E1E24',
        surface: '#FFF8F8',
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: 11,
        lineHeight: 1.6,
      },
      header: {
        enabled: true,
        companyName: 'STUDIO NOVA CREATIVE',
        documentTitle: 'PORTFOLIO & CASE STUDY',
        align: 'split',
        borderBottom: true,
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_OF_TOTAL',
        customText: 'Designed with DocuCraft Studio',
        website: 'studionova.design',
        align: 'split',
        borderTop: true,
      },
    },
    sampleContent: {
      title: 'Visual Identity & Digital Experience Case Study',
      pages: [
        {
          contentHtml: `
            <div style="background: linear-gradient(135deg, #FFEDB9 0%, #FF7E7E 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h1 style="color: #1E1E24; font-size: 2.3em; margin: 0 0 6px 0;">Redefining Brand Harmony</h1>
              <p style="color: #2D1B1B; font-weight: 600; margin: 0;">Case Study: Reimagining Human-Centric Software Interfaces</p>
            </div>

            <h2>The Creative Challenge</h2>
            <p>Modern software frequently sacrifices warmth and personality in favor of sterile corporate minimalism. Our objective was to prove that a product can be uncompromisingly functional while evoking genuine delight through tasteful color theory and tactile typography.</p>

            <blockquote style="font-size: 1.25em; border-left: 4px solid #FF7E7E; padding-left: 14px; margin: 24px 0; color: #1E1E24; font-weight: 500;">
              "Design is the silent ambassador of your values. It speaks before a single line of text is read."
            </blockquote>

            <h2>Selected Art Directions</h2>
            <ul>
              <li><strong>Earthy & Warm Foundations:</strong> Replacing cold grays with creamy highlights and sunlit yellows.</li>
              <li><strong>Rhythmic Typography:</strong> Pairing fluid sans-serif headings with high-legibility body typefaces.</li>
              <li><strong>Intentional Contrast:</strong> Using Coral accents sparingly to draw immediate, joyful focus.</li>
            </ul>
          `,
        },
      ],
    },
  },
];

export function getTemplateById(id: string): TemplateDefinition {
  const found = TEMPLATES.find((t) => t.id === id);
  return found || TEMPLATES[0];
}
