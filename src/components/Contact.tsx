'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { CONTACT } from '@/lib/constants';

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const persona1 = CONTACT.personas?.[0];
  const persona2 = CONTACT.personas?.[1];

  return (
    <section
      id='contact'
      className='relative py-16 md:py-20 bg-dhack-base overflow-hidden'
    >
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5 pointer-events-none'>
        <div className='absolute top-10 left-5 md:top-20 md:left-10 w-20 h-20 md:w-40 md:h-40 border border-dhack-teal/30 rounded-full' />
        <div className='absolute top-32 right-5 md:top-40 md:right-20 w-16 h-16 md:w-32 md:h-32 border border-dhack-orange/30 rounded-full' />
        <div className='absolute bottom-20 left-1/4 md:left-1/3 w-12 h-12 md:w-24 md:h-24 border border-dhack-accent/30 rounded-full' />
        <div className='absolute bottom-10 right-10 md:bottom-40 md:right-10 w-8 h-8 md:w-16 md:h-16 border border-dhack-teal/30 rounded-full' />
      </div>

      {/* Background Effects */}
      <div className='absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-dhack-orange/5 rounded-full blur-3xl pointer-events-none -z-10' />
      <div className='absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-dhack-teal/5 rounded-full blur-3xl pointer-events-none -z-10' />

      <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          className='space-y-12 md:space-y-16'
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className='text-center'>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4 md:mb-6'>
              Get in Touch
            </h2>
            <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4'>
              Have questions about DHACK&apos;26? Need assistance with
              registration or submissions? Our team is here to help you every
              step of the way.
            </p>
          </motion.div>

          {/* Contact Cards Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto'>
            {/* Contact Person 1 */}
            {persona1 && (
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className='group relative'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-dhack-orange/20 to-dhack-teal/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300' />
                <div className='relative bg-background/80 backdrop-blur-sm border border-dhack-teal/30 rounded-2xl p-6 md:p-8 hover:border-dhack-orange/50 transition-all duration-300'>
                  <div className='text-left'>
                    <h3 className='text-lg md:text-xl font-bold text-foreground mb-1'>
                      {persona1.role || 'Contact Person'}
                    </h3>
                    <p className='text-base md:text-lg font-semibold text-dhack-teal mb-4'>
                      {persona1.name}
                    </p>
                    <div className='space-y-4'>
                      <a
                        href={`tel:${persona1.phone}`}
                        className='flex items-center gap-3 text-sm md:text-base text-muted-foreground hover:text-dhack-orange transition-colors duration-300 font-medium'
                      >
                        <Phone className='w-4 h-4 text-dhack-teal' />
                        {persona1.phone}
                      </a>
                      {persona1.email && (
                        <a
                          href={`mailto:${persona1.email}`}
                          className='flex items-center gap-3 text-sm md:text-base text-muted-foreground hover:text-dhack-teal transition-colors duration-300 font-medium break-all'
                        >
                          <Mail className='w-4 h-4 text-dhack-teal' />
                          {persona1.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Person 2 */}
            {persona2 && (
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className='group relative'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-dhack-teal/20 to-dhack-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300' />
                <div className='relative bg-background/80 backdrop-blur-sm border border-dhack-teal/30 rounded-2xl p-6 md:p-8 hover:border-dhack-teal/50 transition-all duration-300'>
                  <div className='text-left'>
                    <h3 className='text-lg md:text-xl font-bold text-foreground mb-1'>
                      {persona2.role || 'Contact Person'}
                    </h3>
                    <p className='text-base md:text-lg font-semibold text-dhack-teal mb-4'>
                      {persona2.name}
                    </p>
                    <div className='space-y-4'>
                      <a
                        href={`tel:${persona2.phone}`}
                        className='flex items-center gap-3 text-sm md:text-base text-muted-foreground hover:text-dhack-orange transition-colors duration-300 font-medium'
                      >
                        <Phone className='w-4 h-4 text-dhack-teal' />
                        {persona2.phone}
                      </a>
                      {persona2.email && (
                        <a
                          href={`mailto:${persona2.email}`}
                          className='flex items-center gap-3 text-sm md:text-base text-muted-foreground hover:text-dhack-teal transition-colors duration-300 font-medium break-all'
                        >
                          <Mail className='w-4 h-4 text-dhack-teal' />
                          {persona2.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Call to Action */}
          <motion.div variants={itemVariants} className='text-center'>
            <div className='inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-dhack-orange/10 to-dhack-teal/10 rounded-full px-4 md:px-6 py-2 md:py-3 border border-dhack-teal/20'>
              <Clock className='w-4 h-4 md:w-5 md:h-5 text-dhack-teal' />
              <span className='text-sm md:text-base text-muted-foreground'>
                We&apos;re available to help you during DHACK&apos;26
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
