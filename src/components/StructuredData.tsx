import React from 'react';

const StructuredData: React.FC = () => {
  const eventData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: "DHACK'26 - Sri Lanka AI Innovation Hackathon",
    description:
      "Join DHACK'26, a multi-category AI innovation hackathon for university teams, school students, and ReBrand participants.",
    startDate: '2026-07-08T00:00:00+05:30',
    endDate: '2026-09-12T23:59:59+05:30',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'University of Sri Jayewardenepura',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'LK',
        addressRegion: 'Western Province',
        addressLocality: 'Colombo',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: "DHACK'26 Team",
      url: 'https://dhack.lk',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'LKR',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-07-08',
      url: 'https://dhack.lk',
    },
    performer: {
      '@type': 'Organization',
      name: "DHACK'26 Team",
    },
    image: 'https://dhack.lk/favicon.svg',
    url: 'https://dhack.lk',
    sameAs: ['https://dhack.lk'],
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Event Type',
        value: 'Hackathon',
      },
      {
        '@type': 'PropertyValue',
        name: 'Target Audience',
        value: 'School Students, University Students, Designers, Developers',
      },
      {
        '@type': 'PropertyValue',
        name: 'Prize Pool',
        value: 'LKR 100,000',
      },
    ],
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "DHACK'26",
    url: 'https://dhack.lk',
    logo: 'https://dhack.lk/favicon.svg',
    sameAs: ['https://dhack.lk'],
    description:
      'A Sri Lankan AI innovation hackathon bringing together school and university participants for sustainable digital solutions.',
    foundingDate: '2026',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: 'https://dhack.lk',
    },
  };

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "DHACK'26",
    url: 'https://dhack.lk',
    description:
      "Join DHACK'26, Sri Lanka's multi-category AI innovation hackathon.",
    publisher: {
      '@type': 'Organization',
      name: "DHACK'26 Team",
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://dhack.lk/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventData) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
};

export default StructuredData;
